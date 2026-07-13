import { test, expect } from "@playwright/test";

test.describe("events page", () => {
  test("loads successfully", async ({ page }) => {
    await page.goto("/events");
    await expect(page.locator("body")).toBeVisible();
  });
});
