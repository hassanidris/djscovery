import type { DemoEvent, DemoEventWithDate } from "@/types/event-demo";
import raw from "./djscovery_events_seed.json";

// ── Date helpers ──────────────────────────────────────────────────────────────

function daysFromNow(days: number, hour = 20): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

// ── Dataset ───────────────────────────────────────────────────────────────────

// daysOffset in the JSON:
//   positive → upcoming event (daysFromNow)
//   negative → past event (daysFromNow with negative = days ago)

export function getDemoEvents(): DemoEventWithDate[] {
  return (raw as DemoEvent[]).map((e) => ({
    ...e,
    eventDate: daysFromNow(e.daysOffset),
  }));
}

// ── Lookup helpers ────────────────────────────────────────────────────────────

export function getDemoEventsByDjSlug(djSlug: string): DemoEventWithDate[] {
  return getDemoEvents().filter((e) => e.djSlug === djSlug);
}

export function getDemoEventBySlug(
  slug: string,
): DemoEventWithDate | undefined {
  return getDemoEvents().find((e) => e.slug === slug);
}

export const DEMO_UPCOMING_EVENTS = getDemoEvents().filter(
  (e) => e.daysOffset > 0,
);

export const DEMO_PAST_EVENTS = getDemoEvents().filter(
  (e) => e.daysOffset <= 0,
);

export const DEMO_FEATURED_EVENTS = getDemoEvents().filter((e) => e.featured);
