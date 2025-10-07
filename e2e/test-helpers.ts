import { Page } from "@playwright/test";

export async function loginUser(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

export async function signupUser(
  page: Page,
  email: string,
  password: string,
  name: string,
) {
  await page.goto("/signup");
  await page.fill('input[name="name"]', name);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

export async function logoutUser(page: Page) {
  await page.goto("/logout");
  await page.waitForURL("/login");
}

// Test user credentials
export const TEST_USER = {
  email: "test@example.com",
  password: "testpassword123",
  name: "Test User",
};
