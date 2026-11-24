import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against a running app + local Supabase.
 *   npx supabase start        # local database, migrations applied
 *   npm run build && npm run test:e2e
 * SUPABASE_SECRET_KEY (from `npx supabase status`) enables the tests that
 * need admin powers (unconfirmed users, password-reset links).
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "off",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run start -- -p 3000",
    url: baseURL + "/login",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
