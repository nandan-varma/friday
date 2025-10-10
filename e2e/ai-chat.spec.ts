import { test, expect } from "@playwright/test";
import { signup } from "./utils";

test.describe("AI Chat", () => {
  test("should load AI chat page structure", async ({ page }) => {
    await page.goto("/");
    // Basic check that the page loads
    await expect(page.locator("body")).toBeVisible();
  });

  test("should display AI chat interface", async ({ page }) => {
    const email = `ai-chat-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "AI Chat Test User";

    await signup(page, email, password, name);
    await page.click('text=AI');

    await expect(page.locator("text=AI Assistant")).toBeVisible();
    await expect(page.locator('textarea[placeholder*="Ask me"]')).toBeVisible();
  });

  test("should send a message and receive response", async ({ page }) => {
    const email = `ai-message-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "AI Message Test User";

    await signup(page, email, password, name);
    await page.click('text=AI');

    const message = "Hello, can you help me schedule a meeting?";

    await page.fill('textarea[name="message"]', message);
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForSelector('[data-testid="ai-response"]');
    
    await expect(page.locator(`text=${message}`)).toBeVisible();
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible();
  });

  test("should handle multiple messages", async ({ page }) => {
    const email = `ai-multi-test${Date.now()}@example.com`;
    const password = "password123";
    const name = "AI Multi Test User";

    await signup(page, email, password, name);
    await page.click('text=AI');

    const messages = ["Hello", "How are you?", "What's the weather like?"];

    for (const message of messages) {
      await page.fill('textarea[name="message"]', message);
      await page.click('button[type="submit"]');
      await page.waitForSelector('[data-testid="ai-response"]');
    }

    // Check that all messages are displayed
    for (const message of messages) {
      await expect(page.locator(`text=${message}`)).toBeVisible();
    }
  });
});
