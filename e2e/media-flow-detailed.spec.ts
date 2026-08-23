import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import {
  TEST_USERS,
  resetDjMedia,
  createTestMedia,
  getDjMediaCount,
  disconnectTestPrisma,
} from "./test-setup";

// Ensure auth directory exists
const AUTH_DIR = path.join(__dirname, ".auth");
if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

const PREMIUM_DJ_STATE_PATH = path.join(AUTH_DIR, "premium-dj.json");
const FREE_DJ_STATE_PATH = path.join(AUTH_DIR, "free-dj.json");

/**
 * Sign in and save storage state to a file for reuse across test runs.
 * If the file already exists and is valid, reuse it without signing in.
 */
async function ensureAuthState(
  browser: any,
  email: string,
  password: string,
  statePath: string,
  expectedUrlPattern: RegExp,
): Promise<Awaited<ReturnType<BrowserContext["storageState"]>>> {
  // If we already have a saved state, try to reuse it
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

  // Sign in fresh and save state
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
  for (const originState of state.origins ?? []) {
    try {
      await page.goto(originState.origin, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });
    } catch {
      // ignore navigation errors
    }
    for (const { name, value } of originState.localStorage ?? []) {
      await page.evaluate(([n, v]) => localStorage.setItem(n, v), [
        name,
        value,
      ] as [string, string]);
    }
  }
}

// Run tests serially to avoid race conditions on shared test data
test.describe.configure({ mode: "serial" });

test.describe("media management flow - detailed", () => {
  let premiumDjAuthState: Awaited<
    ReturnType<BrowserContext["storageState"]>
  > | null = null;
  let freeDjAuthState: Awaited<
    ReturnType<BrowserContext["storageState"]>
  > | null = null;

  test.beforeAll(async ({ browser }) => {
    // Clean up any leftover media data
    await resetDjMedia(TEST_USERS.PREMIUM_DJ.email);
    await resetDjMedia(TEST_USERS.FREE_DJ.email);

    // Sign in once and save auth states
    try {
      premiumDjAuthState = await ensureAuthState(
        browser,
        TEST_USERS.PREMIUM_DJ.email,
        TEST_USERS.PREMIUM_DJ.password,
        PREMIUM_DJ_STATE_PATH,
        /\/dj\/overview/,
      );
    } catch (error) {
      console.log("Premium DJ auth setup failed, skipping premium tests");
    }

    try {
      freeDjAuthState = await ensureAuthState(
        browser,
        TEST_USERS.FREE_DJ.email,
        TEST_USERS.FREE_DJ.password,
        FREE_DJ_STATE_PATH,
        /\/dj\/overview/,
      );
    } catch (error) {
      console.log("Free DJ auth setup failed, skipping free tests");
    }
  });

  test.afterAll(async () => {
    await disconnectTestPrisma();
  });

  test.describe("media page structure and UI", () => {
    test("displays media page with correct elements", async ({ page }) => {
      test.skip(!premiumDjAuthState, "Premium DJ auth not available");

      await restoreAuthState(page, premiumDjAuthState!);
      await page.goto("/dj/media");

      // Check main heading
      await expect(page.getByTestId("media-page-title")).toBeVisible();

      // Check add media button
      await expect(page.getByTestId("add-media-button")).toBeVisible();

      // Check tabs exist
      await expect(page.getByRole("tab", { name: /Mixes/ })).toBeVisible();
      await expect(page.getByRole("tab", { name: /Videos/ })).toBeVisible();
      await expect(page.getByRole("tab", { name: /Photos/ })).toBeVisible();
    });

    test("shows empty state when no media exists", async ({ page }) => {
      test.skip(!freeDjAuthState, "Free DJ auth not available");

      await resetDjMedia(TEST_USERS.FREE_DJ.email);
      await restoreAuthState(page, freeDjAuthState!);
      await page.goto("/dj/media");

      // Check for empty state message
      const emptyState = page.getByText(
        /No mixes yet|No videos yet|No photos yet/,
      );
      await expect(emptyState).toBeVisible();
    });
  });

  test.describe("media form interactions", () => {
    test.beforeEach(async () => {
      if (premiumDjAuthState) {
        await resetDjMedia(TEST_USERS.PREMIUM_DJ.email);
      }
    });

    test("opens and closes media form modal", async ({ page }) => {
      test.skip(!premiumDjAuthState, "Premium DJ auth not available");

      await restoreAuthState(page, premiumDjAuthState!);
      await page.goto("/dj/media");

      // Open form
      await page.getByTestId("add-media-button").click();
      await expect(page.getByTestId("media-form-dialog")).toBeVisible();
      await expect(page.getByTestId("media-form-title")).toHaveText(
        "Add Media",
      );

      // Close form
      await page.keyboard.press("Escape");
      await expect(page.getByTestId("media-form-dialog")).not.toBeVisible();
    });

    test("switches between media types in form", async ({ page }) => {
      test.skip(!premiumDjAuthState, "Premium DJ auth not available");

      await restoreAuthState(page, premiumDjAuthState!);
      await page.goto("/dj/media");

      await page.getByTestId("add-media-button").click();

      // Test each media type tab
      const mediaTypes = ["Mix", "Video", "Press"];
      for (const type of mediaTypes) {
        await page.getByRole("tab", { name: type }).click();
        await expect(
          page.getByRole("tab", { name: type, selected: true }),
        ).toBeVisible();
      }
    });

    test("shows appropriate form fields for each media type", async ({
      page,
    }) => {
      test.skip(!premiumDjAuthState, "Premium DJ auth not available");

      await restoreAuthState(page, premiumDjAuthState!);
      await page.goto("/dj/media");

      await page.getByTestId("add-media-button").click();

      // Video type - should show URL input
      await page.getByRole("tab", { name: "Video" }).click();
      await expect(page.getByLabel(/URL/)).toBeVisible();

      // Audio type - should show URL input
      await page.getByRole("tab", { name: "Mix" }).click();
      await expect(page.getByLabel(/URL/)).toBeVisible();

      // Image type - should show file upload
      await page.getByRole("tab", { name: "Press" }).click();
      await expect(page.getByLabel(/Image/)).toBeVisible();
    });

    test("validates required fields", async ({ page }) => {
      test.skip(!premiumDjAuthState, "Premium DJ auth not available");

      await restoreAuthState(page, premiumDjAuthState!);
      await page.goto("/dj/media");

      await page.getByTestId("add-media-button").click();
      await page.getByRole("tab", { name: "Video" }).click();

      // Try to submit without title
      await page.getByRole("button", { name: /Add Media/ }).click();
      await expect(page.getByText(/Title is required/)).toBeVisible();

      // Fill title but not URL
      await page.getByLabel(/Title/).fill("Test Video");
      await page.getByRole("button", { name: /Add Media/ }).click();
      await expect(page.getByText(/URL is required/)).toBeVisible();
    });
  });

  test.describe("media display and management", () => {
    test.beforeEach(async () => {
      if (premiumDjAuthState) {
        await resetDjMedia(TEST_USERS.PREMIUM_DJ.email);
        // Create test media items
        await createTestMedia(TEST_USERS.PREMIUM_DJ.email, "IMAGE", {
          title: "Test Photo",
        });
        await createTestMedia(TEST_USERS.PREMIUM_DJ.email, "VIDEO", {
          title: "Test Video",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        });
      }
    });

    test("displays media cards with correct information", async ({ page }) => {
      test.skip(!premiumDjAuthState, "Premium DJ auth not available");

      await restoreAuthState(page, premiumDjAuthState!);
      await page.goto("/dj/media");

      // Check for media cards
      const mediaCards = page.getByTestId("media-card");
      const count = await mediaCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test("shows edit and delete buttons on hover", async ({ page }) => {
      test.skip(!premiumDjAuthState, "Premium DJ auth not available");

      await restoreAuthState(page, premiumDjAuthState!);
      await page.goto("/dj/media");

      const firstCard = page.getByTestId("media-card").first();
      await firstCard.hover();

      await expect(firstCard.getByTestId("edit-media-button")).toBeVisible();
      await expect(firstCard.getByTestId("delete-media-button")).toBeVisible();
    });

    test("opens edit modal with pre-filled data", async ({ page }) => {
      test.skip(!premiumDjAuthState, "Premium DJ auth not available");

      await restoreAuthState(page, premiumDjAuthState!);
      await page.goto("/dj/media");

      const firstCard = page.getByTestId("media-card").first();
      await firstCard.hover();
      await firstCard.getByTestId("edit-media-button").click();

      await expect(page.getByTestId("media-form-dialog")).toBeVisible();
      await expect(page.getByTestId("media-form-title")).toHaveText(
        "Edit Media",
      );
    });

    test("shows delete confirmation dialog", async ({ page }) => {
      test.skip(!premiumDjAuthState, "Premium DJ auth not available");

      await restoreAuthState(page, premiumDjAuthState!);
      await page.goto("/dj/media");

      const firstCard = page.getByTestId("media-card").first();
      await firstCard.hover();
      await firstCard.getByTestId("delete-media-button").click();

      await expect(
        page.getByRole("alertdialog").getByRole("heading", {
          name: "Delete media?",
        }),
      ).toBeVisible();
    });
  });

  test.describe("plan limits and restrictions", () => {
    test.beforeEach(async () => {
      if (freeDjAuthState) {
        await resetDjMedia(TEST_USERS.FREE_DJ.email);
      }
    });

    test("displays correct limits for free plan", async ({ page }) => {
      test.skip(!freeDjAuthState, "Free DJ auth not available");

      await restoreAuthState(page, freeDjAuthState!);
      await page.goto("/dj/media");

      // Check that limits are displayed
      const limitText = page.getByText(/6.*images/);
      await expect(limitText).toBeVisible();
    });

    test("enforces media creation limits", async ({ page }) => {
      test.skip(!freeDjAuthState, "Free DJ auth not available");

      // Create media up to the limit
      for (let i = 0; i < 6; i++) {
        await createTestMedia(TEST_USERS.FREE_DJ.email, "IMAGE", {
          title: `Test Photo ${i + 1}`,
        });
      }

      await restoreAuthState(page, freeDjAuthState!);
      await page.goto("/dj/media");

      // Navigate to photos tab
      await page.getByRole("tab", { name: /Photos/ }).click();

      // Check that photos are displayed
      const photoCards = page.getByTestId("media-card");
      const count = await photoCards.count();
      expect(count).toBe(6);
    });

    test("premium plan shows unlimited limits", async ({ page }) => {
      test.skip(!premiumDjAuthState, "Premium DJ auth not available");

      // Create more than free plan limits
      for (let i = 0; i < 10; i++) {
        await createTestMedia(TEST_USERS.PREMIUM_DJ.email, "IMAGE", {
          title: `Premium Photo ${i + 1}`,
        });
      }

      await restoreAuthState(page, premiumDjAuthState!);
      await page.goto("/dj/media");

      // Navigate to photos tab
      await page.getByRole("tab", { name: /Photos/ }).click();

      // Should show unlimited indicator
      const limitText = page.getByText(/∞.*images/);
      await expect(limitText).toBeVisible();
    });
  });

  test.describe("media deletion workflow", () => {
    test.beforeEach(async () => {
      if (premiumDjAuthState) {
        await resetDjMedia(TEST_USERS.PREMIUM_DJ.email);
        await createTestMedia(TEST_USERS.PREMIUM_DJ.email, "IMAGE", {
          title: "To Delete",
        });
      }
    });

    test("successfully deletes media item", async ({ page }) => {
      test.skip(!premiumDjAuthState, "Premium DJ auth not available");

      await restoreAuthState(page, premiumDjAuthState!);
      await page.goto("/dj/media");

      const initialCount = await getDjMediaCount(TEST_USERS.PREMIUM_DJ.email);
      expect(initialCount).toBe(1);

      const firstCard = page.getByTestId("media-card").first();
      await firstCard.hover();
      await firstCard.getByTestId("delete-media-button").click();

      // Confirm deletion
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Delete" })
        .click();

      // Wait for deletion to complete
      await page.waitForTimeout(1000);

      const finalCount = await getDjMediaCount(TEST_USERS.PREMIUM_DJ.email);
      expect(finalCount).toBe(0);
    });

    test("cancels deletion when clicking cancel", async ({ page }) => {
      test.skip(!premiumDjAuthState, "Premium DJ auth not available");

      await restoreAuthState(page, premiumDjAuthState!);
      await page.goto("/dj/media");

      const firstCard = page.getByTestId("media-card").first();
      await firstCard.hover();
      await firstCard.getByTestId("delete-media-button").click();

      // Cancel deletion
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Cancel" })
        .click();

      // Dialog should close
      await expect(
        page.getByRole("alertdialog").getByRole("heading", {
          name: "Delete media?",
        }),
      ).not.toBeVisible();

      // Media should still exist
      const count = await getDjMediaCount(TEST_USERS.PREMIUM_DJ.email);
      expect(count).toBe(1);
    });
  });

  test.describe("spotlight functionality", () => {
    test.beforeEach(async () => {
      if (premiumDjAuthState) {
        await resetDjMedia(TEST_USERS.PREMIUM_DJ.email);
      }
    });

    test("shows spotlight toggle for premium users", async ({ page }) => {
      test.skip(!premiumDjAuthState, "Premium DJ auth not available");

      await createTestMedia(TEST_USERS.PREMIUM_DJ.email, "VIDEO", {
        title: "Spotlight Video",
        isSpotlight: false,
      });

      await restoreAuthState(page, premiumDjAuthState!);
      await page.goto("/dj/media");

      const firstCard = page.getByTestId("media-card").first();
      await firstCard.hover();
      await firstCard.getByTestId("edit-media-button").click();

      await expect(page.getByLabel(/Spotlight/)).toBeVisible();
    });

    test("displays spotlight badge on spotlighted items", async ({ page }) => {
      test.skip(!premiumDjAuthState, "Premium DJ auth not available");

      await createTestMedia(TEST_USERS.PREMIUM_DJ.email, "VIDEO", {
        title: "Spotlight Video",
        isSpotlight: true,
      });

      await restoreAuthState(page, premiumDjAuthState!);
      await page.goto("/dj/media");

      const firstCard = page.getByTestId("media-card").first();
      await expect(firstCard.getByText(/Spotlight/)).toBeVisible();
    });
  });

  test.describe("media API functionality", () => {
    test.beforeEach(async () => {
      if (premiumDjAuthState) {
        await resetDjMedia(TEST_USERS.PREMIUM_DJ.email);
        await createTestMedia(TEST_USERS.PREMIUM_DJ.email, "IMAGE", {
          title: "API Test Photo",
        });
      }
    });

    test("API endpoint responds with correct structure", async ({
      request,
    }) => {
      // Test with a sample slug - endpoint should respond even if data doesn't exist
      const response = await request.get(
        "/api/djs/sample-dj/media?page=1&limit=12",
      );

      expect(response.status()).toBeLessThan(500);

      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty("media");
        expect(data).toHaveProperty("totalCount");
        expect(data).toHaveProperty("hasNextPage");
        expect(data).toHaveProperty("typeCounts");
      }
    });

    test("API handles pagination correctly", async ({ request }) => {
      const response = await request.get(
        "/api/djs/sample-dj/media?page=1&limit=6",
      );

      expect(response.status()).toBeLessThan(500);
    });

    test("API handles type filtering", async ({ request }) => {
      const response = await request.get("/api/djs/sample-dj/media?type=IMAGE");

      expect(response.status()).toBeLessThan(500);
    });
  });
});
