import type { Page } from "@playwright/test";

// `-@friday-test.local` domain never resolves; Better Auth's email/password
// flow doesn't verify addresses before sign-up, so it's a safe, unique
// throwaway identity per test run. `global-teardown.ts` deletes anything
// under this domain from the database after the suite finishes.
export function uniqueTestEmail(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@friday-test.local`;
}

export const TEST_PASSWORD = "correct horse battery staple";

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

export function makeTestUser(): TestUser {
  return {
    name: "Friday E2E",
    email: uniqueTestEmail(),
    password: TEST_PASSWORD,
  };
}

/**
 * Runs the sign-up form and skips the passkey enrollment prompt that always
 * follows it, landing on the connect-Google gate at `/app`.
 */
export async function signUpAndSkipPasskey(page: Page, user: TestUser) {
  await page.goto("/auth");
  await page.getByRole("button", { name: "Create Account" }).click();
  await page.getByLabel("Full Name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByLabel("Confirm Password").fill(user.password);
  await page.getByRole("button", { name: "Sign Up" }).click();

  await page.getByRole("heading", { name: "Secure Your Account" }).waitFor();
  await page.getByRole("button", { name: "Skip for Now" }).click();

  await page.waitForURL("/app");
}

/** Signs in an existing user and skips the passkey enrollment re-prompt. */
export async function signInAndSkipPasskey(page: Page, user: TestUser) {
  await page.goto("/auth");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Sign In" }).click();

  await page.getByRole("heading", { name: "Secure Your Account" }).waitFor();
  await page.getByRole("button", { name: "Skip for Now" }).click();

  await page.waitForURL("/app");
}
