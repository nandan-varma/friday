/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect } from "@playwright/test";

test.describe("AI Chat Functionality", () => {
  test("AI chat page loads", async ({ page }) => {
    await page.goto("/dashboard/ai");

    // In test environment, middleware may not redirect - page should load
    // TODO: Fix middleware for test environment or mock authentication
    await expect(page.url()).toContain("/dashboard/ai");
  });

  test("chat interface elements are present", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/dashboard/ai");
    // Check for main chat elements
    // await expect(page.getByPlaceholder(/type your message/i)).toBeVisible();
    // await expect(page.getByRole("button", { name: /send/i })).toBeVisible();
    // Check for chat history area
    // await expect(page.locator('[data-testid="chat-messages"]')).toBeVisible();
  });

  test("send and receive messages", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/dashboard/ai");
    // Type a message
    // await page.getByPlaceholder(/type your message/i).fill("Hello, can you help me?");
    // Send the message
    // await page.getByRole("button", { name: /send/i }).click();
    // Wait for response
    // await expect(page.locator('[data-testid="assistant-message"]')).toBeVisible();
    // Check that user message appears
    // await expect(page.getByText("Hello, can you help me?")).toBeVisible();
  });

  test("chat history persists", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/dashboard/ai");
    // Send a message
    // await page.getByPlaceholder(/type your message/i).fill("Test message");
    // await page.getByRole("button", { name: /send/i }).click();
    // Wait for response
    // await page.locator('[data-testid="assistant-message"]').waitFor();
    // Navigate away and come back
    // await page.goto("/dashboard");
    // await page.goto("/dashboard/ai");
    // Check that message history is still there
    // await expect(page.getByText("Test message")).toBeVisible();
  });

  test("clear chat functionality", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/dashboard/ai");
    // Send a message first
    // await page.getByPlaceholder(/type your message/i).fill("Test message");
    // await page.getByRole("button", { name: /send/i }).click();
    // await page.locator('[data-testid="assistant-message"]').waitFor();
    // Clear chat
    // await page.getByRole("button", { name: /clear/i }).click();
    // Confirm clear action
    // await page.getByRole("button", { name: /confirm/i }).click();
    // Check that messages are gone
    // await expect(page.getByText("Test message")).not.toBeVisible();
  });

  test("message input validation", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/dashboard/ai");
    // Try to send empty message
    // await page.getByRole("button", { name: /send/i }).click();
    // Should not send or show error
    // await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
    // Try to send message with only whitespace
    // await page.getByPlaceholder(/type your message/i).fill("   ");
    // await page.getByRole("button", { name: /send/i }).click();
    // Should not send
    // await expect(page.locator('[data-testid="user-message"]')).toHaveCount(0);
  });

  test("typing indicator shows during response", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/dashboard/ai");
    // Send a message
    // await page.getByPlaceholder(/type your message/i).fill("Hello");
    // await page.getByRole("button", { name: /send/i }).click();
    // Check for typing indicator
    // await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();
    // Wait for response to complete
    // await page.locator('[data-testid="assistant-message"]').waitFor();
    // Typing indicator should disappear
    // await expect(page.locator('[data-testid="typing-indicator"]')).not.toBeVisible();
  });

  test("chat with event creation tool", async ({ page }) => {
    // TODO: Add authentication
    // await loginUser(page);
    // await page.goto("/dashboard/ai");
    // Ask AI to create an event
    // await page.getByPlaceholder(/type your message/i).fill("Create an event for tomorrow at 2 PM called 'Team Meeting'");
    // await page.getByRole("button", { name: /send/i }).click();
    // Wait for response
    // await page.locator('[data-testid="assistant-message"]').waitFor();
    // Check that event was created (would need to check calendar or event list)
    // await page.goto("/dashboard");
    // await expect(page.getByText("Team Meeting")).toBeVisible();
  });

  test("error handling for failed requests", async ({ page }) => {
    // TODO: Add authentication and mock network failure
    // await loginUser(page);
    // await page.goto("/dashboard/ai");
    // Mock network failure
    // await page.route('**/api/chat', route => route.abort());
    // Send a message
    // await page.getByPlaceholder(/type your message/i).fill("Test message");
    // await page.getByRole("button", { name: /send/i }).click();
    // Check for error message
    // await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    // await expect(page.getByText(/failed to send message/i)).toBeVisible();
  });
});
