import "server-only";
import { requireUser } from "@/lib/supabase/server";
import type { AccountWithBalance, Category, Goal, Transaction } from "@/lib/types";
import { monthRange } from "@/lib/dates";
import { isUuid } from "@/lib/validation";

export async function getAccounts({ includeArchived = false } = {}) {
  const { supabase } = await requireUser();
  let query = supabase.from("account_balances").select("*").order("archived").order("created_at");
  if (!includeArchived) query = query.eq("archived", false);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AccountWithBalance[];
}

export async function getCategories() {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("categories")
    .select("id, key, name, kind")
    .order("kind")
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function getGoals() {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("goals")
    .select("*, goal_accounts(account_id)")
    .eq("archived", false)
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as Goal[];
}

export async function getTransactions(opts: {
  month?: string;
  accountId?: string;
  limit?: number;
}) {
  const { supabase } = await requireUser();
  let query = supabase
    .from("transactions")
    .select("*")
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });
  if (opts.month) {
    const { start, next } = monthRange(opts.month);
    query = query.gte("occurred_on", start).lt("occurred_on", next);
  }
  if (opts.accountId && isUuid(opts.accountId)) {
    query = query.or(`account_id.eq.${opts.accountId},to_account_id.eq.${opts.accountId}`);
  }
  if (opts.limit) query = query.limit(opts.limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Transaction[];
}

/** Money in / out for a month. Transfers and value updates are not counted. */
export function summarize(transactions: Transaction[]) {
  let income = 0;
  let expense = 0;
  for (const tx of transactions) {
    if (tx.kind === "income") income += tx.amount;
    else if (tx.kind === "expense") expense += tx.amount;
  }
  return { income, expense, net: income - expense };
}

/** Saved amount for a goal, based on its scope. */
export function goalSaved(goal: Goal, accounts: AccountWithBalance[]) {
  const active = accounts.filter((a) => !a.archived);
  if (goal.scope === "all") return active.reduce((sum, a) => sum + a.balance, 0);
  const ids = new Set(goal.goal_accounts.map((g) => g.account_id));
  return accounts.filter((a) => ids.has(a.id)).reduce((sum, a) => sum + a.balance, 0);
}

export async function getTransaction(id: string) {
  if (!isUuid(id)) return null;
  const { supabase } = await requireUser();
  const { data } = await supabase.from("transactions").select("*").eq("id", id).maybeSingle();
  return (data ?? null) as Transaction | null;
}
