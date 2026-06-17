export type EventDemoType = "PUBLIC" | "PRIVATE";

export type EventDemoCategory =
  | "CLUB_NIGHT"
  | "FESTIVAL"
  | "WEDDING"
  | "BIRTHDAY"
  | "CORPORATE"
  | "BEACH_PARTY"
  | "LOUNGE"
  | "RESTAURANT_SET"
  | "PRIVATE_PARTY"
  | "OPEN_AIR"
  | "LUXURY_EVENT"
  | "OTHER";

export interface DemoEvent {
  id: string;
  slug: string;
  posterUrl: string | null;
  djSlug: string;
  title: string;
  eventType: EventDemoType;
  daysOffset: number; // positive = upcoming, negative = past
  country: string;
  city: string;
  venue: string | null;
  description: string | null;
  category: EventDemoCategory;
  ticketUrl: string | null;
  startTime: string | null;
  endTime: string | null;
  featured: boolean;
  genres: string[];
}

export interface DemoEventWithDate extends DemoEvent {
  eventDate: Date;
}
