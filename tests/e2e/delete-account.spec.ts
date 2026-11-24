import { expect, test } from "@playwright/test";
import { addAccount, logIn, signUp } from "./helpers";

test("delete my account removes everything and ends the session", async ({ page, browser }) => {
  const email = await signUp(page);
  await addAccount(page, { type: "Bank", name: "Maybank", balance: "1000" });

  await page.goto("/settings");
  await page.getByText("I want to delete my account").click();
  page.on("dialog", (d) => d.accept());
  await page.getByLabel("Type your email to confirm").fill("someone-else@example.com");
  await page.getByRole("button", { name: "Delete my account permanently" }).click();
  await expect(page.getByText("doesn't match your email")).toBeVisible();

  await page.getByLabel("Type your email to confirm").fill(email.toUpperCase());
  await page.getByRole("button", { name: "Delete my account permanently" }).click();
  await page.waitForURL("**/login?notice=deleted");
  await expect(page.getByText("Your account and all your data have been deleted.")).toBeVisible();

  const again = await (await browser.newContext()).newPage();
  await logIn(again, email);
  await expect(again.getByText("Wrong email or password.")).toBeVisible();
});
