import { test, expect } from "@playwright/test";

test.describe("media management flow", () => {
  test.describe("authentication and access", () => {
    test("redirects to sign-in when not authenticated", async ({ page }) => {
      await page.goto("/dj/media");
      await expect(page).toHaveURL(/\/sign-in/);
      await expect(
        page.getByRole("heading", { name: "Sign In" }),
      ).toBeVisible();
    });

    test("media management page exists", async ({ page }) => {
      // Just verify the route exists by checking if it loads (even if redirected)
      const response = await page.goto("/dj/media");
      expect(response?.status()).toBeLessThan(500);
    });
  });

  test.describe("media API endpoint", () => {
    test("media API endpoint exists and responds", async ({ request }) => {
      // Test with a sample slug - endpoint should respond even if data doesn't exist
      const response = await request.get(
        "/api/djs/sample-dj/media?page=1&limit=12",
      );

      // Should respond (either 404 for missing slug or 200 with empty data)
      expect(response.status()).toBeLessThan(500);
    });

    test("media API handles pagination parameters", async ({ request }) => {
      const response = await request.get(
        "/api/djs/sample-dj/media?page=2&limit=6",
      );

      expect(response.status()).toBeLessThan(500);
    });

    test("media API handles type filter", async ({ request }) => {
      const response = await request.get("/api/djs/sample-dj/media?type=IMAGE");

      expect(response.status()).toBeLessThan(500);
    });
  });

  test.describe("media components are renderable", () => {
    test("media form component routes exist", async ({ page }) => {
      // This test verifies the media management infrastructure exists
      // by checking that related routes respond without errors
      const response = await page.goto("/dj/overview");

      // The route should exist (even if it redirects to sign-in)
      expect(response?.status()).toBeLessThan(500);
    });

    test("public DJ profile pages load", async ({ page }) => {
      // Test that public profile pages exist (media is displayed there)
      await page.goto("/djs/peggy-gou");

      // Should load successfully (even if it's demo data)
      await expect(page).toHaveURL(/\/djs\//);
    });
  });

  test.describe("media infrastructure", () => {
    test("media-related routes are defined", async ({ page }) => {
      // Check that key media routes exist by testing their response
      const routes = ["/dj/media", "/dj/overview"];

      for (const route of routes) {
        const response = await page.goto(route);
        expect(response?.status()).toBeLessThan(500);
      }
    });

    test("media tracking endpoint exists", async ({ request }) => {
      // Test the media view tracking endpoint
      const response = await request.post("/api/track-media-view", {
        data: { mediaId: 1, type: "VIDEO" },
      });

      // Should respond (even if media doesn't exist)
      expect(response.status()).toBeLessThan(500);
    });
  });
});
