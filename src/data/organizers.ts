import type { OrganizerDemoData } from "@/types/organizer-demo";
import raw from "./organizers-demo.json";

export const ALL_DEMO_ORGANIZERS: OrganizerDemoData[] =
  raw as OrganizerDemoData[];

export function getDemoOrganizerBySlug(
  slug: string,
): OrganizerDemoData | undefined {
  return ALL_DEMO_ORGANIZERS.find((o) => o.slug === slug);
}
