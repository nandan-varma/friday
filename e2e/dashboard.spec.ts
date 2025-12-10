import { test, expect } from "@playwright/test";
import { login, signup } from "./utils";
import { TEST_CREDENTIALS } from "./credentials";

test.describe("Dashboard", () => {
  test("should load dashboard page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });

  test("should display dashboard after login", async ({ page }) => {
    await login(page, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);

    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.locator("h1").filter({ hasText: "Calendar" }),
    ).toBeVisible();
  });

  test("should navigate to calendar view", async ({ page }) => {
    await login(page, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);

    await page.click("text=Calendar");
    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.locator("h1").filter({ hasText: "Calendar" }),
    ).toBeVisible();
  });

  test("should navigate to AI chat", async ({ page }) => {
    await login(page, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);

    await page.click("text=AI");
    await expect(page).toHaveURL("/dashboard/ai");
    await expect(
      page.locator("h1").filter({ hasText: "AI Assistant" }),
    ).toBeVisible();
  });

  test("should navigate to settings", async ({ page }) => {
    await login(page, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);

    await page.click("text=Settings");
    await expect(page).toHaveURL("/settings");
    await expect(
      page.locator("h1").filter({ hasText: "Settings" }),
    ).toBeVisible();
  });
});
