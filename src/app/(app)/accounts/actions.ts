"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { getI18n } from "@/lib/i18n/server";
import { dbErrorMessage } from "@/lib/db-errors";
import { parseAmountToSen } from "@/lib/money";
import { todayISO } from "@/lib/dates";
import { ACCOUNT_TYPES, type AccountType } from "@/lib/types";
import { getProvider, isProviderId } from "@/lib/providers";
import { isUuid, str, type FormState } from "@/lib/validation";

async function parseAccountForm(formData: FormData) {
  const { t } = await getI18n();
  const name = str(formData, "account_name", 60);
  // Built-in provider → store its id (and its name for exports);
  // otherwise keep the custom name the user typed.
  const providerId = str(formData, "provider", 40);
  const known = isProviderId(providerId) ? getProvider(providerId) : undefined;
  const provider = known?.id ?? null;
  const institution = known?.name ?? (str(formData, "institution", 60) || null);
  const type = str(formData, "type") as AccountType;
  const opening = parseAmountToSen(str(formData, "opening_balance") || "0", { allowNegative: true });

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = t.common.required;
  if (!ACCOUNT_TYPES.includes(type)) fieldErrors.type = t.common.required;
  if (opening === null) fieldErrors.opening_balance = t.common.invalidAmount;

  return { fieldErrors, values: { name, institution, provider, type, opening_balance: opening ?? 0 } };
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function createAccount(_: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser();
  const { t } = await getI18n();
  const { fieldErrors, values } = await parseAccountForm(formData);
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const { error } = await supabase.from("accounts").insert(values);
  if (error) return { error: dbErrorMessage(error, t, "createAccount") };
  refresh();
  redirect("/accounts");
}

export async function updateAccount(id: string, _: FormState, formData: FormData): Promise<FormState> {
  if (!isUuid(id)) return {};
  const { supabase } = await requireUser();
  const { t } = await getI18n();
  const { fieldErrors, values } = await parseAccountForm(formData);
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const { error } = await supabase.from("accounts").update(values).eq("id", id);
  if (error) return { error: dbErrorMessage(error, t, "updateAccount") };
  refresh();
  redirect(`/accounts/${id}`);
}

export async function setAccountArchived(id: string, archived: boolean) {
  if (!isUuid(id)) return;
  const { supabase } = await requireUser();
  await supabase.from("accounts").update({ archived }).eq("id", id);
  refresh();
}

export async function deleteAccount(id: string) {
  if (!isUuid(id)) return;
  const { supabase } = await requireUser();
  await supabase.from("accounts").delete().eq("id", id);
  refresh();
  redirect("/accounts");
}

/**
 * "Update value" for investments (gold, ASB, unit trusts): the user enters the
 * current total value and we record the difference as an adjustment.
 */
export async function updateAccountValue(id: string, _: FormState, formData: FormData): Promise<FormState> {
  if (!isUuid(id)) return {};
  const { supabase } = await requireUser();
  const { t } = await getI18n();
  const newValue = parseAmountToSen(str(formData, "new_value"), { allowNegative: true });
  if (newValue === null) return { fieldErrors: { new_value: t.common.invalidAmount } };

  const { data: account, error: readError } = await supabase
    .from("account_balances")
    .select("balance")
    .eq("id", id)
    .single();
  if (readError || !account) return { error: readError ? dbErrorMessage(readError, t, "updateAccountValue") : t.common.genericError };

  const delta = newValue - Number(account.balance);
  if (delta === 0) return { fieldErrors: { new_value: t.accounts.valueUnchanged } };

  const { error } = await supabase.from("transactions").insert({
    kind: "adjustment",
    account_id: id,
    amount: delta,
    occurred_on: todayISO(),
    note: str(formData, "note", 200) || null,
  });
  if (error) return { error: dbErrorMessage(error, t, "updateAccountValue") };
  refresh();
  redirect(`/accounts/${id}`);
}
