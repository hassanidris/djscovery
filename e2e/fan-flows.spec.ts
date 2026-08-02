import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { TEST_USERS } from "./test-setup";

// Ensure auth directory exists
const AUTH_DIR = path.join(__dirname, ".auth");
if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

const FAN_STATE_PATH = path.join(AUTH_DIR, "fan.json");

/**
 * Sign in and save storage state to a file for reuse across test runs.
 * If the file already exists and is valid, reuse it without signing in.
 * This avoids hitting the rate limiter by signing in only once per user.
 */
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
      // Session might be expired, fall through to sign in
    }
    await context.close();
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

/** Restore saved auth state into the current page's context. */
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
}

// Run tests serially so the shared auth state is set up once before tests
test.describe.configure({ mode: "serial" });

test.describe("fan flows", () => {
  let fanAuthState: Awaited<ReturnType<BrowserContext["storageState"]>> | null =
    null;

  test.beforeAll(async ({ browser }) => {
    fanAuthState = await ensureAuthState(
      browser,
      TEST_USERS.FAN.email,
      TEST_USERS.FAN.password,
      FAN_STATE_PATH,
      (url) => !url.pathname.includes("/sign-in"),
    );
  });

  test.describe("fan profile & settings", () => {
    test("redirects to sign-in when not authenticated", async ({ page }) => {
      await page.goto("/fan/profile");
      await expect(page).toHaveURL("/sign-in");
      await expect(
        page.getByRole("heading", { name: "Sign In" }),
      ).toBeVisible();
    });

    test("redirects to sign-in for settings when not authenticated", async ({
      page,
    }) => {
      await page.goto("/fan/settings");
      await expect(page).toHaveURL("/sign-in");
      await expect(
        page.getByRole("heading", { name: "Sign In" }),
      ).toBeVisible();
    });

    test("redirects to sign-in for account when not authenticated", async ({
      page,
    }) => {
      await page.goto("/fan/account");
      await expect(page).toHaveURL("/sign-in");
      await expect(
        page.getByRole("heading", { name: "Sign In" }),
      ).toBeVisible();
    });

    test("loads fan profile dashboard when authenticated", async ({ page }) => {
      await restoreAuthState(page, fanAuthState!);
      await page.goto("/fan/profile");
      await expect(page).toHaveURL("/fan/profile");
      await expect(page.locator("body")).toBeVisible();
    });

    test("loads settings page when authenticated", async ({ page }) => {
      await restoreAuthState(page, fanAuthState!);
      await page.goto("/fan/settings");
      await expect(page).toHaveURL("/fan/settings");
      await expect(page.locator("body")).toBeVisible();
    });
  });

  test.describe("followed djs", () => {
    test("redirects to sign-in when not authenticated", async ({ page }) => {
      await page.goto("/fan/followed-djs");
      await expect(page).toHaveURL("/sign-in");
      await expect(
        page.getByRole("heading", { name: "Sign In" }),
      ).toBeVisible();
    });

    test("shows followed djs page when authenticated", async ({ page }) => {
      await restoreAuthState(page, fanAuthState!);
      await page.goto("/fan/followed-djs");
      await expect(page).toHaveURL("/fan/followed-djs");
      await expect(page.locator("body")).toBeVisible();
    });
  });

  test.describe("saved events", () => {
    test("redirects to sign-in when not authenticated", async ({ page }) => {
      await page.goto("/fan/saved-events");
      await expect(page).toHaveURL("/sign-in");
      await expect(
        page.getByRole("heading", { name: "Sign In" }),
      ).toBeVisible();
    });

    test("shows saved events page when authenticated", async ({ page }) => {
      await restoreAuthState(page, fanAuthState!);
      await page.goto("/fan/saved-events");
      await expect(page).toHaveURL("/fan/saved-events");
      await expect(page.locator("body")).toBeVisible();
    });
  });

  test.describe("reviews", () => {
    test("redirects to sign-in when not authenticated", async ({ page }) => {
      await page.goto("/fan/reviews");
      await expect(page).toHaveURL("/sign-in");
      await expect(
        page.getByRole("heading", { name: "Sign In" }),
      ).toBeVisible();
    });

    test("shows reviews page when authenticated", async ({ page }) => {
      await restoreAuthState(page, fanAuthState!);
      await page.goto("/fan/reviews");
      await expect(page).toHaveURL("/fan/reviews");
      await expect(page.locator("body")).toBeVisible();
    });
  });

  test.describe("notifications", () => {
    test("redirects to sign-in when not authenticated", async ({ page }) => {
      await page.goto("/fan/notifications");
      await expect(page).toHaveURL("/sign-in");
      await expect(
        page.getByRole("heading", { name: "Sign In" }),
      ).toBeVisible();
    });

    test("shows notifications page when authenticated", async ({ page }) => {
      await restoreAuthState(page, fanAuthState!);
      await page.goto("/fan/notifications");
      await expect(page).toHaveURL("/fan/notifications");
      await expect(page.locator("body")).toBeVisible();
    });
  });
});
