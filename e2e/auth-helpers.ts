import { test as base } from "@playwright/test";

type AuthFixtures = {
  authenticatedPage: {
    email: string;
    password: string;
    role: "DJ" | "ORGANIZER" | "FAN";
    plan?: "FREE" | "PREMIUM";
  };
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Default test user credentials
    const testUser = {
      email: "test-dj@example.com",
      password: "TestPassword123!",
      role: "DJ" as const,
      plan: "PREMIUM" as const,
    };

    // Sign in via API (bypassing UI for faster tests)
    await page.goto("/sign-in");
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Wait for navigation after successful sign-in
    await page.waitForURL("/", { timeout: 5000 });

    await use(testUser);

    // Cleanup: sign out after test
    await page.goto("/sign-out");
  },
});

export { expect } from "@playwright/test";
