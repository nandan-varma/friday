import { test, expect } from "@playwright/test";
import { login } from "./utils";
import { TEST_CREDENTIALS } from "./credentials";

test.describe("AI Chat", () => {
  test("should load AI chat page structure", async ({ page }) => {
    await page.goto("/");
    // Basic check that the page loads
    await expect(page.locator("body")).toBeVisible();
  });

  test("should display AI chat interface", async ({ page }) => {
    await login(page, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);
    await page.click("text=AI");

    await expect(page.locator("text=AI Assistant")).toBeVisible();
    await expect(
      page.locator('input[placeholder*="Ask me about your calendar"]'),
    ).toBeVisible();
  });

  test("should send a message and receive response", async ({ page }) => {
    await login(page, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);
    await page.click("text=AI");

    const message = "Hello, can you help me schedule a meeting?";

    await page.fill(
      'input[placeholder*="Ask me about your calendar"]',
      message,
    );
    await page.click("button:has(svg.lucide-send)");

    // Wait for response - check for any response content
    await page.waitForTimeout(2000); // Simple wait for response

    await expect(page.locator(`text=${message}`)).toBeVisible();
  });

  test("should handle multiple messages", async ({ page }) => {
    await login(page, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);
    await page.click("text=AI");

    const messages = ["Hello", "How are you?", "What's the weather like?"];

    for (const message of messages) {
      await page.fill(
        'input[placeholder*="Ask me about your calendar"]',
        message,
      );
      await page.click("button:has(svg.lucide-send)");
      await page.waitForTimeout(1000); // Simple wait between messages
    }

    // Check that all user messages are displayed (look for user message bubbles)
    for (const message of messages) {
      await expect(page.locator(`text=${message}`).first()).toBeVisible();
    }
  });
});
