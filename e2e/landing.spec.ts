import { expect, test } from "@playwright/test";

test("landing page renders the hero and links to auth", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Never miss what matters" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Get started free" }).first().click();
  await expect(page).toHaveURL("/auth");
});

test("landing page links to the compliance pages", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");

  await footer.getByRole("link", { name: "Privacy" }).click();
  await expect(page).toHaveURL("/privacy");

  await page.goto("/");
  await page.locator("footer").getByRole("link", { name: "Terms" }).click();
  await expect(page).toHaveURL("/terms");

  await page.goto("/");
  await page.locator("footer").getByRole("link", { name: "Support" }).click();
  await expect(page).toHaveURL("/support");
});
