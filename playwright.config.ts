import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// The Playwright test runner is a separate Node process from the Next.js
// dev/build server; it does not auto-load .env files the way Next does.
// Load them here so test-setup.ts's direct Prisma/pg connection has
// DATABASE_URL available (mirrors .env.local overriding .env, like Next.js).
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  snapshotPathTemplate:
    "{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  timeout: 60000,
  webServer: {
    command: process.env.CI ? "npm run build && npm start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 300000,
    // Disables the app's own auth rate limiter (see src/lib/rate-limit.ts),
    // which otherwise locks out the shared test users after repeated
    // sign-ins across e2e runs. CI already sets this in ci.yml; set it here
    // too so local `npm run e2e` (which spawns its own dev server) matches.
    env: {
      ...process.env,
      E2E_TESTING: "true",
    },
  },
});
