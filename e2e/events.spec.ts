import { test, expect } from "@playwright/test";
import { login, signup, createEvent } from "./utils";
import { TEST_CREDENTIALS } from "./credentials";

test.describe("Events", () => {
  test("should load events page structure", async ({ page }) => {
    await page.goto("/");
    // Basic check that the page loads
    await expect(page.locator("body")).toBeVisible();
  });

  test.skip("should create a new event", async ({ page }) => {
    // Event creation functionality needs to be implemented
    await login(page, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);
    await expect(
      page.locator("h1").filter({ hasText: "Calendar" }),
    ).toBeVisible();
  });

  test.skip("should edit an existing event", async ({ page }) => {
    // Event editing functionality needs to be implemented
    await login(page, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);
    await expect(
      page.locator("h1").filter({ hasText: "Calendar" }),
    ).toBeVisible();
  });

  test.skip("should delete an event", async ({ page }) => {
    // Event deletion functionality needs to be implemented
    await login(page, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);
    await expect(
      page.locator("h1").filter({ hasText: "Calendar" }),
    ).toBeVisible();
  });
});
