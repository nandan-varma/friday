import { test, expect } from "@playwright/test";
import { signup, createEvent } from "./utils";

test.describe("Events", () => {
  test("should load events page structure", async ({ page }) => {
    await page.goto("/");
    // Basic check that the page loads
    await expect(page.locator("body")).toBeVisible();
  });

  test("should create a new event", async ({ page }) => {
    const email = `event-create-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "Event Create Test User";

    await signup(page, email, password, name);

    const title = "Test Event";
    const description = "This is a test event";
    const startDate = "2024-01-15T10:00";
    const endDate = "2024-01-15T11:00";

    await createEvent(page, title, description, startDate, endDate);

    await expect(page.locator(`text=${title}`)).toBeVisible();
  });

  test("should edit an existing event", async ({ page }) => {
    const email = `event-edit-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "Event Edit Test User";

    await signup(page, email, password, name);

    const originalTitle = "Original Event";
    const newTitle = "Updated Event";

    // Create event first
    await createEvent(page, originalTitle, "Description", "2024-01-15T10:00", "2024-01-15T11:00");

    // Edit the event
    await page.click(`text=${originalTitle}`);
    await page.click('button[data-testid="edit-event"]');
    
    await page.fill('input[name="title"]', newTitle);
    await page.click('button[type="submit"]');

    await expect(page.locator(`text=${newTitle}`)).toBeVisible();
    await expect(page.locator(`text=${originalTitle}`)).not.toBeVisible();
  });

  test("should delete an event", async ({ page }) => {
    const email = `event-delete-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "Event Delete Test User";

    await signup(page, email, password, name);

    const title = "Event to Delete";

    // Create event first
    await createEvent(page, title, "Description", "2024-01-15T10:00", "2024-01-15T11:00");

    // Delete the event
    await page.click(`text=${title}`);
    await page.click('button[data-testid="delete-event"]');
    await page.click('button[data-testid="confirm-delete"]');

    await expect(page.locator(`text=${title}`)).not.toBeVisible();
  });
});
