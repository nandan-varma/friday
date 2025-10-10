import { Page } from "@playwright/test";

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

export async function signup(
  page: Page,
  email: string,
  password: string,
  name: string,
) {
  await page.goto("/signup");
  await page.fill("#name", name);
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

export async function logout(page: Page) {
  await page.click('text=Sign Out');
  await page.click("");
  await page.waitForURL("/login");
}

export async function createEvent(
  page: Page,
  title: string,
  description: string,
  startDate: string,
  endDate: string,
) {
  await page.click("text=New Event");
  await page.fill("#title", title);
  // For now, just create a basic event with default dates
  await page.click('button[type="submit"]');
  await page.waitForSelector(`text=${title}`);
}
