import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

const PORT = process.env.PORT ?? 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html"],
    ["json", { outputFile: "playwright-report/results.json" }],
  ],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: process.env.CI ? "retain-on-failure" : "off",
  },
  webServer: {
    command: "pnpm run dev",
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      AUTH_SECRET: process.env.AUTH_SECRET ?? "",
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
      GOOGLE_CREDENTIALS: process.env.GOOGLE_CREDENTIALS ?? "",
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI ?? "",
      TRUSTED_ORIGINS: process.env.TRUSTED_ORIGINS ?? "",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Add more browsers for cross-browser testing
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
  ],
  // Global test timeout
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
});
