import { test, expect } from "@playwright/test";
import { signup } from "./utils";

test.describe("Settings", () => {
  test("should load settings page structure", async ({ page }) => {
    await page.goto("/");
    // Basic check that the page loads
    await expect(page.locator("body")).toBeVisible();
  });

  test("should display settings page", async ({ page }) => {
    const email = `settings-display-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "Settings Display Test User";

    await signup(page, email, password, name);
    await page.click('text=Settings');

    await expect(page.locator("text=Settings")).toBeVisible();
  });

  test("should update user profile", async ({ page }) => {
    const email = `settings-profile-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "Settings Profile Test User";

    await signup(page, email, password, name);
    await page.click('text=Settings');

    const newName = "Updated Name";

    await page.fill('input[name="name"]', newName);
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Profile updated successfully")).toBeVisible();
  });

  test("should change password", async ({ page }) => {
    const email = `settings-password-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "Settings Password Test User";

    await signup(page, email, password, name);
    await page.click('text=Settings');

    const newPassword = "newpassword123";

    await page.fill('input[name="currentPassword"]', password);
    await page.fill('input[name="newPassword"]', newPassword);
    await page.fill('input[name="confirmPassword"]', newPassword);
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Password changed successfully")).toBeVisible();
  });

  test("should toggle notification settings", async ({ page }) => {
    const email = `settings-notif-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "Settings Notif Test User";

    await signup(page, email, password, name);
    await page.click('text=Settings');

    const checkbox = page.locator('input[name="emailNotifications"]');
    
    const initialState = await checkbox.isChecked();
    await checkbox.click();
    
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Settings saved")).toBeVisible();
    
    // Verify the change was saved
    await page.reload();
    const newState = await checkbox.isChecked();
    expect(newState).not.toBe(initialState);
  });
});
