import { expect, test } from "@playwright/test";
import {
  makeTestUser,
  signInAndSkipPasskey,
  signUpAndSkipPasskey,
} from "./helpers";

test("sign-up reaches the calendar connect gate and shows the user's email in settings", async ({
  page,
}) => {
  const user = makeTestUser();
  await signUpAndSkipPasskey(page, user);

  await expect(
    page.getByRole("heading", { name: "Connect Your Google Calendar" }),
  ).toBeVisible();

  await page.goto("/settings");
  await expect(page.getByText(user.email)).toBeVisible();
  await expect(page.getByText("Not connected")).toBeVisible();
});

test("sign out returns to /auth, and the same credentials sign back in", async ({
  page,
}) => {
  const user = makeTestUser();
  await signUpAndSkipPasskey(page, user);

  await page.goto("/settings");
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL("/auth");

  await signInAndSkipPasskey(page, user);
  await expect(
    page.getByRole("heading", { name: "Connect Your Google Calendar" }),
  ).toBeVisible();
});

test("sign-up rejects a mismatched password confirmation", async ({ page }) => {
  const user = makeTestUser();
  await page.goto("/auth");
  await page.getByRole("button", { name: "Create Account" }).click();
  await page.getByLabel("Full Name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByLabel("Confirm Password").fill("something-else");
  await page.getByRole("button", { name: "Sign Up" }).click();

  await expect(
    page.getByRole("alert").filter({ hasText: "Passwords do not match" }),
  ).toBeVisible();
});

test("sign-in rejects an unknown account", async ({ page }) => {
  await page.goto("/auth");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.getByLabel("Email").fill(`e2e-nonexistent@friday-test.local`);
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.locator('[data-slot="alert"]')).toBeVisible();
  await expect(page).toHaveURL("/auth");
});
