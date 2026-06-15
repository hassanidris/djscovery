import { GigType } from "@prisma/client";

// ============================================================
// EQUIPMENT CONSTANTS
// Single source of truth for the bounded equipment multi-select.
// Imported by both the Zod validation schema (server) and the
// form components (client).
// ============================================================

export const EQUIPMENT_ITEMS = [
  "All Equipment Provided",
  "DJ Controller",
  "CDJs",
  "Turntables",
  "DJ Mixer",
  "Speakers / PA System",
  "Subwoofers",
  "Monitor Speakers",
  "Wireless Microphone",
  "Wired Microphone",
  "Stage",
  "Lighting",
  "DJ Booth / Table",
  "Laptop Stand",
  "Power Extension Cables",
  "Audio Cables",
] as const;

export type EquipmentItem = (typeof EQUIPMENT_ITEMS)[number];

// ============================================================
// GIG FIELD KEYS
// These represent the conditional fields that differ per gig
// type. Fields that are always shown — title, gig type, date,
// application deadline, country/city, and budget — are not
// listed here; they render unconditionally in the form.
// ============================================================

export type GigFieldKey =
  | "genres"
  | "experienceLevel"
  | "setDuration"
  | "guestCount"
  | "dressCode"
  | "mcRequired"
  | "micRequired"
  | "languages"
  | "equipment"
  | "venue";

// ============================================================
// GIG TYPE FIELD CONFIG
// ============================================================

export type GigTypeFieldConfig = {
  label: string;
  description: string;
  /**
   * true  → Private event (wedding, birthday, etc.).
   *         hideVenueName defaults to true; only city/country
   *         is shown to DJs browsing before they apply.
   * false → Business event (club, festival, etc.).
   *         Organizer can choose to show or hide venue name.
   */
  isPrivateEvent: boolean;
  /** Fields rendered in the form for this gig type. */
  visible: GigFieldKey[];
  /** Subset of visible fields that must be filled to publish. */
  required: GigFieldKey[];
};

export const GIG_TYPE_FIELDS: Record<GigType, GigTypeFieldConfig> = {
  CLUB: {
    label: "Club Night",
    description: "DJ set at a nightclub or club venue.",
    isPrivateEvent: false,
    visible: ["genres", "experienceLevel", "setDuration", "equipment"],
    required: [],
  },
  FESTIVAL: {
    label: "Festival",
    description: "Stage performance at a music festival.",
    isPrivateEvent: false,
    visible: ["genres", "experienceLevel", "setDuration", "equipment", "venue"],
    required: ["setDuration"],
  },
  WEDDING: {
    label: "Wedding",
    description: "DJ for a wedding ceremony or reception.",
    isPrivateEvent: true,
    visible: ["guestCount", "languages", "mcRequired", "micRequired", "equipment"],
    required: ["guestCount"],
  },
  CORPORATE_EVENT: {
    label: "Corporate Event",
    description: "DJ for a company event, conference, or party.",
    isPrivateEvent: false,
    visible: ["dressCode", "mcRequired", "micRequired", "guestCount", "equipment"],
    required: [],
  },
  PRIVATE_PARTY: {
    label: "Private Party",
    description: "DJ for a private house or venue party.",
    isPrivateEvent: true,
    visible: ["guestCount", "genres", "equipment"],
    required: [],
  },
  BIRTHDAY_PARTY: {
    label: "Birthday Party",
    description: "DJ for a birthday celebration.",
    isPrivateEvent: true,
    visible: ["guestCount", "genres", "equipment"],
    required: [],
  },
  LOUNGE: {
    label: "Lounge",
    description: "Ambient or background DJ set in a lounge setting.",
    isPrivateEvent: false,
    visible: ["genres", "experienceLevel", "setDuration", "equipment"],
    required: [],
  },
  RESTAURANT: {
    label: "Restaurant",
    description: "DJ for a restaurant event or dining experience.",
    isPrivateEvent: false,
    visible: ["genres", "setDuration", "equipment"],
    required: [],
  },
  HOTEL: {
    label: "Hotel",
    description: "DJ for a hotel event, pool party, or lobby.",
    isPrivateEvent: false,
    visible: ["genres", "guestCount", "dressCode", "equipment"],
    required: [],
  },
  BAR: {
    label: "Bar",
    description: "DJ set at a bar or pub.",
    isPrivateEvent: false,
    visible: ["genres", "experienceLevel", "setDuration", "equipment"],
    required: [],
  },
  OTHER: {
    label: "Other",
    description: "Any other type of event.",
    isPrivateEvent: false,
    visible: [
      "genres",
      "experienceLevel",
      "guestCount",
      "equipment",
      "dressCode",
      "mcRequired",
      "micRequired",
      "languages",
    ],
    required: [],
  },
};

// ============================================================
// HELPER FUNCTIONS
// Used by form components and gig detail renderers.
// ============================================================

/** Returns the full field config for a given gig type. */
export function getFieldConfig(gigType: GigType): GigTypeFieldConfig {
  return GIG_TYPE_FIELDS[gigType];
}

/** True if a field should be rendered for the given gig type. */
export function isFieldVisible(gigType: GigType, field: GigFieldKey): boolean {
  return GIG_TYPE_FIELDS[gigType].visible.includes(field);
}

/** True if a field is required to publish for the given gig type. */
export function isFieldRequired(gigType: GigType, field: GigFieldKey): boolean {
  return GIG_TYPE_FIELDS[gigType].required.includes(field);
}

/**
 * True for private events (wedding, birthday, private party).
 * These default to hideVenueName=true and show only city/country
 * on the gig listing card.
 */
export function isPrivateEventType(gigType: GigType): boolean {
  return GIG_TYPE_FIELDS[gigType].isPrivateEvent;
}

/** All gig types that are considered private events. */
export const PRIVATE_GIG_TYPES: GigType[] = (
  Object.entries(GIG_TYPE_FIELDS) as [GigType, GigTypeFieldConfig][]
)
  .filter(([, config]) => config.isPrivateEvent)
  .map(([type]) => type);

/** Ordered list of all gig types for use in select dropdowns. */
export const GIG_TYPE_OPTIONS = (
  Object.entries(GIG_TYPE_FIELDS) as [GigType, GigTypeFieldConfig][]
).map(([value, config]) => ({
  value,
  label: config.label,
  description: config.description,
}));
