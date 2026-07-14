import { test, expect } from "@playwright/test";

test.describe("about page", () => {
  test("loads successfully", async ({ page }) => {
    const response = await page.goto("/about");
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: "About DJcovery" }),
    ).toBeVisible();
  });
});
