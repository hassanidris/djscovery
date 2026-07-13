import { test, expect } from "@playwright/test";

test.describe("become dj page", () => {
  test("loads successfully", async ({ page }) => {
    await page.goto("/become-dj");
    await expect(page.locator("body")).toBeVisible();
  });
});
