import { test, expect } from "@playwright/test";

test.describe("about page", () => {
  test("loads successfully", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("body")).toBeVisible();
  });
});
