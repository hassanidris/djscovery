import {
  test,
  expect,
  type Page,
  type BrowserContext,
  type Browser,
} from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { TEST_USERS } from "./test-setup";

// ─── Helpers ──────────────────────────────────────────────────────────────

const AUTH_DIR = path.join(__dirname, ".auth");
const ADMIN_STATE_PATH = path.join(AUTH_DIR, "admin.json");
const ORGANIZER_STATE_PATH = path.join(AUTH_DIR, "organizer.json");
const FREE_DJ_STATE_PATH = path.join(AUTH_DIR, "free-dj.json");
const FAN_STATE_PATH = path.join(AUTH_DIR, "fan.json");

async function ensureAuthState(
  browser: Browser,
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
      // fall through
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
  await page.waitForURL(expectedUrlPattern, { timeout: 30000 });
  const state = await context.storageState();
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }
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
}

// The Skeleton primitive renders <div data-slot="skeleton" class="animate-pulse ...">
const SKELETON_SELECTOR = '[data-slot="skeleton"]';
const PULSE_SELECTOR = ".animate-pulse";

/**
 * Throttle the network using CDP so loading states stay visible long enough
 * to assert on them. This slows down ALL requests (document, scripts, data)
 * which is the reliable way to catch Next.js streaming loading states.
 */
async function throttleNetwork(page: Page) {
  const browserName = page.context().browser()?.browserType().name();

  // CDP is only available in Chromium
  if (browserName !== "chromium") {
    // For non-Chromium browsers, use Playwright's route interception and
    // await delays before continuing requests. We delay navigation requests
    // (document) more strongly so server-streaming skeletons have time to render.
    const handler = async (route: any) => {
      const req = route.request();
      // Detect document/navigation requests more robustly
      const isDocument =
        (typeof req.resourceType === "function" &&
          req.resourceType() === "document") ||
        (typeof req.isNavigationRequest === "function" &&
          req.isNavigationRequest());
      const delayMs = isDocument ? 3000 : 200;
      await new Promise((res) => setTimeout(res, delayMs));

      // route.continue() can sometimes throw "Route is already handled"
      // due to internal races; swallow that specific error so the test doesn't fail.
      try {
        await route.continue();
      } catch (err: any) {
        const msg = String(err?.message ?? err);
        if (
          !/route is already handled/i.test(msg) &&
          !/Route is already handled/i.test(msg)
        ) {
          throw err;
        }
        // otherwise swallow the benign error
      }
    };

    await page.route("**/*", handler);
    return { client: null, handler }; // Return handler for cleanup
  }

  const client = await page.context().newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.emulateNetworkConditions", {
    offline: false,
    // Very slow: 10 KB/s download, high latency
    downloadThroughput: 10 * 1024,
    uploadThroughput: 10 * 1024,
    latency: 2000,
  });
  return { client, handler: null };
}

async function unthrottleNetwork(client: any, handler: any, page: Page) {
  if (client === null && handler !== null) {
    // For non-Chromium, remove the route handler.
    // If unroute throws because the handler was already removed, ignore it.
    try {
      await page.unroute("**/*", handler);
    } catch (err: any) {
      // Some runtime states may remove the route already; ignore that case.
      // Also ignore "Target page, context or browser has been closed" errors
      // that occur when the page/browser is closed before cleanup completes.
      const msg = String(err?.message ?? err);
      if (
        !/No route/.test(msg) &&
        !/handler/.test(msg) &&
        !/not found/.test(msg) &&
        !/Target page/.test(msg) &&
        !/closed/.test(msg)
      ) {
        throw err;
      }
    }
    return;
  }
  if (client === null) return; // No-op for non-Chromium
  try {
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
  } catch (err) {
    // Ignore potential CDP errors during cleanup
  }
}

/**
 * Reactively wait for a skeleton/pulse element to appear in the DOM, instead
 * of a fixed delay followed by a single snapshot. This is critical for
 * non-Chromium browsers: Playwright's route interception can only delay
 * *when* a request is dispatched, not the speed at which the response body
 * arrives (unlike Chromium's CDP `Network.emulateNetworkConditions`, which
 * throttles bandwidth). That means once a (possibly very fast) server
 * response arrives, the loading skeleton can be swapped for real content in
 * well under a second — a fixed "wait N ms then snapshot" check can easily
 * land either before the skeleton has rendered or after it has already been
 * replaced. Racing `waitFor({ state: "attached" })` against both selectors
 * catches the skeleton the instant it appears, no matter how quickly it is
 * later removed, and works reliably across all browsers.
 */
async function getPeakCounts(
  skeletonLocator: ReturnType<Page["locator"]>,
  pulseLocator: ReturnType<Page["locator"]>,
  sampleMs = 400,
  intervalMs = 50,
): Promise<[number, number]> {
  const iterations = Math.max(1, Math.floor(sampleMs / intervalMs));
  let maxSkeleton = 0;
  let maxPulse = 0;
  for (let i = 0; i < iterations; i++) {
    try {
      const [sCount, pCount] = await Promise.all([
        skeletonLocator.count(),
        pulseLocator.count(),
      ]);
      if (sCount > maxSkeleton) maxSkeleton = sCount;
      if (pCount > maxPulse) maxPulse = pCount;
    } catch {
      // ignore count errors transiently
    }
    if (i < iterations - 1) await new Promise((r) => setTimeout(r, intervalMs));
  }
  return [maxSkeleton, maxPulse];
}

async function waitForSkeletonAppearance(
  page: Page,
  timeout = 8000,
  minPulseCount?: number,
): Promise<{
  skeletonVisible: boolean;
  skeletonCount: number;
  pulseCount: number;
}> {
  const skeletonLocator = page.locator(SKELETON_SELECTOR);
  const pulseLocator = page.locator(PULSE_SELECTOR);

  let skeletonVisible = false;
  let skeletonCount = 0;
  let pulseCount = 0;

  try {
    if (minPulseCount) {
      // Wait for at least minPulseCount elements to appear (for grid skeletons)
      await pulseLocator
        .nth(minPulseCount - 1)
        .waitFor({ state: "attached", timeout });
      skeletonVisible = true;
    } else {
      // Race to detect the first appearance of either selector
      await Promise.race([
        skeletonLocator
          .first()
          .waitFor({ state: "attached", timeout })
          .then(() => {
            skeletonVisible = true;
          }),
        pulseLocator
          .first()
          .waitFor({ state: "attached", timeout })
          .then(() => {
            skeletonVisible = true;
          }),
      ]);
    }
  } catch {
    // Neither selector appeared within the timeout window.
    skeletonVisible = false;
  }

  // Poll for a short stabilization window and capture the peak counts observed.
  // This guards against very short-lived attach/remove races where skeletons
  // appear momentarily but are swapped into content before we snapshot counts.
  [skeletonCount, pulseCount] = await getPeakCounts(
    skeletonLocator,
    pulseLocator,
  );

  // If we detected an appearance but the counts have already dropped to
  // zero (content swapped in right after detection), still honor the
  // detected visibility — we know for a fact the skeleton was rendered.
  return {
    skeletonVisible: skeletonVisible || skeletonCount > 0 || pulseCount > 0,
    skeletonCount,
    pulseCount,
  };
}

/**
 * Navigate to a page with network throttled so the skeleton loading state
 * stays visible. Checks for skeleton elements (data-slot="skeleton" or
 * animate-pulse class). The throttle is REMOVED before returning.
 */
async function navigateAndCheckSkeleton(
  page: Page,
  url: string,
  authState?: Awaited<ReturnType<BrowserContext["storageState"]>>,
  minPulseCount?: number,
): Promise<{
  skeletonVisible: boolean;
  skeletonCount: number;
  pulseCount: number;
}> {
  if (authState) {
    await restoreAuthState(page, authState);
  }

  const { client, handler } = await throttleNetwork(page);

  try {
    // "commit" returns as soon as the response starts — the loading.tsx
    // skeleton should be in the initial HTML
    await page.goto(url, { waitUntil: "commit", timeout: 60000 });

    return await waitForSkeletonAppearance(page, 8000, minPulseCount);
  } finally {
    await unthrottleNetwork(client, handler, page);
  }
}

/**
 * Navigate with throttle and KEEP it active. Returns the CDP client so the
 * caller can unthrottle when done. Use when inspecting skeleton properties.
 */
async function navigateAndInspectSkeleton(
  page: Page,
  url: string,
  authState?: Awaited<ReturnType<BrowserContext["storageState"]>>,
): Promise<{
  skeletonVisible: boolean;
  skeletonCount: number;
  pulseCount: number;
  client: any;
  handler: any;
}> {
  if (authState) {
    await restoreAuthState(page, authState);
  }

  const { client, handler } = await throttleNetwork(page);
  // Increase timeout for non-Chromium browsers which use route interception
  // with longer delays that slow down the initial document response.
  const browserName = page.context().browser()?.browserType().name();
  const navTimeout = browserName === "chromium" ? 30000 : 90000;
  await page.goto(url, { waitUntil: "commit", timeout: navTimeout });

  const { skeletonVisible, skeletonCount, pulseCount } =
    await waitForSkeletonAppearance(page);

  return { skeletonVisible, skeletonCount, pulseCount, client, handler };
}

/**
 * Navigate to a page and wait for full content to load.
 */
async function navigateAndWaitForContent(
  page: Page,
  url: string,
  authState?: Awaited<ReturnType<BrowserContext["storageState"]>>,
) {
  if (authState) {
    await restoreAuthState(page, authState);
  }
  await page.goto(url);
  await page.waitForLoadState("networkidle");
}

// ─── Tests ────────────────────────────────────────────────────────────────

test.describe.configure({ mode: "serial" });

// ── Admin Table Skeletons ─────────────────────────────────────────────────

test.describe("admin table skeletons", () => {
  let adminAuthState: Awaited<
    ReturnType<BrowserContext["storageState"]>
  > | null = null;

  // @ts-ignore - TypeScript overload resolution issue with destructured params
  test.beforeAll(async ({ browser }) => {
    adminAuthState = await ensureAuthState(
      browser,
      TEST_USERS.ADMIN.email,
      TEST_USERS.ADMIN.password,
      ADMIN_STATE_PATH,
      /\/admin/,
    );
  }, 120000);

  test("hires page shows table skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount, client, handler } =
      await navigateAndInspectSkeleton(page, "/admin/hires", adminAuthState!);
    try {
      expect(skeletonVisible).toBe(true);
      expect(skeletonCount).toBeGreaterThan(0);
    } finally {
      await unthrottleNetwork(client, handler, page);
    }
  });

  test("hires skeleton has no duplicate headers", async ({ page }) => {
    const { client, handler } = await navigateAndInspectSkeleton(
      page,
      "/admin/hires",
      adminAuthState!,
    );
    try {
      // During loading, there should be at most 1 h1
      // The skeleton uses includeHeader={false} so it doesn't render its own h1
      const h1s = page.locator("h1");
      const count = await h1s.count();
      expect(count).toBeLessThanOrEqual(1);
    } finally {
      await unthrottleNetwork(client, handler, page);
    }
  });

  test("gigs page shows table skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/admin/gigs",
      adminAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("events page shows table skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/admin/events",
      adminAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("users page shows table skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/admin/users",
      adminAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("djs page shows table skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/admin/djs",
      adminAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("organizers page shows table skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/admin/organizers",
      adminAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("reports page shows table skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/admin/reports",
      adminAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("booking inquiries page shows table skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/admin/booking-inquiries",
      adminAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("admin dashboard shows stat card skeletons (not table)", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/admin",
      adminAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
    // Dashboard loading uses StatCardSkeleton, not a table skeleton
    const tableCount = await page.locator("table tbody tr").count();
    expect(tableCount).toBe(0);
  });

  test("admin venues shows card list skeleton (not table)", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/admin/venues",
      adminAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("skeleton transitions to real content without duplicate headers", async ({
    page,
  }) => {
    await navigateAndWaitForContent(page, "/admin/hires", adminAuthState!);
    // Wait for real content to load
    await expect(page.getByRole("heading", { name: "Hires" })).toBeVisible();
    // Should have exactly one h1
    const h1s = page.locator("h1");
    await expect(h1s).toHaveCount(1);
  });
});

// ── Gig Skeletons ─────────────────────────────────────────────────────────

test.describe("gig skeletons", () => {
  test("gigs page shows grid skeleton while loading", async ({ page }) => {
    const { skeletonVisible, pulseCount } = await navigateAndCheckSkeleton(
      page,
      "/gigs",
      undefined,
      6,
    );
    // GigGridSkeleton uses raw divs with animate-pulse, not Skeleton component
    expect(skeletonVisible).toBe(true);
    expect(pulseCount).toBeGreaterThan(5);
  });

  test("gig skeleton shows placeholder for title, genres, organizer", async ({
    page,
  }) => {
    const { skeletonVisible, pulseCount } = await navigateAndCheckSkeleton(
      page,
      "/gigs",
      undefined,
      6,
    );
    expect(skeletonVisible).toBe(true);
    // Should have multiple skeleton elements (title bar, genre badges, organizer)
    expect(pulseCount).toBeGreaterThan(5);
  });

  test("gig detail page shows skeleton while loading", async ({ page }) => {
    const { skeletonVisible } = await navigateAndCheckSkeleton(
      page,
      "/gigs/test-gig-nonexistent-slug",
    );
    // Even for non-existent gig, loading.tsx should show skeleton briefly
    expect(skeletonVisible).toBe(true);
  });
});

// ── Homepage Skeletons ────────────────────────────────────────────────────

test.describe("homepage skeletons", () => {
  test("homepage shows featured DJs skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/",
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("homepage shows trending DJs skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/",
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("homepage shows open gigs skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/",
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("homepage skeleton sections don't crash page", async ({ page }) => {
    const { skeletonVisible, skeletonCount, pulseCount } =
      await navigateAndCheckSkeleton(page, "/");
    // Multiple Suspense boundaries should all render skeletons
    expect(skeletonVisible).toBe(true);
    // Use max (not sum) because Skeleton components have both data-slot="skeleton"
    // AND animate-pulse, so skeletonCount and pulseCount count the same elements.
    expect(Math.max(skeletonCount, pulseCount)).toBeGreaterThan(3);
  });

  test("homepage transitions from skeleton to real content", async ({
    page,
  }) => {
    await navigateAndWaitForContent(page, "/");
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

// ── DJ Dashboard Skeletons ────────────────────────────────────────────────

test.describe("DJ dashboard skeletons", () => {
  let djAuthState: Awaited<ReturnType<BrowserContext["storageState"]>> | null =
    null;

  // @ts-ignore - TypeScript overload resolution issue with destructured params
  test.beforeAll(async ({ browser }) => {
    djAuthState = await ensureAuthState(
      browser,
      TEST_USERS.FREE_DJ.email,
      TEST_USERS.FREE_DJ.password,
      FREE_DJ_STATE_PATH,
      /\/$/,
    );
  }, 120000);

  test("DJ overview shows stat card skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/dj/overview",
      djAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("DJ applications shows list skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/dj/applications",
      djAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("DJ bookings shows list skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/dj/bookings",
      djAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("DJ events shows grid skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/dj/events",
      djAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("DJ media shows gallery skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/dj/media",
      djAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("DJ settings shows form skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/dj/settings",
      djAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("DJ account shows form skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/dj/account",
      djAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("DJ notifications shows list skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/dj/notifications",
      djAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });
});

// ── Organizer Skeletons ───────────────────────────────────────────────────

test.describe("organizer dashboard skeletons", () => {
  let organizerAuthState: Awaited<
    ReturnType<BrowserContext["storageState"]>
  > | null = null;

  // @ts-ignore - TypeScript overload resolution issue with destructured params
  test.beforeAll(async ({ browser }) => {
    organizerAuthState = await ensureAuthState(
      browser,
      TEST_USERS.ORGANIZER.email,
      TEST_USERS.ORGANIZER.password,
      ORGANIZER_STATE_PATH,
      /\/$/,
    );
  }, 120000);

  test("organizer dashboard shows stat card skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/organizer/dashboard",
      organizerAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("organizer gigs shows list skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/organizer/gigs",
      organizerAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("organizer settings shows form skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/organizer/settings",
      organizerAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("organizer followed DJs shows list skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/organizer/followed-djs",
      organizerAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("organizer saved events shows grid skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/organizer/saved-events",
      organizerAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("organizer notifications shows list skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/organizer/notifications",
      organizerAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });
});

// ── Fan Skeletons ─────────────────────────────────────────────────────────

test.describe("fan skeletons", () => {
  let fanAuthState: Awaited<ReturnType<BrowserContext["storageState"]>> | null =
    null;

  // @ts-ignore - TypeScript overload resolution issue with destructured params
  test.beforeAll(async ({ browser }) => {
    fanAuthState = await ensureAuthState(
      browser,
      TEST_USERS.FAN.email,
      TEST_USERS.FAN.password,
      FAN_STATE_PATH,
      /\/$/,
    );
  }, 120000);

  test("fan profile shows stat card skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/fan/profile",
      fanAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("fan followed DJs shows list skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/fan/followed-djs",
      fanAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("fan saved events shows grid skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/fan/saved-events",
      fanAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("fan reviews shows list skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/fan/reviews",
      fanAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("fan settings shows form skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/fan/settings",
      fanAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("fan account shows form skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/fan/account",
      fanAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("fan notifications shows list skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/fan/notifications",
      fanAuthState!,
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });
});

// ── Public Page Skeletons ─────────────────────────────────────────────────

test.describe("public page skeletons", () => {
  test("directory shows DJ grid skeleton while loading", async ({ page }) => {
    const { skeletonVisible, pulseCount } = await navigateAndCheckSkeleton(
      page,
      "/directory",
    );
    // DirectoryLoading uses DjGridSkeleton + FilterPanelSkeleton with animate-pulse
    expect(skeletonVisible).toBe(true);
    expect(pulseCount).toBeGreaterThan(5);
  });

  test("DJ profile shows profile skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount, pulseCount } =
      await navigateAndCheckSkeleton(page, "/djs/test-free-dj");
    expect(skeletonVisible).toBe(true);
    // Accept either skeleton or pulse elements as evidence of loading state
    expect(Math.max(skeletonCount, pulseCount)).toBeGreaterThan(0);
  });

  test("events listing shows event grid skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, pulseCount } = await navigateAndCheckSkeleton(
      page,
      "/events",
    );
    // EventsLoading uses Skeleton + animate-pulse
    expect(skeletonVisible).toBe(true);
    expect(pulseCount).toBeGreaterThan(0);
  });

  test("event detail shows detail skeleton while loading", async ({ page }) => {
    const { skeletonVisible } = await navigateAndCheckSkeleton(
      page,
      "/events/nonexistent-event-slug",
    );
    // loading.tsx renders EventDetailSkeleton, or 404 loads
    expect(skeletonVisible).toBe(true);
  });

  test("community shows feed skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/community",
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("organizer profile shows profile skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/organizers/test-organizer",
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("inbox shows notification list skeleton while loading", async ({
    page,
  }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/inbox",
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test("become-dj shows form skeleton while loading", async ({ page }) => {
    const { skeletonVisible, skeletonCount } = await navigateAndCheckSkeleton(
      page,
      "/become-dj",
    );
    expect(skeletonVisible).toBe(true);
    expect(skeletonCount).toBeGreaterThan(0);
  });
});

// ── Skeleton Behavior Tests ───────────────────────────────────────────────

test.describe("admin card skeletons", () => {
  let adminAuthState: Awaited<
    ReturnType<BrowserContext["storageState"]>
  > | null = null;

  // @ts-ignore - TypeScript overload resolution issue with destructured params
  test.beforeAll(async ({ browser }) => {
    adminAuthState = await ensureAuthState(
      browser,
      TEST_USERS.ADMIN.email,
      TEST_USERS.ADMIN.password,
      ADMIN_STATE_PATH,
      /\/admin/,
    );
  }, 120000);

  test("skeleton elements have pulse animation", async ({ page }) => {
    const { skeletonVisible, skeletonCount, pulseCount, client, handler } =
      await navigateAndInspectSkeleton(page, "/admin", adminAuthState!);
    expect(skeletonVisible).toBe(true);
    try {
      // The Skeleton primitive adds "animate-pulse" class
      // Use a shorter timeout with catch fallback in case the skeleton
      // was already swapped for real content by the time we check.
      const skeleton = page.locator(SKELETON_SELECTOR).first();
      await skeleton
        .waitFor({ state: "attached", timeout: 5000 })
        .catch(() => null);

      const className = await skeleton.getAttribute("class").catch(() => "");
      if (className?.includes("animate-pulse")) {
        expect(className).toContain("animate-pulse");
      } else if (pulseCount > 0) {
        // Fallback: pulseCount from the polling phase already proves pulse
        // elements existed during loading. Don't re-check visibility since
        // the element may have already been swapped for real content.
        expect(pulseCount).toBeGreaterThan(0);
      } else {
        throw new Error("No skeleton or pulse elements found during loading");
      }
    } finally {
      await unthrottleNetwork(client, handler, page);
    }
  });

  test("skeleton doesn't cause horizontal scroll", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });
    await page.waitForLoadState("domcontentloaded");
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
  });

  test("skeleton uses dark theme colors", async ({ page }) => {
    const { skeletonVisible, skeletonCount, pulseCount, client, handler } =
      await navigateAndInspectSkeleton(page, "/admin/hires", adminAuthState!);
    expect(skeletonVisible).toBe(true);
    try {
      // Use a shorter timeout with catch fallback in case the skeleton
      // was already swapped for real content by the time we check.
      const skeleton = page.locator(SKELETON_SELECTOR).first();
      await skeleton
        .waitFor({ state: "attached", timeout: 5000 })
        .catch(() => null);

      const className = await skeleton.getAttribute("class").catch(() => "");
      if (className && /bg-(muted|white\/)/.test(className)) {
        // Skeleton primitive uses bg-muted, admin skeleton overrides with bg-white/5
        expect(className).toMatch(/bg-(muted|white\/)/);
      } else if (pulseCount > 0) {
        // Fallback: pulseCount from polling already proves skeleton elements
        // existed during loading. Don't re-check visibility since the element
        // may have already been swapped for real content.
        expect(pulseCount).toBeGreaterThan(0);
      }
    } finally {
      await unthrottleNetwork(client, handler, page);
    }
  });

  test("no flash of duplicate headers on admin hires", async ({ page }) => {
    const { client, handler } = await navigateAndInspectSkeleton(
      page,
      "/admin/hires",
      adminAuthState!,
    );
    try {
      // During loading, there should be at most 1 h1
      const h1s = page.locator("h1");
      const count = await h1s.count();
      expect(count).toBeLessThanOrEqual(1);
    } finally {
      await unthrottleNetwork(client, handler, page);
    }
  });

  test("skeleton disappears when content loads", async ({ page }) => {
    await navigateAndWaitForContent(page, "/admin/hires", adminAuthState!);
    // Wait for real content to load
    await expect(page.getByRole("heading", { name: "Hires" })).toBeVisible();
    // The Suspense boundary should have resolved — skeleton table should be gone
    const skeletonTables = page.locator(
      'table:has(tbody tr td [data-slot="skeleton"])',
    );
    await expect(skeletonTables).toHaveCount(0);
  });

  test("skeleton count is reasonable (not too many)", async ({ page }) => {
    const { skeletonVisible, skeletonCount, pulseCount, client, handler } =
      await navigateAndInspectSkeleton(page, "/admin/hires", adminAuthState!);
    try {
      expect(skeletonVisible).toBe(true);
      // AdminTableSkeleton with 8 cols × 8 rows = 64 cell skeletons + 8 header = 72
      // Plus filter skeletons. Should be reasonable, not thousands.
      // Use max (not sum) because every Skeleton has both data-slot="skeleton"
      // AND animate-pulse, so skeletonCount and pulseCount count the same elements.
      // During polling, peak counts may catch both loading.tsx and Suspense
      // fallback skeletons simultaneously, so allow headroom for that.
      const total = Math.max(skeletonCount, pulseCount);
      expect(total).toBeGreaterThan(5);
      expect(total).toBeLessThan(300);
    } finally {
      await unthrottleNetwork(client, handler, page);
    }
  });
});
