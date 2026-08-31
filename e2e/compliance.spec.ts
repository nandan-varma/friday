import { expect, test } from "@playwright/test";

for (const path of ["/privacy", "/terms", "/support"]) {
  test(`${path} renders without error`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.ok()).toBe(true);
    await expect(page.getByRole("link", { name: "F Friday" })).toBeVisible();
  });
}
