"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { getI18n } from "@/lib/i18n/server";
import { dbErrorMessage } from "@/lib/db-errors";
import { flash } from "@/lib/flash";
import { parseAmountToSen } from "@/lib/money";
import { isValidISODate } from "@/lib/dates";
import type { TransactionKind } from "@/lib/types";
import { isUuid, str, type FormState } from "@/lib/validation";
import { safeNextPath } from "@/lib/next-path";

const KINDS: TransactionKind[] = ["income", "expense", "transfer", "adjustment"];

async function parseTransactionForm(formData: FormData) {
  const { t } = await getI18n();
  const kind = str(formData, "kind") as TransactionKind;
  const accountId = str(formData, "account_id");
  const toAccountId = str(formData, "to_account_id");
  const categoryId = str(formData, "category_id");
  const occurredOn = str(formData, "occurred_on");
  const note = str(formData, "note", 200) || null;
  const amount = parseAmountToSen(str(formData, "amount"), { allowNegative: kind === "adjustment" });

  const fieldErrors: Record<string, string> = {};
  if (!KINDS.includes(kind)) fieldErrors.kind = t.common.required;
  if (!isUuid(accountId)) fieldErrors.account_id = t.common.required;
  if (amount === null || amount === 0) fieldErrors.amount = t.common.invalidAmount;
  if (!isValidISODate(occurredOn)) fieldErrors.occurred_on = t.common.invalidDate;
  if (kind === "transfer") {
    if (!isUuid(toAccountId)) fieldErrors.to_account_id = t.common.required;
    else if (toAccountId === accountId) fieldErrors.to_account_id = t.transactions.sameAccount;
  }

  const isFlow = kind === "income" || kind === "expense";
  return {
    fieldErrors,
    values: {
      kind,
      account_id: accountId,
      to_account_id: kind === "transfer" ? toAccountId : null,
      category_id: isFlow && isUuid(categoryId) ? categoryId : null,
      amount: amount ?? 0,
      occurred_on: occurredOn,
      note,
    },
  };
}

/** Category must exist for this user and match income/expense. */
async function categoryMatches(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  categoryId: string | null,
  kind: TransactionKind,
) {
  if (!categoryId) return true;
  const { data } = await supabase.from("categories").select("kind").eq("id", categoryId).maybeSingle();
  return data?.kind === kind;
}

export async function createTransaction(_: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser();
  const { t } = await getI18n();
  const { fieldErrors, values } = await parseTransactionForm(formData);
  if (Object.keys(fieldErrors).length) return { fieldErrors };
  if (!(await categoryMatches(supabase, values.category_id, values.kind))) {
    return { fieldErrors: { category_id: t.common.required } };
  }

  const { error } = await supabase.from("transactions").insert(values);
  if (error) return { error: dbErrorMessage(error, t, "createTransaction") };
  revalidatePath("/", "layout");
  const next = safeNextPath(str(formData, "next"));
  await flash("txCreated", { href: `/transactions/new?from=${encodeURIComponent(next)}` });
  redirect(next);
}

export async function updateTransaction(id: string, _: FormState, formData: FormData): Promise<FormState> {
  if (!isUuid(id)) return {};
  const { supabase } = await requireUser();
  const { t } = await getI18n();
  const { fieldErrors, values } = await parseTransactionForm(formData);
  if (Object.keys(fieldErrors).length) return { fieldErrors };
  if (!(await categoryMatches(supabase, values.category_id, values.kind))) {
    return { fieldErrors: { category_id: t.common.required } };
  }

  const { error } = await supabase.from("transactions").update(values).eq("id", id);
  if (error) return { error: dbErrorMessage(error, t, "updateTransaction") };
  revalidatePath("/", "layout");
  await flash("txUpdated");
  redirect(safeNextPath(str(formData, "next")));
}

export async function deleteTransaction(id: string, next?: string) {
  if (!isUuid(id)) return;
  const { supabase } = await requireUser();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (!error) await flash("txDeleted");
  revalidatePath("/", "layout");
  redirect(safeNextPath(next));
}
