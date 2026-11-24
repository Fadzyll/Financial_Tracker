import { expect, test } from "@playwright/test";
import { addAccount, addTransaction, mainText, signUp } from "./helpers";

test("balances, monthly totals, value updates, goals and CSV add up", async ({ page }) => {
  await signUp(page, { name: "Hakimi" });
  await addAccount(page, { type: "Bank", name: "Maybank Savings", balance: "5,000", provider: { search: "maybank", option: /^Maybank$/ } });
  await addAccount(page, { type: "Investment", name: "ASB", balance: "10000", provider: { search: "asb", option: /ASNB/ } });
  await addAccount(page, { type: "Gold", name: "Gold", balance: "3000.00" });

  await addTransaction(page, { kind: "Money in", amount: "3500", account: "Maybank Savings", category: "Salary", note: "Gaji November" });
  await addTransaction(page, { kind: "Money out", amount: "45.50", account: "Maybank Savings", category: "Food & drinks" });
  await addTransaction(page, { kind: "Transfer", amount: "1000", account: "Maybank Savings", to: "ASB" });

  // Gold price drops: record the new value
  await page.goto("/accounts");
  await page.getByRole("link", { name: /Gold/ }).click();
  await page.waitForURL(/\/accounts\/[0-9a-f-]{36}$/);
  const goldUrl = page.url();
  await page.getByText("Update value").first().click();
  await page.getByLabel("Current total value").fill("2880");
  await page.getByRole("button", { name: "Update value" }).click();
  await expect.poll(() => mainText(page)).toContain("RM 2,880.00");

  // Goals: one on selected accounts, one on all accounts
  await page.goto("/goals/new");
  await page.getByLabel("Goal name").fill("Wedding");
  await page.getByLabel("Target amount (RM)").fill("30000");
  await page.getByLabel(/^ASB/).check();
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL("**/goals");
  await page.goto("/goals/new");
  await page.getByLabel("Goal name").fill("Trip to Japan");
  await page.getByLabel("Target amount (RM)").fill("8000");
  await page.getByText("All my accounts").click();
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL("**/goals");
  await expect.poll(() => mainText(page)).toContain("RM 19,000.00 more to go"); // 11,000 of 30,000
  await expect(page.getByText("Goal reached!")).toBeVisible();

  // Dashboard: 5000+3500-45.50-1000 + 11000 + 2880 = 21,334.50
  await page.goto("/dashboard");
  await expect(page.getByText("Total savings", { exact: true })).toBeVisible();
  const text = await mainText(page);
  expect(text).toContain("RM 21,334.50");
  expect(text).toContain("+RM 3,454.50"); // money in − money out this month (transfer & value update excluded)

  // CSV export
  const csv = await (await page.request.get("/export")).text();
  expect(csv.split("\r\n")).toHaveLength(5);
  expect(csv).toContain("Gaji November");

  // Another user can't see this account
  const other = await (await page.context().browser()!.newContext()).newPage();
  await signUp(other);
  await other.goto(goldUrl);
  await expect(other.getByText("Page not found")).toBeVisible();
  expect(await mainText(other)).not.toContain("Gold");
});

test("saving fails gracefully and keeps what was typed", async ({ page }) => {
  await signUp(page);
  await page.goto("/transactions/new");
  // No account yet → the form asks for one first
  await expect(page.getByText("Add an account first")).toBeVisible();
  await addAccount(page, { type: "Cash", name: "Wallet", balance: "50" });
  await page.goto("/transactions/new");
  await page.getByLabel("Amount (RM)").fill("abc");
  await page.getByLabel(/Note/).fill("keep me");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Enter a valid amount")).toBeVisible();
  await expect(page.getByLabel(/Note/)).toHaveValue("keep me");
});
