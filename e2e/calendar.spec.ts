import { test, expect } from "@playwright/test";
import { signup } from "./utils";

test.describe("Calendar", () => {
  test("should load calendar page", async ({ page }) => {
    await page.goto("/");
    // Basic check that the page loads
    await expect(page.locator("body")).toBeVisible();
  });

  test("should display calendar view", async ({ page }) => {
    const email = `calendar-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "Calendar Test User";

    await signup(page, email, password, name);
    await page.click('text=Calendar');

    await expect(page.locator("text=Calendar")).toBeVisible();
  });

  test("should switch between calendar views", async ({ page }) => {
    const email = `calendar-view-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "Calendar View Test User";

    await signup(page, email, password, name);
    await page.click('text=Calendar');
    
    // Test month view
    await page.click('button[data-view="month"]');
    await expect(page.locator('[data-view="month"]')).toHaveClass(/active/);
    
    // Test week view
    await page.click('button[data-view="week"]');
    await expect(page.locator('[data-view="week"]')).toHaveClass(/active/);
    
    // Test day view
    await page.click('button[data-view="day"]');
    await expect(page.locator('[data-view="day"]')).toHaveClass(/active/);
  });

  test("should navigate calendar dates", async ({ page }) => {
    const email = `calendar-nav-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "Calendar Nav Test User";

    await signup(page, email, password, name);
    await page.click('text=Calendar');
    
    const initialDate = await page.locator('[data-testid="current-date"]').textContent();
    
    await page.click('button[data-testid="next-period"]');
    const nextDate = await page.locator('[data-testid="current-date"]').textContent();
    
    expect(nextDate).not.toBe(initialDate);
    
    await page.click('button[data-testid="prev-period"]');
    const backDate = await page.locator('[data-testid="current-date"]').textContent();
    
    expect(backDate).toBe(initialDate);
  });
});
