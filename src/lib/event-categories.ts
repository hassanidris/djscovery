// Shared event category constants — safe to import in both server and client code.

export const VALID_EVENT_CATEGORIES = [
  "CLUB_NIGHT",
  "FESTIVAL",
  "WEDDING",
  "BIRTHDAY",
  "CORPORATE",
  "BEACH_PARTY",
  "LOUNGE",
  "RESTAURANT_SET",
  "PRIVATE_PARTY",
  "OPEN_AIR",
  "LUXURY_EVENT",
  "OTHER",
] as const;

export type EventCategory = (typeof VALID_EVENT_CATEGORIES)[number];
