import { defineConfig, devices } from "@playwright/test";

// Must match NEXT_PUBLIC_APP_URL (.env.local) - Better Auth validates the
// request origin against it, so serving on any other port breaks auth.
const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: baseURL,
    // Reuses a `pnpm dev` you already have running on 3000 instead of
    // starting a second one.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
