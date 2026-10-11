import { test, expect } from "@playwright/test";
import {
  createTestFoundingApplication,
  cleanupFoundingApplications,
  getTestLocation,
  disconnectTestPrisma,
  getPrisma,
} from "./test-setup";

test.describe("Founding DJs Program - User Side", () => {
  const testEmail = `test-founding-${Date.now()}@example.com`;
  const testName = "Test DJ";
  const testStageName = "DJ Test";

  test.afterAll(async () => {
    await cleanupFoundingApplications(testEmail);
    await disconnectTestPrisma();
  });

  test("landing page loads and displays key information", async ({ page }) => {
    await page.goto("/founding-djs");

    await expect(page).toHaveTitle(/Founding DJs/);
    await expect(
      page.getByRole("heading", { name: "Why Become a Founding DJ?" }),
    ).toBeVisible();
  });

  test("application form loads and displays required fields", async ({
    page,
  }) => {
    await page.goto("/founding-djs/apply");

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/stage name/i)).toBeVisible();
    await expect(page.getByLabel(/country/i)).toBeVisible();
    await expect(page.getByLabel(/city/i)).toBeVisible();
  });

  test("application form can be filled with valid data", async ({ page }) => {
    await page.goto("/founding-djs/apply");

    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/full name/i).fill(testName);
    await page.getByLabel(/stage name/i).fill(testStageName);

    const { countryId, cityId } = await getTestLocation();

    await page
      .locator("select[name='countryId']")
      .selectOption(String(countryId));
    await page.waitForTimeout(500);
    await page.locator("select[name='cityId']").selectOption(String(cityId));

    await page
      .getByPlaceholder(/soundcloud/i)
      .fill("https://soundcloud.com/test-dj/mix");

    await expect(page.getByLabel(/email/i)).toHaveValue(testEmail);
    await expect(page.getByLabel(/full name/i)).toHaveValue(testName);
    await expect(page.getByLabel(/stage name/i)).toHaveValue(testStageName);
  });

  test("save and resume button is visible", async ({ page }) => {
    await page.goto("/founding-djs/apply");

    await expect(
      page.getByRole("button", { name: /save.*resume/i }),
    ).toBeVisible();
  });

  test("submit button is visible", async ({ page }) => {
    await page.goto("/founding-djs/apply");

    await expect(
      page.getByRole("button", { name: /submit application/i }),
    ).toBeVisible();
  });

  test("status check page loads", async ({ page }) => {
    await page.goto("/founding-djs/status");

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /check status/i }),
    ).toBeVisible();
  });

  test("status check works with test application", async ({ page }) => {
    const { application } = await createTestFoundingApplication({
      email: testEmail,
      name: testName,
      stageName: testStageName,
      countryId: 1,
      cityId: 1,
      portfolioLinks: ["https://soundcloud.com/test"],
      status: "EMAIL_VERIFIED",
    });

    await page.goto("/founding-djs/status");

    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByRole("button", { name: /check status/i }).click();

    await expect(
      page.getByText("Email verified. Your application is under review."),
    ).toBeVisible();
  });

  test("success page displays correctly", async ({ page }) => {
    await page.goto("/founding-djs/success");

    await expect(
      page.getByRole("heading", { name: "Application Submitted!" }),
    ).toBeVisible();
  });

  test("verify email page displays correctly", async ({ page }) => {
    await page.goto("/founding-djs/verify-email");

    await expect(
      page.getByRole("heading", { name: /email verification failed/i }),
    ).toBeVisible();
  });

  test("invitation page with invalid token shows error", async ({ page }) => {
    await page.goto("/founding-djs/invitation/invalid-token-12345");

    await expect(
      page.getByRole("heading", { name: /invitation unavailable/i }),
    ).toBeVisible();
  });
});

test.describe("Founding DJs Program - Admin Side", () => {
  test("admin applications page redirects to sign-in when not authenticated", async ({
    page,
  }) => {
    await page.goto("/admin/founding/applications");

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("admin members page redirects to sign-in when not authenticated", async ({
    page,
  }) => {
    await page.goto("/admin/founding/members");

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("admin founding overview page redirects to sign-in when not authenticated", async ({
    page,
  }) => {
    await page.goto("/admin/founding");

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("admin invitations page redirects to sign-in when not authenticated", async ({
    page,
  }) => {
    await page.goto("/admin/founding/invitations");

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("admin analytics page redirects to sign-in when not authenticated", async ({
    page,
  }) => {
    await page.goto("/admin/founding/analytics");

    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe("Founding DJs Program - Navigation", () => {
  test("can navigate directly to application form", async ({ page }) => {
    await page.goto("/founding-djs/apply");

    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("can navigate directly to status check", async ({ page }) => {
    await page.goto("/founding-djs/status");

    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});
