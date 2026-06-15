export type OrganizerDemoType =
  | "INDIVIDUAL"
  | "COMPANY"
  | "VENUE"
  | "AGENCY"
  | "FESTIVAL";

export type DemoGigType =
  | "CLUB"
  | "FESTIVAL"
  | "WEDDING"
  | "CORPORATE_EVENT"
  | "PRIVATE_PARTY"
  | "BIRTHDAY_PARTY"
  | "LOUNGE"
  | "RESTAURANT"
  | "HOTEL"
  | "BAR"
  | "OTHER";

export interface OrganizerDemoData {
  id: string;
  slug: string;
  displayName: string;
  organizerType: OrganizerDemoType;
  bio: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  website: string;
  city: string;
  country: string;
  socialLinks: Record<string, string>;
}

export interface DemoGig {
  id: string;
  slug: string;
  title: string;
  gigType: DemoGigType;
  city: string;
  country: string;
  budgetType: "FIXED" | "RANGE" | "NEGOTIABLE" | "TBA";
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  requiredGenres: string[];
  eventDate: Date;
  applicationDeadline: Date | null;
  applicationsCount: number;
  organizerSlug: string;
}
