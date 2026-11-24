import { expect, test } from "@playwright/test";
import { SECRET_KEY, adminFetch, logIn, signUp, uniqueEmail } from "./helpers";

test("sign up lands on the dashboard; logged-out pages redirect to login", async ({ page, browser }) => {
  await signUp(page, { name: "Hakimi" });
  await expect(page.getByText("Hi, Hakimi")).toBeVisible();

  const guest = await (await browser.newContext()).newPage();
  await guest.goto("/dashboard");
  await expect(guest).toHaveURL(/\/login$/);
});

test("log out from Settings ends the session", async ({ page }) => {
  await signUp(page);
  await page.goto("/settings");
  await page.locator("main").getByRole("button", { name: "Log out" }).click();
  await page.waitForURL("**/login");
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});

test("wrong password shows an error", async ({ page, browser }) => {
  const email = await signUp(page);
  const other = await (await browser.newContext()).newPage();
  await logIn(other, email, "not-the-password");
  await expect(other.getByText("Wrong email or password.")).toBeVisible();
});

test("change password in Settings checks the current password", async ({ page, browser }) => {
  const email = await signUp(page);
  await page.goto("/settings");
  await page.getByLabel("Current password").fill("wrong-one");
  await page.getByLabel("New password", { exact: true }).fill("newpass456");
  await page.getByLabel("Confirm new password").fill("newpass456");
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByText("Your current password is incorrect.")).toBeVisible();

  await page.getByLabel("Current password").fill("password123");
  await page.getByLabel("New password", { exact: true }).fill("newpass456");
  await page.getByLabel("Confirm new password").fill("newpass456");
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByText("Password updated")).toBeVisible();

  const fresh = await (await browser.newContext()).newPage();
  await logIn(fresh, email, "newpass456");
  await fresh.waitForURL("**/dashboard");
});

test("forgot password gives the same answer for unknown emails", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await page.getByLabel("Email").fill(uniqueEmail("nobody"));
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText(/If an account exists/)).toBeVisible();
});

test("password reset link works on another device and only once", async ({ page, browser }) => {
  test.skip(!SECRET_KEY, "needs SUPABASE_SECRET_KEY");
  const email = await signUp(page);
  const link = await adminFetch("generate_link", { type: "recovery", email });
  const url = `/auth/confirm?token_hash=${link.hashed_token}&type=recovery&next=/reset-password`;

  const other = await (await browser.newContext()).newPage();
  await other.goto(url);
  await other.waitForURL("**/reset-password");
  await other.getByLabel("New password", { exact: true }).fill("final789x");
  await other.getByLabel("Confirm new password").fill("different");
  await other.getByRole("button", { name: "Save new password" }).click();
  await expect(other.getByText("The passwords don't match.")).toBeVisible();
  await other.getByLabel("New password", { exact: true }).fill("final789x");
  await other.getByLabel("Confirm new password").fill("final789x");
  await other.getByRole("button", { name: "Save new password" }).click();
  await other.waitForURL("**/dashboard");

  await other.goto(url);
  await other.waitForURL(/forgot-password\?notice=expired/);

  const fresh = await (await browser.newContext()).newPage();
  await logIn(fresh, email, "final789x");
  await fresh.waitForURL("**/dashboard");
});

test("unconfirmed email gets a clear message and a resend button", async ({ page }) => {
  test.skip(!SECRET_KEY, "needs SUPABASE_SECRET_KEY");
  const email = uniqueEmail("unconfirmed");
  await adminFetch("users", { email, password: "password123", email_confirm: false });
  await logIn(page, email);
  await expect(page.getByText("Please confirm your email first.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Resend confirmation email" })).toBeVisible();
});

test("confirmation link opened in another browser says the email is confirmed", async ({ page }) => {
  await page.goto("/auth/confirm?code=from-another-browser");
  await expect(page).toHaveURL(/notice=confirmed/);
  await expect(page.getByText("Your email is confirmed. Please log in.")).toBeVisible();
});

test("privacy page is public and linked from login", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Privacy" }).click();
  await expect(page.getByRole("heading", { name: "Privacy policy" })).toBeVisible();
  await expect(page.getByText("What we never store")).toBeVisible();
});
