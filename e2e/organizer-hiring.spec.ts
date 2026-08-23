import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import {
  TEST_USERS,
  createTestGig,
  createTestApplication,
  createTestHire,
  cleanupHiringTestData,
  resetApplicationStatus,
  disconnectTestPrisma,
} from "./test-setup";

// Ensure auth directory exists
const AUTH_DIR = path.join(__dirname, ".auth");
if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

const ORGANIZER_STATE_PATH = path.join(AUTH_DIR, "organizer.json");
const ADMIN_STATE_PATH = path.join(AUTH_DIR, "admin.json");

// Shared state across tests in this file
let testGigId: number;
let testApplicationId: number;
let testHireId: number;

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
  // If we already have a saved state, try to reuse it
  if (fs.existsSync(statePath)) {
    const savedState = JSON.parse(fs.readFileSync(statePath, "utf-8"));
    // Verify the session is still valid by making a request
    const context = await browser.newContext({ storageState: savedState });
    const page = await context.newPage();
    try {
      await page.goto("/", { waitUntil: "domcontentloaded", timeout: 10000 });
      // If we're not redirected to sign-in, the session is valid
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
  for (const origin of state.origins ?? []) {
    for (const { name, value } of origin.localStorage ?? []) {
      await page.evaluate(([n, v]) => localStorage.setItem(n, v), [
        name,
        value,
      ] as [string, string]);
    }
  }
}

// Run tests serially to avoid race conditions on shared test data
test.describe.configure({ mode: "serial" });

// --- Organizer hiring flow ---

test.describe("organizer hiring flow", () => {
  let organizerAuthState: Awaited<
    ReturnType<BrowserContext["storageState"]>
  > | null = null;

  test.beforeAll(async ({ browser }) => {
    // Clean up any leftover data, then create fresh test data
    await cleanupHiringTestData(
      TEST_USERS.ORGANIZER.email,
      TEST_USERS.FREE_DJ.email,
    );

    const gig = await createTestGig(TEST_USERS.ORGANIZER.email);
    testGigId = gig.id;

    const application = await createTestApplication(
      testGigId,
      TEST_USERS.FREE_DJ.email,
    );
    testApplicationId = application.id;

    // Sign in once and save auth state (reuses existing session if available)
    organizerAuthState = await ensureAuthState(
      browser,
      TEST_USERS.ORGANIZER.email,
      TEST_USERS.ORGANIZER.password,
      ORGANIZER_STATE_PATH,
      /\/$/,
    );
  });

  test.afterAll(async () => {
    // Don't immediately delete test data — leave it for 24h so you can
    // manually inspect the flow. Old data is cleaned up on the next run.
    await disconnectTestPrisma();
  });

  test("redirects to sign-in when not authenticated", async ({ page }) => {
    await page.goto(`/organizer/gigs/${testGigId}/applications`);
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });

  test("loads gigs page for authenticated organizer", async ({ page }) => {
    await restoreAuthState(page, organizerAuthState!);
    await page.goto("/organizer/gigs");
    await expect(page.getByRole("heading", { name: "Gigs" })).toBeVisible();
  });

  test("shows gig in organizer gigs list", async ({ page }) => {
    await restoreAuthState(page, organizerAuthState!);
    await page.goto("/organizer/gigs");
    await expect(
      page.locator(`a[href="/organizer/gigs/${testGigId}"]`),
    ).toBeVisible();
  });

  test("loads applications page and shows applicant", async ({ page }) => {
    await restoreAuthState(page, organizerAuthState!);
    await page.goto(`/organizer/gigs/${testGigId}/applications`);
    await expect(
      page.getByRole("heading", { name: "Applicants" }),
    ).toBeVisible();
    await expect(page.getByText("Test Gig for Hiring")).toBeVisible();
    await expect(page.getByText("Test Free DJ")).toBeVisible();
    await expect(page.getByText("I'm interested in this gig")).toBeVisible();
  });

  test("shows shortlist and accept buttons for APPLIED applicant", async ({
    page,
  }) => {
    await restoreAuthState(page, organizerAuthState!);
    await page.goto(`/organizer/gigs/${testGigId}/applications`);
    await expect(page.getByRole("button", { name: "Shortlist" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Accept", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Reject", exact: true }),
    ).toBeVisible();
  });

  test("can shortlist an applicant", async ({ page }) => {
    // Reset application status to APPLIED before each run
    await resetApplicationStatus(testGigId, TEST_USERS.FREE_DJ.email);

    await restoreAuthState(page, organizerAuthState!);
    await page.goto(`/organizer/gigs/${testGigId}/applications`);

    // Server actions trigger form submissions that cause page navigation/re-render.
    // Wait for the navigation to complete and the SHORTLISTED badge to appear.
    await page.getByRole("button", { name: "Shortlist" }).click();
    await page.waitForLoadState("networkidle", { timeout: 20000 });
    await expect(page.getByText("SHORTLISTED")).toBeVisible({ timeout: 20000 });
  });

  test("can navigate back to gig details from applications", async ({
    page,
  }) => {
    await restoreAuthState(page, organizerAuthState!);
    await page.goto(`/organizer/gigs/${testGigId}/applications`);
    const backLink = page.getByRole("link", { name: /Back to Gig/ });
    await backLink.click();
    await page.waitForURL(new RegExp(`/organizer/gigs/${testGigId}$`), {
      timeout: 10000,
    });
    await expect(page).toHaveURL(new RegExp(`/organizer/gigs/${testGigId}$`));
  });
});

// --- Admin hires management ---

test.describe("admin hires management", () => {
  let adminAuthState: Awaited<
    ReturnType<BrowserContext["storageState"]>
  > | null = null;

  test.beforeAll(async ({ browser }) => {
    // Clean up, then create a gig + application + hire for admin tests
    await cleanupHiringTestData(
      TEST_USERS.ORGANIZER.email,
      TEST_USERS.FREE_DJ.email,
    );

    const gig = await createTestGig(TEST_USERS.ORGANIZER.email);
    testGigId = gig.id;

    const application = await createTestApplication(
      testGigId,
      TEST_USERS.FREE_DJ.email,
    );
    testApplicationId = application.id;

    const hire = await createTestHire(testApplicationId, 500);
    testHireId = hire.id;

    // Sign in once and save auth state (reuses existing session if available)
    adminAuthState = await ensureAuthState(
      browser,
      TEST_USERS.ADMIN.email,
      TEST_USERS.ADMIN.password,
      ADMIN_STATE_PATH,
      /\/admin/,
    );
  });

  test.afterAll(async () => {
    // Don't immediately delete test data — leave it for 24h so you can
    // manually inspect the flow. Old data is cleaned up on the next run.
    await disconnectTestPrisma();
  });

  test("redirects to sign-in when not authenticated", async ({ page }) => {
    await page.goto("/admin/hires");
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });

  test("loads hires page for authenticated admin", async ({ page }) => {
    await restoreAuthState(page, adminAuthState!);
    await page.goto("/admin/hires");
    await expect(page.getByRole("heading", { name: "Hires" })).toBeVisible();
    await expect(
      page.getByText("Manage gig applications that became actual hires"),
    ).toBeVisible();
  });

  test("displays hires table with correct columns", async ({ page }) => {
    await restoreAuthState(page, adminAuthState!);
    await page.goto("/admin/hires");
    await expect(page.getByRole("columnheader", { name: "DJ" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Gig" })).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Organizer" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Rate" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Status" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Event Date" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Created" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Actions" }),
    ).toBeVisible();
  });

  test("shows test hire in the table", async ({ page }) => {
    await restoreAuthState(page, adminAuthState!);
    await page.goto("/admin/hires");
    await expect(page.getByText("Test Free DJ").first()).toBeVisible();
    await expect(page.getByText("Test Gig for Hiring").first()).toBeVisible();
    await expect(page.getByText("500.00").first()).toBeVisible();
    await expect(page.getByText("Active").first()).toBeVisible();
  });

  test("shows action buttons for ACTIVE hire", async ({ page }) => {
    await restoreAuthState(page, adminAuthState!);
    await page.goto("/admin/hires");
    await expect(
      page.getByRole("button", { name: "Complete" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "No Show" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Cancel" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "View" }).first(),
    ).toBeVisible();
  });

  test("can filter hires by status", async ({ page }) => {
    await restoreAuthState(page, adminAuthState!);
    await page.goto("/admin/hires");
    // Open the status filter dropdown (shadcn Select trigger)
    await page.locator('[role="combobox"]').first().click();
    // Click the "Active" option in the dropdown
    await page.getByRole("option", { name: "Active" }).click();
    await expect(page).toHaveURL(/status=ACTIVE/);
    await expect(page.getByText("Test Free DJ").first()).toBeVisible();
  });

  test("can view hire details page", async ({ page }) => {
    await restoreAuthState(page, adminAuthState!);
    await page.goto("/admin/hires");
    // Navigate to the hire detail page via the View link
    await page.locator(`a[href="/admin/hires/${testHireId}"]`).click();
    await page.waitForURL(new RegExp(`/admin/hires/${testHireId}$`), {
      timeout: 10000,
    });
    await expect(
      page.getByRole("heading", { name: `Hire #${testHireId}` }),
    ).toBeVisible();
  });

  test("hire detail page shows all sections", async ({ page }) => {
    await restoreAuthState(page, adminAuthState!);
    await page.goto(`/admin/hires/${testHireId}`);
    await expect(page.getByText("Hire Details")).toBeVisible();
    await expect(page.getByText("Gig & Event Details")).toBeVisible();
    await expect(page.getByText("Admin Actions")).toBeVisible();
  });

  test("hire detail page shows DJ and organizer info", async ({ page }) => {
    await restoreAuthState(page, adminAuthState!);
    await page.goto(`/admin/hires/${testHireId}`);
    await expect(page.getByText("Test Free DJ").first()).toBeVisible();
    await expect(page.getByText("Test Organizer").first()).toBeVisible();
    await expect(page.getByText("Test Gig for Hiring").first()).toBeVisible();
  });

  test("hire detail page shows status actions for ACTIVE hire", async ({
    page,
  }) => {
    await restoreAuthState(page, adminAuthState!);
    await page.goto(`/admin/hires/${testHireId}`);
    await expect(
      page.getByRole("button", { name: /Mark Complete/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Mark No Show/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Cancel Hire/ }),
    ).toBeVisible();
  });

  test("can navigate back to hires list from detail page", async ({ page }) => {
    await restoreAuthState(page, adminAuthState!);
    await page.goto(`/admin/hires/${testHireId}`);
    await page.locator('a[aria-label="Back to hires"]').click();
    await page.waitForURL(/\/admin\/hires$/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin\/hires$/);
  });

  test("hire detail page has notes textarea", async ({ page }) => {
    await restoreAuthState(page, adminAuthState!);
    await page.goto(`/admin/hires/${testHireId}`);
    await expect(page.locator('textarea[name="notes"]')).toBeVisible();
    await expect(page.getByText("Admin Notes")).toBeVisible();
  });

  test("hires link to DJ profile and gig", async ({ page }) => {
    await restoreAuthState(page, adminAuthState!);
    await page.goto("/admin/hires");
    const djLink = page.locator('a[href*="/djs/test-free-dj"]').first();
    await expect(djLink).toBeVisible();
    const gigLink = page.locator('a[href*="/gigs/test-gig-"]').first();
    await expect(gigLink).toBeVisible();
  });
});
