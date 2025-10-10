import { test, expect } from "@playwright/test";
import { login, signup, logout } from "./utils";

test.describe("Authentication", () => {
  test("should load login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should load signup page", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should navigate between login and signup", async ({ page }) => {
    await page.goto("/login");
    await page.click('text=Sign up');
    await expect(page).toHaveURL("/signup");

    await page.click('text=Sign in');
    await expect(page).toHaveURL("/login");
  });

  test("should allow user to sign up", async ({ page }) => {
    const email = `test${Date.now()}@example.com`;
    const password = "password123";
    const name = "Test User";

    await signup(page, email, password, name);

    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("text=Dashboard")).toBeVisible();
  });

  test("should allow user to login", async ({ page }) => {
    // First create a test user
    const email = `login-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "Login Test User";

    await signup(page, email, password, name);
    await logout(page);

    // Now try to login
    await login(page, email, password);

    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("text=Dashboard")).toBeVisible();
  });

  test("should allow user to logout", async ({ page }) => {
    const email = `logout-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "Logout Test User";

    await signup(page, email, password, name);
    await logout(page);

    await expect(page).toHaveURL("/");
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "invalid@example.com");
    await page.fill("#password", "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Invalid email or password")).toBeVisible();
  });
});
