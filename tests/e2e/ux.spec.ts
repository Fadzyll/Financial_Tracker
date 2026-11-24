import { expect, test } from "@playwright/test";
import { addAccount, addTransaction, mainText, pickAccount, signUp } from "./helpers";

test("provider list follows the account type", async ({ page }) => {
  await signUp(page);
  await page.goto("/accounts/new");
  const picker = page.getByRole("button", { name: /Bank \/ provider/ });
  await picker.click();
  let list = (await page.getByRole("dialog").textContent()) ?? "";
  expect(list).toContain("Maybank");
  expect(list).toContain("GXBank");
  expect(list).not.toContain("Touch");
  await page.getByRole("dialog").getByRole("button", { name: /^Maybank$/ }).click();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Maybank");

  await page.getByRole("radio", { name: "E-wallet" }).click();
  await expect(picker).toContainText("Choose"); // Maybank cleared
  await picker.click();
  list = (await page.getByRole("dialog").textContent()) ?? "";
  expect(list).toContain("Touch");
  expect(list).not.toContain("Maybank");
  await page.keyboard.press("Escape");

  await page.getByRole("radio", { name: "Cash" }).click();
  await expect(picker).toHaveCount(0);
});

test("transaction form: balance preview, chips, remembered choices, return path, toast", async ({ page }) => {
  await signUp(page);
  await addAccount(page, { type: "Bank", name: "Maybank Savings", balance: "500" });
  await addAccount(page, { type: "Bank", name: "CIMB", balance: "2000" });

  await page.goto("/dashboard");
  await page.getByRole("link", { name: "Add transaction" }).last().click();
  await page.waitForURL(/\/transactions\/new\?from=%2Fdashboard/);
  await page.getByLabel("Amount (RM)").fill("650");
  await pickAccount(page.getByLabel("Account", { exact: true }), "CIMB");
  const preview = page.locator("[aria-live=polite]").filter({ hasText: "Balance after" });
  await expect(preview).toContainText("1,350.00");
  await page.getByLabel("Amount (RM)").fill("2500");
  await expect(page.locator("main form")).toContainText("negative");

  await page.getByLabel("Amount (RM)").fill("45.50");
  await page.getByRole("radio", { name: "Food & drinks" }).click();
  await page.getByRole("button", { name: "Yesterday" }).click();
  await page.getByLabel(/Note/).fill("Nasi lemak");
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL("**/dashboard");
  await expect(page.getByText("Transaction saved")).toBeVisible();

  await page.getByRole("link", { name: "Add another" }).click();
  await page.waitForURL(/\/transactions\/new/);
  await expect(page.getByLabel("Account", { exact: true }).locator("option:checked")).toContainText("CIMB");
  await expect(page.getByRole("radio", { name: "Food & drinks" })).toHaveAttribute("aria-checked", "true");

  // Search by the Malay category name; "Yesterday" heading
  await page.goto("/transactions?q=makan");
  await expect(page.getByText("Nasi lemak")).toBeVisible();
  await page.goto("/transactions?q=zzzz");
  await expect(page.getByText("No transactions match")).toBeVisible();
  await page.goto("/transactions");
  await expect(page.getByText(/Yesterday ·/)).toBeVisible();
});

test("dashboard charts follow the period filter", async ({ page }) => {
  await signUp(page);
  await addAccount(page, { type: "Bank", name: "Maybank Savings", balance: "500" });
  await addTransaction(page, { kind: "Money out", amount: "12", account: "Maybank Savings" });
  const bars = page.locator('svg[aria-label^="Money in vs money out"] rect[tabindex="0"]');
  await page.goto("/dashboard?range=3m");
  await expect(bars).toHaveCount(3);
  await page.getByRole("link", { name: "1 year" }).click();
  await expect(bars).toHaveCount(12);
  await expect(page.getByText("Last 12 months").first()).toBeVisible();
  await page.getByText("Show as table").first().click();
  await expect(page.locator("details[open] tbody tr")).toHaveCount(12);
});

test("language and theme toggles", async ({ page }) => {
  await signUp(page);
  await page.getByRole("button", { name: "BM" }).first().click();
  await expect(page.getByText("Jumlah simpanan", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "EN" }).first().click();
  await expect(page.getByText("Total savings", { exact: true })).toBeVisible();

  const html = page.locator("html");
  const before = await html.getAttribute("data-theme");
  await page.getByRole("button", { name: "Switch light / dark mode" }).first().click();
  await expect(html).not.toHaveAttribute("data-theme", before ?? "");
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", /light|dark/);
});

test("getting-started checklist ticks off steps", async ({ page }) => {
  await signUp(page);
  await expect(page.getByText("0 of 3 done")).toBeVisible();
  await addAccount(page, { type: "Cash", name: "Wallet", balance: "10" });
  await page.goto("/dashboard");
  await expect(page.getByText("1 of 3 done")).toBeVisible();
  expect(await mainText(page)).toContain("RM 10.00");
});
