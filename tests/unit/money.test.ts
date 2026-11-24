import assert from "node:assert/strict";
import { test } from "node:test";
import { parseAmountToSen } from "../../src/lib/money";
import { safeNextPath } from "../../src/lib/next-path";

test("parseAmountToSen accepts common ways of typing ringgit", () => {
  assert.equal(parseAmountToSen("150"), 15000);
  assert.equal(parseAmountToSen("1,250.50"), 125050);
  assert.equal(parseAmountToSen("RM 20"), 2000);
  assert.equal(parseAmountToSen("0.5"), 50);
});

test("parseAmountToSen rejects bad input and negatives unless allowed", () => {
  assert.equal(parseAmountToSen("abc"), null);
  assert.equal(parseAmountToSen("1.234"), null);
  assert.equal(parseAmountToSen("-5"), null);
  assert.equal(parseAmountToSen("-5", { allowNegative: true }), -500);
  assert.equal(parseAmountToSen("99999999999999"), null);
});

test("safeNextPath only allows the app's own pages", () => {
  assert.equal(safeNextPath("/dashboard"), "/dashboard");
  assert.equal(safeNextPath("/accounts/123e4567-e89b-12d3-a456-426614174000"), "/accounts/123e4567-e89b-12d3-a456-426614174000");
  assert.equal(safeNextPath("https://evil.example"), "/transactions");
  assert.equal(safeNextPath("//evil.example"), "/transactions");
  assert.equal(safeNextPath("/accounts/not-a-uuid"), "/transactions");
});
