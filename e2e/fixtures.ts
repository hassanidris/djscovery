/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, type Page } from "@playwright/test";
import { TEST_USERS } from "./test-setup";

type TestFixtures = {
  authenticatedOrganizer: Page;
  authenticatedAdmin: Page;
  authenticatedDJ: Page;
};

export const test = base.extend<TestFixtures>({
  authenticatedOrganizer: async ({ page }, use) => {
    const user = TEST_USERS.ORGANIZER;
    await signInUser(page, user.email, user.password);
    await use(page);
    await signOutUser(page);
  },
  authenticatedAdmin: async ({ page }, use) => {
    const user = TEST_USERS.ADMIN;
    await signInUser(page, user.email, user.password);
    await use(page);
    await signOutUser(page);
  },
  authenticatedDJ: async ({ page }, use) => {
    const user = TEST_USERS.FREE_DJ;
    await signInUser(page, user.email, user.password);
    await use(page);
    await signOutUser(page);
  },
});

async function signInUser(page: Page, email: string, password: string) {
  await page.goto("/sign-in");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  // Wait for navigation after successful sign-in
  await page.waitForURL(/\/(dashboard|organizer|dj|admin|select-role)/, {
    timeout: 10000,
  });
}

async function signOutUser(page: Page) {
  // Navigate to sign-in to clear session
  await page.goto("/sign-in");
}

export { expect } from "@playwright/test";
