import assert from "node:assert/strict";
import { test } from "node:test";
import {
  monthlyFlow,
  monthsBack,
  niceScale,
  niceTicks,
  savingsTrend,
  spendingByCategory,
  type BalanceTx,
  type FlowTx,
} from "../../src/lib/charts";

const tx = [
  { kind: "income", amount: 350000, occurred_on: "2026-10-25", category_id: "sal", account_id: "may", to_account_id: null },
  { kind: "expense", amount: 4550, occurred_on: "2026-11-02", category_id: "food", account_id: "may", to_account_id: null },
  { kind: "expense", amount: 12000, occurred_on: "2026-11-03", category_id: "petrol", account_id: "may", to_account_id: null },
  { kind: "expense", amount: 1000, occurred_on: "2026-11-04", category_id: null, account_id: "may", to_account_id: null },
  { kind: "transfer", amount: 100000, occurred_on: "2026-11-05", category_id: null, account_id: "may", to_account_id: "asb" },
  { kind: "adjustment", amount: -12000, occurred_on: "2026-11-06", category_id: null, account_id: "gold", to_account_id: null },
] as (FlowTx & BalanceTx)[];

const accounts = [
  { id: "may", opening_balance: 500000, created_at: "2026-09-10T00:00:00Z" },
  { id: "asb", opening_balance: 1000000, created_at: "2026-09-10T00:00:00Z" },
  { id: "gold", opening_balance: 300000, created_at: "2026-11-01T00:00:00Z" },
];

test("monthsBack lists months oldest first, across year ends", () => {
  assert.deepEqual(monthsBack("2026-11", 3), ["2026-09", "2026-10", "2026-11"]);
  assert.deepEqual(monthsBack("2026-02", 3), ["2025-12", "2026-01", "2026-02"]);
});

test("monthlyFlow counts income and expenses only (no transfers or value updates)", () => {
  const flow = monthlyFlow(tx, monthsBack("2026-11", 6));
  assert.equal(flow.length, 6);
  assert.deepEqual(flow.at(-2), { month: "2026-10", income: 350000, expense: 0 });
  assert.deepEqual(flow.at(-1), { month: "2026-11", income: 0, expense: 17550 });
});

test("savingsTrend starts at the first account and nets transfers to zero", () => {
  const trend = savingsTrend(accounts, tx, monthsBack("2026-11", 6));
  assert.deepEqual(trend.map((p) => p.month), ["2026-09", "2026-10", "2026-11"]);
  assert.equal(trend[0].total, 1500000);
  assert.equal(trend[1].total, 1850000);
  assert.equal(trend[2].total, 1850000 - 17550 + 300000 - 12000);
});

test("spendingByCategory sorts biggest first and folds the rest into Other", () => {
  const s = spendingByCategory(tx, 2);
  assert.deepEqual(s.shown, [
    { categoryId: "petrol", amount: 12000 },
    { categoryId: "food", amount: 4550 },
  ]);
  assert.equal(s.otherAmount, 1000);
  assert.equal(s.total, 17550);
});

test("axis ticks are round numbers and always include zero", () => {
  assert.deepEqual(niceTicks(350000), [0, 100000, 200000, 300000, 400000]);
  assert.deepEqual(niceTicks(9000), [0, 2500, 5000, 7500, 10000]);
  assert.deepEqual(niceTicks(0), [0]);
  assert.deepEqual(niceScale(1500000, 2120000), { lo: 0, hi: 3000000, ticks: [0, 1000000, 2000000, 3000000] });
  const neg = niceScale(-30000, 90000);
  assert.ok(neg.ticks.includes(0) && neg.lo <= -30000 && neg.hi >= 90000);
});
