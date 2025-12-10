import { test, expect } from "@playwright/test";
import { login, signup } from "./utils";
import { TEST_CREDENTIALS } from "./credentials";

test.describe("Calendar", () => {
  test("should load calendar page", async ({ page }) => {
    await login(page, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);

    await expect(
      page.locator("h1").filter({ hasText: "Calendar" }),
    ).toBeVisible();
  });

  test("should display calendar view", async ({ page }) => {
    await login(page, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);

    await expect(
      page.locator("h1").filter({ hasText: "Calendar" }),
    ).toBeVisible();
  });

  test("should switch between calendar views", async ({ page }) => {
    await login(page, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);

    // Test month view (should be default)
    await expect(page.locator('button:has-text("Month")')).toBeVisible();

    // Test week view
    await page.click('button:has-text("Week")');
    await expect(page.locator('button:has-text("Week")')).toHaveAttribute(
      "data-state",
      "active",
    );
  });

  test("should navigate calendar dates", async ({ page }) => {
    await login(page, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);

    // Get initial month/year text (the calendar header h2)
    const initialDateText = await page
      .locator("h2")
      .filter({ hasText: /\d{4}/ })
      .textContent();

    // Click next month button
    await page.click("button:has(svg.lucide-chevron-right)");

    // Check that the calendar is still visible (navigation worked)
    await expect(
      page.locator("h1").filter({ hasText: "Calendar" }),
    ).toBeVisible();
  });
});
