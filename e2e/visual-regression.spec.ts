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

const COOKIE_CONSENT = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
  updatedAt: new Date().toISOString(),
};

const SCREENSHOT_OPTS = {
  maxDiffPixelRatio: 0.1,
  threshold: 0.3,
  animations: "disabled" as const,
};

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.use({ viewport: { width: 1280, height: 900 } });

test.describe.configure({ mode: "serial" });

async function setupPage(page: import("@playwright/test").Page) {
  await page.context().addCookies([
    {
      name: "djcovery-consent",
      value: encodeURIComponent(JSON.stringify(COOKIE_CONSENT)),
      url: BASE_URL,
    },
  ]);
}

async function capturePage(
  page: import("@playwright/test").Page,
  path: string,
  name: string,
) {
  await setupPage(page);
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).toBeVisible();

  await page.evaluate(() => document.fonts.ready.then(() => undefined));

  // Wait for every <img> (including Next/Image-rendered ones, e.g. remote
  // event posters) to finish loading before capturing. Without this, slow
  // or in-flight network image loads cause large, consistent pixel diffs in
  // CI that have nothing to do with real visual regressions. Bounded so a
  // genuinely broken image (network down) can't hang the test forever.
  await page
    .waitForFunction(
      () => Array.from(document.images).every((img) => img.complete),
      { timeout: 15000 },
    )
    .catch(() => undefined);

  await page.waitForTimeout(1000);

  await page.addStyleTag({
    content: `* { font-family: Arial, sans-serif !important; }`,
  });

  await expect(page).toHaveScreenshot(`${name}.png`, SCREENSHOT_OPTS);
}

test.describe("Visual Regression - Critical Pages", () => {
  CRITICAL_PAGES.forEach(({ path, name }) => {
    test(`${name} page matches baseline`, async ({ page }) => {
      await capturePage(page, path, name);
    });
  });
});

test.describe("Visual Regression - Additional Pages", () => {
  ADDITIONAL_PAGES.forEach(({ path, name }) => {
    test(`${name} page matches baseline`, async ({ page }) => {
      await capturePage(page, path, name);
    });
  });
});
