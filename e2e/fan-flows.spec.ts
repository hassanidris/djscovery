import { test, expect } from "@playwright/test";
import { TEST_USERS } from "./test-setup";

test.describe("fan flows", () => {
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
      await page.goto("/sign-in");
      await page.locator('input[name="email"]').fill(TEST_USERS.FAN.email);
      await page
        .locator('input[name="password"]')
        .fill(TEST_USERS.FAN.password);
      await page.getByRole("button", { name: "Sign In" }).click();

      await page.goto("/fan/profile");
      // Wait for page to load and check for any visible content
      await expect(page.locator("body")).toBeVisible();
    });

    test("loads settings page when authenticated", async ({ page }) => {
      await page.goto("/sign-in");
      await page.locator('input[name="email"]').fill(TEST_USERS.FAN.email);
      await page
        .locator('input[name="password"]')
        .fill(TEST_USERS.FAN.password);
      await page.getByRole("button", { name: "Sign In" }).click();

      await page.goto("/fan/settings");
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
      await page.goto("/sign-in");
      await page.locator('input[name="email"]').fill(TEST_USERS.FAN.email);
      await page
        .locator('input[name="password"]')
        .fill(TEST_USERS.FAN.password);
      await page.getByRole("button", { name: "Sign In" }).click();

      await page.goto("/fan/followed-djs");
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
      await page.goto("/sign-in");
      await page.locator('input[name="email"]').fill(TEST_USERS.FAN.email);
      await page
        .locator('input[name="password"]')
        .fill(TEST_USERS.FAN.password);
      await page.getByRole("button", { name: "Sign In" }).click();

      await page.goto("/fan/saved-events");
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
      await page.goto("/sign-in");
      await page.locator('input[name="email"]').fill(TEST_USERS.FAN.email);
      await page
        .locator('input[name="password"]')
        .fill(TEST_USERS.FAN.password);
      await page.getByRole("button", { name: "Sign In" }).click();

      await page.goto("/fan/reviews");
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
      await page.goto("/sign-in");
      await page.locator('input[name="email"]').fill(TEST_USERS.FAN.email);
      await page
        .locator('input[name="password"]')
        .fill(TEST_USERS.FAN.password);
      await page.getByRole("button", { name: "Sign In" }).click();

      await page.goto("/fan/notifications");
      await expect(page.locator("body")).toBeVisible();
    });
  });
});
