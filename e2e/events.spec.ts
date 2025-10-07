/* eslint-disable @typescript-eslint/no-unused-vars */
import { test } from "@playwright/test";

test.describe("Event Management", () => {
  test("event creation form loads", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/dashboard");
    // Click create event button
    // await page.getByRole("button", { name: /create event/i }).click();
    // Check form elements
    // await expect(page.getByLabel(/title/i)).toBeVisible();
    // await expect(page.getByLabel(/description/i)).toBeVisible();
    // await expect(page.getByLabel(/location/i)).toBeVisible();
    // await expect(page.getByLabel(/start time/i)).toBeVisible();
    // await expect(page.getByLabel(/end time/i)).toBeVisible();
  });

  test("create new event", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/dashboard");
    // Open create event form
    // await page.getByRole("button", { name: /create event/i }).click();
    // Fill form
    // await page.getByLabel(/title/i).fill("Test Event");
    // await page.getByLabel(/description/i).fill("Test Description");
    // await page.getByLabel(/location/i).fill("Test Location");
    // Set start time (today at 10 AM)
    // const today = new Date();
    // const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0);
    // const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0);
    // await page.getByLabel(/start time/i).fill(startTime.toISOString().slice(0, 16));
    // await page.getByLabel(/end time/i).fill(endTime.toISOString().slice(0, 16));
    // Submit form
    // await page.getByRole("button", { name: /save/i }).click();
    // Check that event appears in calendar
    // await expect(page.getByText("Test Event")).toBeVisible();
  });

  test("event validation works", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/dashboard");
    // Open create event form
    // await page.getByRole("button", { name: /create event/i }).click();
    // Try to submit empty form
    // await page.getByRole("button", { name: /save/i }).click();
    // Should show validation errors
    // await expect(page.getByText(/title is required/i)).toBeVisible();
  });

  test("edit existing event", async ({ page }) => {
    // TODO: Add authentication and create test event first
    // await loginUser(page);
    // await createTestEvent(page);
    // Click on event to edit
    // await page.getByText("Test Event").click();
    // Click edit button
    // await page.getByRole("button", { name: /edit/i }).click();
    // Modify title
    // await page.getByLabel(/title/i).fill("Updated Test Event");
    // Save changes
    // await page.getByRole("button", { name: /save/i }).click();
    // Check updated event
    // await expect(page.getByText("Updated Test Event")).toBeVisible();
  });

  test("delete event", async ({ page }) => {
    // TODO: Add authentication and create test event first
    // await loginUser(page);
    // await createTestEvent(page);
    // Click on event
    // await page.getByText("Test Event").click();
    // Click delete button
    // await page.getByRole("button", { name: /delete/i }).click();
    // Confirm deletion
    // await page.getByRole("button", { name: /confirm/i }).click();
    // Check event is gone
    // await expect(page.getByText("Test Event")).not.toBeVisible();
  });

  test("event time validation", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/dashboard");
    // Open create event form
    // await page.getByRole("button", { name: /create event/i }).click();
    // Set end time before start time
    // await page.getByLabel(/title/i).fill("Invalid Event");
    // await page.getByLabel(/start time/i).fill("2024-01-01T14:00");
    // await page.getByLabel(/end time/i).fill("2024-01-01T10:00");
    // Try to submit
    // await page.getByRole("button", { name: /save/i }).click();
    // Should show error
    // await expect(page.getByText(/end time must be after start time/i)).toBeVisible();
  });

  test("recurring event creation", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/dashboard");
    // Open create event form
    // await page.getByRole("button", { name: /create event/i }).click();
    // Fill basic info
    // await page.getByLabel(/title/i).fill("Recurring Meeting");
    // Set recurrence
    // await page.getByLabel(/recurrence/i).selectOption("weekly");
    // Submit
    // await page.getByRole("button", { name: /save/i }).click();
    // Check that multiple instances appear
    // await expect(page.getByText("Recurring Meeting")).toHaveCount(4); // Multiple weeks
  });

  test("all-day event creation", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/dashboard");
    // Open create event form
    // await page.getByRole("button", { name: /create event/i }).click();
    // Fill basic info
    // await page.getByLabel(/title/i).fill("All Day Event");
    // Check all-day toggle
    // await page.getByLabel(/all day/i).check();
    // Submit
    // await page.getByRole("button", { name: /save/i }).click();
    // Check that event appears as all-day
    // await expect(page.getByText("All Day Event")).toBeVisible();
  });
});
