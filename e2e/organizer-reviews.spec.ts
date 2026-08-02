import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { TEST_USERS } from "./test-setup";

// Ensure auth directory exists
const AUTH_DIR = path.join(__dirname, ".auth");
if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

const FREE_DJ_STATE_PATH = path.join(AUTH_DIR, "free-dj.json");

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

test.describe("organizer reviews", () => {
  let djAuthState: Awaited<ReturnType<BrowserContext["storageState"]>> | null =
    null;

  test.beforeAll(async ({ browser }) => {
    djAuthState = await ensureAuthState(
      browser,
      TEST_USERS.FREE_DJ.email,
      TEST_USERS.FREE_DJ.password,
      FREE_DJ_STATE_PATH,
      /\/$/,
    );
  });

  test.describe("DJ review submission", () => {
    test("redirects to sign-in when not authenticated", async ({ page }) => {
      await page.goto(
        "/gigs/demo-summer-house-night-stockholm/organizer-review",
      );
      await expect(page).toHaveURL(/\/sign-in(\?.*)?$/);
    });

    test.skip("shows review page when authenticated DJ", async ({ page }) => {
      // TODO: Implement with seedCompletedGigForOrganizerReview
    });

    test.skip("displays error when gig not completed", async ({ page }) => {
      // TODO: Implement with seedCompletedGigForOrganizerReview
    });

    test.skip("successfully submits organizer review with valid data", async ({
      page,
    }) => {
      // TODO: Implement with seedCompletedGigForOrganizerReview and cleanupOrganizerReviewTestData
    });

    test.skip("validates all category ratings are required", async ({
      page,
    }) => {
      // TODO: Implement with seedCompletedGigForOrganizerReview
    });

    test.skip("validates review text minimum length", async ({ page }) => {
      // TODO: Implement with seedCompletedGigForOrganizerReview
    });

    test.skip("shows already reviewed state for duplicate reviews", async ({
      page,
    }) => {
      // TODO: Implement with seedCompletedGigForOrganizerReview
    });

    test.skip("shows review expired state after 30 days", async ({ page }) => {
      // TODO: Implement with seedCompletedGigForOrganizerReview
    });
  });

  test.describe("organizer review display", () => {
    test.skip("displays reviews on organizer profile", async ({ page }) => {
      // TODO: Implement with seedCompletedGigForOrganizerReview
    });

    test.skip("shows rating breakdown distribution", async ({ page }) => {
      // TODO: Implement with seedCompletedGigForOrganizerReview
    });

    test.skip("displays category ratings in review cards", async ({ page }) => {
      // TODO: Implement with seedCompletedGigForOrganizerReview
    });

    test.skip("allows reporting inappropriate reviews", async ({ page }) => {
      // TODO: Implement with seedCompletedGigForOrganizerReview
    });
  });

  test.describe("velocity limits", () => {
    test.skip("enforces one review per week per DJ", async ({ page }) => {
      // TODO: Implement with seedCompletedGigForOrganizerReview
    });

    test.skip("enforces max 3 reviews per week per organizer", async ({
      page,
    }) => {
      // TODO: Implement with seedCompletedGigForOrganizerReview
    });
  });

  test.describe("reputation integration", () => {
    test.skip("updates organizer reputation score on review", async ({
      page,
    }) => {
      // TODO: Implement with seedCompletedGigForOrganizerReview
    });

    test.skip("sends notification to organizer on review", async ({ page }) => {
      // TODO: Implement with seedCompletedGigForOrganizerReview
    });
  });
});
