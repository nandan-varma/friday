import { test, expect } from "@playwright/test";
import { signup } from "./utils";

test.describe("Dashboard", () => {
  test("should load dashboard page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });

  test("should display dashboard after login", async ({ page }) => {
    const email = `dashboard-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "Dashboard Test User";

    await signup(page, email, password, name);

    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("text=Dashboard")).toBeVisible();
  });

  test("should navigate to calendar view", async ({ page }) => {
    const email = `calendar-nav-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "Calendar Nav Test User";

    await signup(page, email, password, name);

    await page.click('text=Calendar');
    await expect(page).toHaveURL(/.*calendar/);
    await expect(page.locator("text=Calendar")).toBeVisible();
  });

  test("should navigate to AI chat", async ({ page }) => {
    const email = `ai-nav-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "AI Nav Test User";

    await signup(page, email, password, name);

    await page.click('text=AI');
    await expect(page).toHaveURL("/dashboard/ai");
    await expect(page.locator("text=AI Assistant")).toBeVisible();
  });

  test("should navigate to settings", async ({ page }) => {
    const email = `settings-nav-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "Settings Nav Test User";

    await signup(page, email, password, name);

    await page.click('text=Settings');
    await expect(page).toHaveURL("/settings");
    await expect(page.locator("text=Settings")).toBeVisible();
  });
});
