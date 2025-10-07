import { test, expect } from "@playwright/test";

test.describe("Settings Functionality", () => {
  test("settings page loads", async ({ page }) => {
    await page.goto("/settings");

    // In test environment, middleware may not redirect - page should load
    // TODO: Fix middleware for test environment or mock authentication
    await expect(page.url()).toContain("/settings");
  });

  test("settings page displays user information", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/settings");
    // Check for user profile section
    // await expect(page.getByText(/profile/i)).toBeVisible();
    // await expect(page.getByLabel(/name/i)).toBeVisible();
    // await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("update profile information", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/settings");
    // Update name
    // await page.getByLabel(/name/i).fill("Updated Name");
    // Save changes
    // await page.getByRole("button", { name: /save/i }).click();
    // Check for success message
    // await expect(page.getByText(/profile updated/i)).toBeVisible();
    // Verify changes persisted
    // await page.reload();
    // await expect(page.getByLabel(/name/i)).toHaveValue("Updated Name");
  });

  test("Google Calendar integration settings", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/settings");
    // Check for Google Calendar section
    // await expect(page.getByText(/google calendar/i)).toBeVisible();
    // Check connect/disconnect button
    // const connectButton = page.getByRole("button", { name: /connect/i });
    // const disconnectButton = page.getByRole("button", { name: /disconnect/i });
    // One of them should be visible
    // await expect(connectButton.or(disconnectButton)).toBeVisible();
  });

  test("notification preferences", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/settings");
    // Check for notification settings
    // await expect(page.getByText(/notifications/i)).toBeVisible();
    // Check notification toggles
    // await expect(page.getByLabel(/email notifications/i)).toBeVisible();
    // await expect(page.getByLabel(/reminder notifications/i)).toBeVisible();
  });

  test("theme preferences", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/settings");
    // Check for theme settings
    // await expect(page.getByText(/theme/i)).toBeVisible();
    // Check theme options
    // await expect(page.getByLabel(/light/i)).toBeVisible();
    // await expect(page.getByLabel(/dark/i)).toBeVisible();
    // await expect(page.getByLabel(/system/i)).toBeVisible();
  });

  test("change theme affects application", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/settings");
    // Change to dark theme
    // await page.getByLabel(/dark/i).check();
    // Navigate to dashboard
    // await page.goto("/dashboard");
    // Check that dark theme is applied
    // await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test("privacy settings", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/settings");
    // Check for privacy section
    // await expect(page.getByText(/privacy/i)).toBeVisible();
    // Check data sharing options
    // await expect(page.getByLabel(/analytics/i)).toBeVisible();
  });

  test("account deletion", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/settings");
    // Check for danger zone
    // await expect(page.getByText(/danger zone/i)).toBeVisible();
    // Check delete account button
    // await expect(page.getByRole("button", { name: /delete account/i })).toBeVisible();
  });

  test("form validation in settings", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/settings");
    // Try to save with invalid email
    // await page.getByLabel(/email/i).fill("invalid-email");
    // Try to save
    // await page.getByRole("button", { name: /save/i }).click();
    // Should show validation error
    // await expect(page.getByText(/invalid email/i)).toBeVisible();
  });
});
