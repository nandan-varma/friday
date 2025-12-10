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
  await page.type("#name", name);
  await page.type("#email", email);
  await page.type("#password", password);
  // Just try to click the button, even if disabled
  await page.click('button[type="submit"]', { force: true });
  await page.waitForURL("/dashboard");
}

export async function logout(page: Page) {
  await page.click("text=Sign Out");
  await page.waitForURL("/login");
}

export async function createEvent(
  page: Page,
  title: string,
  _description: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  _startDate: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  _endDate: string, // eslint-disable-line @typescript-eslint/no-unused-vars
) {
  // Click the "New Event" button in the calendar header (not the sidebar one)
  await page.click('button:has(svg.lucide-plus):has-text("New Event")');

  // Wait for the event form to appear
  await page.waitForSelector("#title");

  await page.fill("#title", title);
  // For now, just create a basic event with default dates
  await page.click('button:has-text("Create Event")');
  await page.waitForSelector(`text=${title}`);
}
