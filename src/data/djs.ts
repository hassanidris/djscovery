import type { DjDemoData } from "@/types/dj-demo";
import seed1 from "./djcovery_seed_1.json";
import seed2 from "./djcovery_seed_2.json";

// ── Premium-plan overrides ─────────────────────────────────────────────────────
// Only these 6 slugs render the Premium profile. Every other DJ shows Free tier.
const PREMIUM_PLAN_SLUGS = new Set([
  "amara-pulse",
  "martin-garrix",
  "peggy-gou",
  "carl-cox",
  "black-coffee",
  "charlotte-de-witte",
]);

// ── Combined + typed dataset ───────────────────────────────────────────────────
const raw = [...(seed1 as unknown[]), ...(seed2 as unknown[])] as DjDemoData[];

export const ALL_DEMO_DJS: DjDemoData[] = raw.map((dj) =>
  PREMIUM_PLAN_SLUGS.has(dj.slug)
    ? { ...dj, plan: "premium" as const }
    : { ...dj, plan: "free" as const },
);

// ── Lookup helpers ─────────────────────────────────────────────────────────────

export function getDemodjBySlug(slug: string): DjDemoData | undefined {
  return ALL_DEMO_DJS.find((dj) => dj.slug === slug);
}

export const FEATURED_DEMO_DJS = ALL_DEMO_DJS.filter((dj) => dj.featured);
export const PREMIUM_DEMO_DJS = ALL_DEMO_DJS.filter(
  (dj) => dj.plan === "premium",
);
export const FREE_DEMO_DJS = ALL_DEMO_DJS.filter((dj) => dj.plan === "free");
