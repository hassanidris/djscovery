import { test, expect } from "@playwright/test";

test.describe("homepage", () => {
  test("loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });
});
