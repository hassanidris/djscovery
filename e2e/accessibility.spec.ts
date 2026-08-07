import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Automated accessibility scan (WCAG 2.0/2.1 A + AA rules) via axe-core.
//
// We fail the build on "critical" and "serious" violations only. "moderate"
// and "minor" issues are logged (not failed) so the check is useful from day
// one without blocking on cosmetic issues; tighten this over time as the
// codebase is cleaned up.
const BLOCKING_IMPACTS = ["critical", "serious"] as const;

const PUBLIC_PAGES = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
  { name: "FAQ", path: "/faq" },
  { name: "Community", path: "/community" },
  { name: "Directory", path: "/directory" },
  { name: "Events", path: "/events" },
  { name: "Sign In", path: "/sign-in" },
  { name: "Sign Up", path: "/sign-up" },
  { name: "Forgot Password", path: "/forgot-password" },
  { name: "Privacy Policy", path: "/privacy" },
  { name: "Terms of Service", path: "/terms-of-service" },
  { name: "Cookie Policy", path: "/cookie-policy" },
];

test.describe("accessibility (axe-core)", () => {
  for (const { name, path } of PUBLIC_PAGES) {
    test(`${name} page has no critical/serious a11y violations`, async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const blocking = results.violations.filter((v) =>
        BLOCKING_IMPACTS.includes(v.impact as (typeof BLOCKING_IMPACTS)[number]),
      );
      const nonBlocking = results.violations.filter(
        (v) => !BLOCKING_IMPACTS.includes(v.impact as (typeof BLOCKING_IMPACTS)[number]),
      );

      if (nonBlocking.length > 0) {
        console.warn(
          `[a11y] ${name} (${path}) — ${nonBlocking.length} non-blocking violation(s):\n` +
            nonBlocking
              .map((v) => `  - [${v.impact}] ${v.id}: ${v.description}`)
              .join("\n"),
        );
      }

      if (blocking.length > 0) {
        const details = blocking
          .map(
            (v) =>
              `[${v.impact}] ${v.id}: ${v.description}\n` +
              v.nodes.map((n) => `    ${n.target.join(" ")}`).join("\n"),
          )
          .join("\n");
        throw new Error(
          `${name} (${path}) has ${blocking.length} critical/serious a11y violation(s):\n${details}`,
        );
      }
    });
  }
});
