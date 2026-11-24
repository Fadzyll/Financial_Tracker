import { shiftMonth } from "@/lib/dates";
import type { Transaction } from "@/lib/types";

/** Minimal shapes the chart maths needs (keeps it easy to test). */
export type FlowTx = Pick<Transaction, "kind" | "amount" | "occurred_on" | "category_id">;
export type BalanceTx = Pick<Transaction, "kind" | "amount" | "occurred_on" | "account_id" | "to_account_id">;
export type BalanceAccount = { id: string; opening_balance: number; created_at: string };

export interface MonthFlow {
  month: string; // "2026-11"
  income: number; // sen
  expense: number; // sen
}

export interface SavingsPoint {
  month: string;
  total: number; // sen, at the end of that month
}

export interface CategorySpend {
  categoryId: string | null;
  amount: number;
}

/** The last `count` months ending with `endMonth`, oldest first. */
export function monthsBack(endMonth: string, count: number) {
  return Array.from({ length: count }, (_, i) => shiftMonth(endMonth, i - count + 1));
}

/** Money in / out per month. Transfers and value updates are not cash flow. */
export function monthlyFlow(txns: FlowTx[], months: string[]): MonthFlow[] {
  const byMonth = new Map(months.map((m) => [m, { month: m, income: 0, expense: 0 }]));
  for (const tx of txns) {
    const row = byMonth.get(tx.occurred_on.slice(0, 7));
    if (!row) continue;
    if (tx.kind === "income") row.income += tx.amount;
    else if (tx.kind === "expense") row.expense += tx.amount;
  }
  return months.map((m) => byMonth.get(m)!);
}

/** Change a transaction makes to one account's balance. */
function deltaFor(tx: BalanceTx, accountId: string) {
  if (tx.kind === "transfer") {
    if (tx.account_id === accountId) return -tx.amount;
    if (tx.to_account_id === accountId) return tx.amount;
    return 0;
  }
  if (tx.account_id !== accountId) return 0;
  return tx.kind === "expense" ? -tx.amount : tx.amount; // income, adjustment (signed)
}

/**
 * Total savings at the end of each month, for the given accounts.
 * An account counts from the month it was created (its opening balance is
 * treated as its value then); transactions count from their own date.
 * Months before the first account existed are dropped.
 */
export function savingsTrend(
  accounts: BalanceAccount[],
  txns: BalanceTx[],
  months: string[],
): SavingsPoint[] {
  if (accounts.length === 0) return [];
  const ids = new Set(accounts.map((a) => a.id));
  const relevant = txns.filter((t) => ids.has(t.account_id) || (t.to_account_id && ids.has(t.to_account_id)));
  const firstMonth = accounts.map((a) => a.created_at.slice(0, 7)).sort()[0];

  return months
    .filter((m) => m >= firstMonth)
    .map((month) => {
      let total = 0;
      for (const a of accounts) {
        if (a.created_at.slice(0, 7) > month) continue;
        total += a.opening_balance;
        for (const tx of relevant) {
          if (tx.occurred_on.slice(0, 7) <= month) total += deltaFor(tx, a.id);
        }
      }
      return { month, total };
    });
}

/** Spending per category, biggest first; everything past `top` folds into "Other". */
export function spendingByCategory(txns: FlowTx[], top = 5) {
  const sums = new Map<string | null, number>();
  for (const tx of txns) {
    if (tx.kind !== "expense") continue;
    sums.set(tx.category_id, (sums.get(tx.category_id) ?? 0) + tx.amount);
  }
  const sorted: CategorySpend[] = [...sums.entries()]
    .map(([categoryId, amount]) => ({ categoryId, amount }))
    .sort((a, b) => b.amount - a.amount);
  const shown = sorted.slice(0, top);
  const otherAmount = sorted.slice(top).reduce((s, c) => s + c.amount, 0);
  const total = sorted.reduce((s, c) => s + c.amount, 0);
  return { shown, otherAmount, total };
}

/** Round an axis maximum up to a "nice" number and return evenly spaced ticks. */
export function niceTicks(max: number, count = 4) {
  if (max <= 0) return [0];
  const rough = max / count;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? 10 * pow;
  const ticks: number[] = [];
  for (let v = 0; v < max + step * 0.999; v += step) ticks.push(Math.round(v));
  return ticks;
}

/** Nice axis covering [min, max] (always including 0), with a tick at 0. */
export function niceScale(min: number, max: number, count = 4) {
  const lo0 = Math.min(0, min);
  const hi0 = Math.max(0, max);
  const span = hi0 - lo0 || 100_00;
  const step = niceTicks(span, count)[1] ?? span;
  const lo = Math.floor(lo0 / step) * step;
  const hi = Math.ceil(hi0 / step) * step || step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v));
  return { lo, hi, ticks };
}
