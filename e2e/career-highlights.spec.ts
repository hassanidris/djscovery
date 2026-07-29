import { test, expect } from "@playwright/test";
import {
  TEST_USERS,
  resetDjHighlights,
  disconnectTestPrisma,
} from "./test-setup";

// Run serially: avoids overloading the dev server with concurrent
// cold-compile requests, which was causing 20-70s response times and
// test timeouts.
test.describe.configure({ mode: "serial" });

// Helper function to sign in
async function signIn(page: any, email: string, password: string) {
  await page.goto("/sign-in");

  // Fill email/password form (not Google OAuth)
  const emailInput = page.locator('input[name="email"]');
  const passwordInput = page.locator('input[name="password"]');
  const submitBtn = page.locator(
    'form:has(input[name="email"]) button[type="submit"]',
  );

  await emailInput.fill(email);
  await passwordInput.fill(password);
  await submitBtn.click();

  // Specifically the sign-in page's own error banner (not Next.js dev overlay's
  // always-present empty role="alert" element used for a11y announcements).
  const errorBanner = page.locator('[role="alert"][aria-atomic="true"]');

  try {
    await page.waitForURL((url: URL) => !url.pathname.startsWith("/sign-in"), {
      timeout: 15000,
    });
  } catch {
    if (await errorBanner.isVisible().catch(() => false)) {
      const errorText = await errorBanner.textContent();
      throw new Error(
        `Sign-in failed for ${email}: ${errorText}. Ensure test users are seeded via "npx tsx prisma/seed-test-users.ts".`,
      );
    }
    throw new Error(
      `Sign-in timed out for ${email}: page did not navigate away from /sign-in`,
    );
  }

  // If redirected to onboarding, go to home
  const path = new URL(page.url()).pathname;
  if (
    path.startsWith("/become-dj") ||
    path.startsWith("/become-organizer") ||
    path.startsWith("/select-role")
  ) {
    await page.goto("/");
  }
}

test.describe("Career Highlights", () => {
  test("redirects to sign-in when not authenticated", async ({ page }) => {
    await page.goto("/dj/settings");
    await expect(page).toHaveURL("/sign-in");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });

  test.describe("Authenticated Premium DJ tests", () => {
    // Sign in via the UI ONCE per file and reuse the session for every test
    // below. Signing in before each test (7x here) hit Supabase Auth's own
    // sign-in rate limit ("Too many sign-in attempts"), locking the shared
    // test user out for 15 minutes on repeated runs.
    let storageState: Awaited<
      ReturnType<import("@playwright/test").BrowserContext["storageState"]>
    >;

    test.beforeAll(async ({ browser }) => {
      await resetDjHighlights(TEST_USERS.PREMIUM_DJ.email);

      const context = await browser.newContext();
      const page = await context.newPage();
      await signIn(
        page,
        TEST_USERS.PREMIUM_DJ.email,
        TEST_USERS.PREMIUM_DJ.password,
      );
      storageState = await context.storageState();
      await context.close();
    });

    test.afterAll(async () => {
      await disconnectTestPrisma();
    });

    test.beforeEach(async ({ page }) => {
      // Restore cookies, then seed localStorage (Supabase Auth persists its
      // session there) before any app script runs on first navigation.
      await page.context().addCookies(storageState.cookies);
      await page.addInitScript((origins) => {
        for (const origin of origins) {
          for (const { name, value } of origin.localStorage) {
            window.localStorage.setItem(name, value);
          }
        }
      }, storageState.origins);
    });

    test("shows empty state for DJ with no highlights", async ({ page }) => {
      // Navigate to settings and open highlights tab
      await page.goto("/dj/settings");
      await page.getByRole("tab", { name: "Career Highlights" }).click();

      // Wait for loading to complete (Add Highlight button only appears after loading)
      await expect(
        page.getByRole("button", { name: "Add Highlight" }),
      ).toBeVisible({ timeout: 15000 });

      // Should see empty state
      await expect(page.getByText("No career highlights yet")).toBeVisible({
        timeout: 5000,
      });
    });

    test("opens highlight edit form when clicking add button", async ({
      page,
    }) => {
      await page.goto("/dj/settings");
      await page.getByRole("tab", { name: "Career Highlights" }).click();

      // Click add button
      await page.getByRole("button", { name: "Add Highlight" }).click();

      // Should see form fields
      await expect(page.getByLabel("Year")).toBeVisible();
      await expect(page.getByLabel("Title")).toBeVisible();
      await expect(page.getByLabel("Description (optional)")).toBeVisible();
    });

    test("validates year format (YYYY)", async ({ page }) => {
      await page.goto("/dj/settings");
      await page.getByRole("tab", { name: "Career Highlights" }).click();
      await page.getByRole("button", { name: "Add Highlight" }).click();

      // Fill with invalid year format
      await page.getByLabel("Year").fill("24");
      await page.getByLabel("Title").fill("Test Highlight");
      await page.getByRole("button", { name: "Save" }).click();

      // Should show error toast
      await expect(page.getByText("Year must be in YYYY format")).toBeVisible({
        timeout: 5000,
      });
    });

    test("validates year range (1900 to current + 10)", async ({ page }) => {
      await page.goto("/dj/settings");
      await page.getByRole("tab", { name: "Career Highlights" }).click();
      await page.getByRole("button", { name: "Add Highlight" }).click();

      // Fill with year out of range
      await page.getByLabel("Year").fill("1899");
      await page.getByLabel("Title").fill("Test Highlight");
      await page.getByRole("button", { name: "Save" }).click();

      // Should show error toast
      await expect(page.getByText("Year must be between 1900")).toBeVisible({
        timeout: 5000,
      });
    });

    test("successfully creates highlight with valid data", async ({ page }) => {
      // Reset here (not just in beforeAll) so retries of this test don't
      // accumulate duplicate highlights and trip strict-mode locators below.
      await resetDjHighlights(TEST_USERS.PREMIUM_DJ.email);

      await page.goto("/dj/settings");
      await page.getByRole("tab", { name: "Career Highlights" }).click();
      await page.getByRole("button", { name: "Add Highlight" }).click();

      // Fill valid data
      await page.getByLabel("Year").fill("2024");
      await page.getByLabel("Title").fill("Headlined Afro Nation Portugal");
      await page
        .getByLabel("Description (optional)")
        .fill("Main stage performance for 50,000 attendees");
      await page.getByRole("button", { name: "Save" }).click();

      // Should show success toast (generous timeout: cold-compile dev server
      // responses can take significantly longer than 5s in CI)
      await expect(page.getByText("Career highlights updated")).toBeVisible({
        timeout: 15000,
      });

      // Should see new highlight in list
      await expect(
        page.getByText("Headlined Afro Nation Portugal").first(),
      ).toBeVisible();
      await expect(page.getByText("2024").first()).toBeVisible();
    });

    test("successfully edits existing highlight", async ({ page }) => {
      await page.goto("/dj/settings");
      await page.getByRole("tab", { name: "Career Highlights" }).click();

      // Wait for the async highlights fetch to resolve: the "Add Highlight"
      // button only renders once loading finishes, so this doubles as a
      // reliable readiness signal before we inspect the highlight count
      // (an instant isVisible() check would race the loading spinner).
      await expect(
        page.getByRole("button", { name: "Add Highlight" }),
      ).toBeVisible({ timeout: 15000 });

      // Ensure there's a highlight to edit, independent of whether the
      // previous test's create actually persisted (avoids cascading
      // failures if an earlier test flaked).
      const highlightCount = await page
        .locator('button[aria-label="Edit"]')
        .count();
      if (highlightCount === 0) {
        await page.getByRole("button", { name: "Add Highlight" }).click();
        await page.getByLabel("Year").fill("2024");
        await page.getByLabel("Title").fill("Seed Highlight");
        await page.getByRole("button", { name: "Save" }).click();
        await expect(page.getByText("Career highlights updated")).toBeVisible({
          timeout: 15000,
        });
      }

      // Click edit button (pencil icon)
      await page.locator('button[aria-label="Edit"]').first().click();

      // Modify fields
      await page.getByLabel("Title").fill("Updated Highlight Title");
      await page.getByRole("button", { name: "Save" }).click();

      // Should show success toast
      await expect(page.getByText("Career highlights updated")).toBeVisible({
        timeout: 15000,
      });

      // Wait for edit mode to exit (button should be visible again)
      await expect(page.locator('button[aria-label="Edit"]')).toBeVisible({
        timeout: 5000,
      });

      // Should see updated highlight
      await expect(page.getByText("Updated Highlight Title")).toBeVisible({
        timeout: 5000,
      });
    });

    test("successfully deletes highlight", async ({ page }) => {
      await page.goto("/dj/settings");
      await page.getByRole("tab", { name: "Career Highlights" }).click();

      const initialCount = await page
        .locator('[data-testid="highlight-item"]')
        .count();

      if (initialCount === 0) {
        // Create a highlight first
        await page.getByRole("button", { name: "Add Highlight" }).click();
        await page.getByLabel("Year").fill("2024");
        await page.getByLabel("Title").fill("Test Highlight");
        await page.getByRole("button", { name: "Save" }).click();
        await page.waitForTimeout(1000);
      }

      const countBeforeDelete = await page
        .locator('[data-testid="highlight-item"]')
        .count();

      // Click delete button
      await page.locator('button[aria-label="Delete"]').first().click();

      // Wait for success toast
      await expect(page.getByText("Highlight deleted")).toBeVisible({
        timeout: 5000,
      });

      // Count should decrease
      await expect(page.locator('[data-testid="highlight-item"]')).toHaveCount(
        countBeforeDelete - 1,
      );
    });
  });

  test("gates highlight management to Premium plan", async ({ page }) => {
    await signIn(page, TEST_USERS.FREE_DJ.email, TEST_USERS.FREE_DJ.password);

    await page.goto("/dj/settings");
    await page.getByRole("tab", { name: "Career Highlights" }).click();

    // Should see premium upgrade prompt
    await expect(page.getByText("Premium Feature")).toBeVisible();
    await expect(
      page.getByText("Showcase your career milestones"),
    ).toBeVisible();

    // Should not see add button
    await expect(
      page.getByRole("button", { name: "Add Highlight" }),
    ).not.toBeVisible();
  });
});
