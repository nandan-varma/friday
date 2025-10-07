import { test, expect } from "@playwright/test";
import { loginUser, TEST_USER } from "./test-helpers";

test.describe("Calendar Functionality", () => {
  test("calendar page loads", async ({ page }) => {
    await page.goto("/dashboard");

    // Should redirect to login if not authenticated
    await expect(page.url()).toContain("/login");
  });

  test("calendar view switches work", async ({ page }) => {
    await loginUser(page, TEST_USER.email, TEST_USER.password);

    // Test month view (default)
    await expect(page.getByRole("button", { name: /month/i })).toBeVisible();

    // Test week view
    await page.getByRole("button", { name: /week/i }).click();
    await expect(page.getByText(/week of/i)).toBeVisible();

    // Test day view
    await page.getByRole("button", { name: /day/i }).click();
    await expect(page.getByText(/today/i)).toBeVisible();

    // Test agenda view
    await page.getByRole("button", { name: /agenda/i }).click();
    await expect(page.getByText(/agenda/i)).toBeVisible();
  });

  test("calendar navigation works", async ({ page }) => {
    await loginUser(page, TEST_USER.email, TEST_USER.password);

    // Test previous/next navigation
    const prevButton = page.getByRole("button", { name: /previous/i });
    const nextButton = page.getByRole("button", { name: /next/i });
    await expect(prevButton).toBeVisible();
    await expect(nextButton).toBeVisible();

    // Test today button
    await expect(page.getByRole("button", { name: /today/i })).toBeVisible();
  });

  test("calendar displays current month", async ({ page }) => {
    await loginUser(page, TEST_USER.email, TEST_USER.password);

    // Check that current month/year is displayed
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString("default", {
      month: "long",
    });
    const currentYear = currentDate.getFullYear();
    await expect(
      page.getByText(new RegExp(`${currentMonth} ${currentYear}`)),
    ).toBeVisible();
  });

  test("calendar shows days of week", async ({ page }) => {
    await loginUser(page, TEST_USER.email, TEST_USER.password);

    // Check for day headers
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    for (const day of daysOfWeek) {
      await expect(page.getByText(day)).toBeVisible();
    }
  });
});
