import { test, expect } from "@playwright/test";

const CRITICAL_PAGES = [
  { path: "/", name: "home" },
  { path: "/about", name: "about" },
  { path: "/community", name: "community" },
  { path: "/directory", name: "directory" },
  { path: "/events", name: "events" },
];

const ADDITIONAL_PAGES = [
  { path: "/contact", name: "contact" },
  { path: "/faq", name: "faq" },
  { path: "/gigs", name: "gigs" },
  { path: "/sign-in", name: "sign-in" },
  { path: "/sign-up", name: "sign-up" },
  { path: "/forgot-password", name: "forgot-password" },
  { path: "/privacy", name: "privacy" },
  { path: "/terms-of-service", name: "terms-of-service" },
  { path: "/cookie-policy", name: "cookie-policy" },
];

test.describe("Visual Regression - Critical Pages", () => {
  CRITICAL_PAGES.forEach(({ path, name }) => {
    test(`${name} page matches baseline`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible();

      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot(`${name}.png`, {
        fullPage: true,
        maxDiffPixels: 100,
      });
    });
  });
});

test.describe("Visual Regression - Additional Pages", () => {
  ADDITIONAL_PAGES.forEach(({ path, name }) => {
    test(`${name} page matches baseline`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible();

      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot(`${name}.png`, {
        fullPage: true,
        maxDiffPixels: 100,
      });
    });
  });
});
