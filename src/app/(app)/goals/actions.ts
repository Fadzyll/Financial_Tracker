"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { getI18n } from "@/lib/i18n/server";
import { dbErrorMessage } from "@/lib/db-errors";
import { parseAmountToSen } from "@/lib/money";
import { isValidISODate } from "@/lib/dates";
import { isUuid, str, type FormState } from "@/lib/validation";

async function parseGoalForm(formData: FormData) {
  const { t } = await getI18n();
  const name = str(formData, "goal_name", 60);
  const target = parseAmountToSen(str(formData, "target_amount"));
  const targetDate = str(formData, "target_date");
  const scope = str(formData, "scope") === "all" ? "all" : "accounts";
  const accountIds = [...new Set(formData.getAll("account_ids").filter(isUuid))];

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = t.common.required;
  if (target === null || target <= 0) fieldErrors.target_amount = t.common.invalidAmount;
  if (targetDate && !isValidISODate(targetDate)) fieldErrors.target_date = t.common.invalidDate;
  if (scope === "accounts" && accountIds.length === 0) fieldErrors.account_ids = t.goals.pickAccounts;

  return {
    fieldErrors,
    values: { name, target_amount: target ?? 0, target_date: targetDate || null, scope },
    accountIds: scope === "accounts" ? accountIds : [],
  };
}

async function saveGoalAccounts(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  goalId: string,
  accountIds: string[],
) {
  const { error: delError } = await supabase.from("goal_accounts").delete().eq("goal_id", goalId);
  if (delError) return delError;
  if (accountIds.length === 0) return null;
  const { error } = await supabase
    .from("goal_accounts")
    .insert(accountIds.map((account_id) => ({ goal_id: goalId, account_id })));
  return error;
}

export async function createGoal(_: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser();
  const { t } = await getI18n();
  const { fieldErrors, values, accountIds } = await parseGoalForm(formData);
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const { data, error } = await supabase.from("goals").insert(values).select("id").single();
  if (error || !data) return { error: error ? dbErrorMessage(error, t, "createGoal") : t.common.genericError };
  const linkError = await saveGoalAccounts(supabase, data.id, accountIds);
  if (linkError) return { error: dbErrorMessage(linkError, t, "createGoal") };

  revalidatePath("/", "layout");
  redirect("/goals");
}

export async function updateGoal(id: string, _: FormState, formData: FormData): Promise<FormState> {
  if (!isUuid(id)) return {};
  const { supabase } = await requireUser();
  const { t } = await getI18n();
  const { fieldErrors, values, accountIds } = await parseGoalForm(formData);
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const { error } = await supabase.from("goals").update(values).eq("id", id);
  if (error) return { error: dbErrorMessage(error, t, "updateGoal") };
  const linkError = await saveGoalAccounts(supabase, id, accountIds);
  if (linkError) return { error: dbErrorMessage(linkError, t, "updateGoal") };

  revalidatePath("/", "layout");
  redirect("/goals");
}

export async function deleteGoal(id: string) {
  if (!isUuid(id)) return;
  const { supabase } = await requireUser();
  await supabase.from("goals").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/goals");
}
