import { expect, type Locator, type Page } from "@playwright/test";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
export const SECRET_KEY = process.env.SUPABASE_SECRET_KEY ?? "";

/** Unique email per test so tests can run in parallel on one database. */
export function uniqueEmail(prefix = "t") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export async function signUp(page: Page, opts: { name?: string; email?: string; password?: string } = {}) {
  const email = opts.email ?? uniqueEmail();
  await page.goto("/signup");
  if (opts.name) await page.getByLabel("Your name").fill(opts.name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(opts.password ?? "password123");
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.waitForURL("**/dashboard");
  await expect(page.getByText("Total savings", { exact: true })).toBeVisible();
  return email;
}

export async function logIn(page: Page, email: string, password = "password123") {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

/** Add an account through the form. `provider` is search text + the option name to click. */
export async function addAccount(
  page: Page,
  opts: { type: string; name: string; balance: string; provider?: { search: string; option: RegExp } },
) {
  await page.goto("/accounts/new");
  await page.getByRole("radio", { name: opts.type, exact: true }).click();
  if (opts.provider) {
    await page.getByRole("button", { name: /Bank \/ provider/ }).click();
    await page.getByRole("searchbox").fill(opts.provider.search);
    await page.getByRole("dialog").getByRole("button", { name: opts.provider.option }).click();
  }
  await page.getByLabel("Name", { exact: true }).fill(opts.name);
  await page.getByLabel("Current balance").fill(opts.balance);
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL("**/accounts");
  await expect(page.getByRole("heading", { name: "Accounts" })).toBeVisible();
}

/** Select an account option by its name (options read "Name · RM balance"). */
export async function pickAccount(select: Locator, name: string) {
  const options = await select.locator("option").evaluateAll((os) =>
    os.map((o) => ({ value: (o as HTMLOptionElement).value, text: o.textContent ?? "" })),
  );
  const hit = options.find((o) => o.text.startsWith(`${name} ·`));
  if (!hit) throw new Error(`No account option "${name}" in ${options.map((o) => o.text).join(", ")}`);
  await select.selectOption(hit.value);
}

export async function addTransaction(
  page: Page,
  opts: { kind: "Money in" | "Money out" | "Transfer"; amount: string; account: string; to?: string; category?: string; note?: string },
) {
  await page.goto("/transactions/new");
  await page.getByRole("radio", { name: opts.kind }).click();
  await page.getByLabel("Amount (RM)").fill(opts.amount);
  await pickAccount(page.getByLabel(opts.kind === "Transfer" ? "From account" : "Account", { exact: true }), opts.account);
  if (opts.to) await pickAccount(page.getByLabel("To account"), opts.to);
  if (opts.category) {
    const chip = page.getByRole("radio", { name: opts.category, exact: true });
    if ((await chip.getAttribute("aria-checked")) !== "true") await chip.click();
  }
  if (opts.note) await page.getByLabel(/Note/).fill(opts.note);
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL(/\/transactions$/);
}

/** Page text with non-breaking spaces normalised (Intl uses them in "RM 1.00"). */
export async function mainText(page: Page) {
  return ((await page.locator("main").textContent()) ?? "").replace(/ /g, " ");
}

/** Supabase admin API (local only). */
export async function adminFetch(path: string, body: unknown) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/${path}`, {
    method: "POST",
    headers: { apikey: SECRET_KEY, Authorization: `Bearer ${SECRET_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`admin ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}
