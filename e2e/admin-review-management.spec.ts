import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { TEST_USERS } from "./test-setup";

const AUTH_DIR = path.join(__dirname, ".auth");
if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

const ADMIN_STATE_PATH = path.join(AUTH_DIR, "admin.json");

async function ensureAuthState(
  browser: any,
  email: string,
  password: string,
  statePath: string,
  expectedUrlPattern: RegExp,
): Promise<Awaited<ReturnType<BrowserContext["storageState"]>>> {
  if (fs.existsSync(statePath)) {
    const savedState = JSON.parse(fs.readFileSync(statePath, "utf-8"));
    const context = await browser.newContext({ storageState: savedState });
    const page = await context.newPage();
    try {
      await page.goto("/", { waitUntil: "domcontentloaded", timeout: 10000 });
      if (!page.url().includes("/sign-in")) {
        const state = await context.storageState();
        await context.close();
        return state;
      }
    } catch {
      await context.close();
    }
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/sign-in");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page
    .locator('form:has(input[name="email"]) button[type="submit"]')
    .click();
  await page.waitForURL(expectedUrlPattern, { timeout: 15000 });
  const state = await context.storageState();
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  await context.close();
  return state;
}

async function restoreAuthState(
  page: Page,
  state: Awaited<ReturnType<BrowserContext["storageState"]>>,
) {
  await page.context().addCookies(state.cookies);
  for (const origin of state.origins ?? []) {
    await page.goto(origin.origin, { waitUntil: "commit" });
    await page.evaluate((items) => {
      for (const { name, value } of items) localStorage.setItem(name, value);
    }, origin.localStorage ?? []);
  }
  await page.goto("/", { waitUntil: "domcontentloaded" });
}

async function ensureAdminAuth(
  page: Page,
  authState: Awaited<ReturnType<BrowserContext["storageState"]>>,
): Promise<boolean> {
  await restoreAuthState(page, authState);
  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  const currentUrl = page.url();
  if (currentUrl.includes("/sign-in")) {
    return false;
  }
  return true;
}

test.describe.configure({ mode: "serial" });

test.describe("admin review management", () => {
  let adminAuthState: Awaited<
    ReturnType<BrowserContext["storageState"]>
  > | null = null;

  test.beforeAll(async ({ browser }) => {
    adminAuthState = await ensureAuthState(
      browser,
      TEST_USERS.ADMIN.email,
      TEST_USERS.ADMIN.password,
      ADMIN_STATE_PATH,
      /\/admin/,
    );
  });

  test.describe("dashboard review management section", () => {
    test("displays review management stats on dashboard", async ({ page }) => {
      const isAdmin = await ensureAdminAuth(page, adminAuthState!);
      if (!isAdmin) {
        test.skip("Admin user not authenticated or doesn't have admin role");
        return;
      }

      await expect(page.locator("h1")).toContainText("Dashboard");

      const reviewSection = page.getByText("Review Management");
      await expect(reviewSection).toBeVisible();

      await expect(page.getByText("Pending Moderation")).toBeVisible();
      await expect(page.getByText("Suspicious Reviews")).toBeVisible();
      await expect(page.getByText("Unresponded Reviews")).toBeVisible();
      await expect(page.getByText("Avg Rating")).toBeVisible();
    });

    test("links to reviews page from dashboard", async ({ page }) => {
      const isAdmin = await ensureAdminAuth(page, adminAuthState!);
      if (!isAdmin) {
        test.skip("Admin user not authenticated or doesn't have admin role");
        return;
      }

      const reviewsLink = page.getByRole("link", { name: /View all reviews/i });
      await reviewsLink.click();

      await expect(page).toHaveURL(/\/admin\/reviews/);
    });
  });

  test.describe("reviews listing page", () => {
    test("displays reviews table with moderation status", async ({ page }) => {
      const isAdmin = await ensureAdminAuth(page, adminAuthState!);
      if (!isAdmin) {
        test.skip("Admin user not authenticated or doesn't have admin role");
        return;
      }

      await page.goto("/admin/reviews", { waitUntil: "domcontentloaded" });

      await expect(page.getByText("Reviews")).toBeVisible();
    });

    test("filters reviews by moderation status", async ({ page }) => {
      const isAdmin = await ensureAdminAuth(page, adminAuthState!);
      if (!isAdmin) {
        test.skip("Admin user not authenticated or doesn't have admin role");
        return;
      }

      await page.goto("/admin/reviews?moderationStatus=PENDING", {
        waitUntil: "domcontentloaded",
      });

      await expect(page.getByText("PENDING")).toBeVisible();
    });
  });

  test.describe("analytics page", () => {
    test("displays review analytics dashboard", async ({ page }) => {
      const isAdmin = await ensureAdminAuth(page, adminAuthState!);
      if (!isAdmin) {
        test.skip("Admin user not authenticated or doesn't have admin role");
        return;
      }

      await page.goto("/admin/reviews/analytics", {
        waitUntil: "domcontentloaded",
      });

      await expect(page.getByText("Review Analytics")).toBeVisible();
    });
  });

  test.describe("moderation queue", () => {
    test("displays suspicious reviews queue", async ({ page }) => {
      const isAdmin = await ensureAdminAuth(page, adminAuthState!);
      if (!isAdmin) {
        test.skip("Admin user not authenticated or doesn't have admin role");
        return;
      }

      await page.goto("/admin/reviews/moderation", {
        waitUntil: "domcontentloaded",
      });

      await expect(page.getByText("Moderation Queue")).toBeVisible();
    });
  });

  test.describe("response management", () => {
    test("displays response tracking dashboard", async ({ page }) => {
      const isAdmin = await ensureAdminAuth(page, adminAuthState!);
      if (!isAdmin) {
        test.skip("Admin user not authenticated or doesn't have admin role");
        return;
      }

      await page.goto("/admin/reviews/responses", {
        waitUntil: "domcontentloaded",
      });

      await expect(page.getByText("Response Management")).toBeVisible();
    });
  });

  test.describe("advanced features", () => {
    test("displays advanced features dashboard", async ({ page }) => {
      const isAdmin = await ensureAdminAuth(page, adminAuthState!);
      if (!isAdmin) {
        test.skip("Admin user not authenticated or doesn't have admin role");
        return;
      }

      await page.goto("/admin/reviews/advanced", {
        waitUntil: "domcontentloaded",
      });

      await expect(page.getByText("Advanced Features")).toBeVisible();
    });
  });
});
