import type { EventCategory } from "@/lib/event-categories";

export type CountryOption = { id: number; name: string; code?: string };
export type CityOption = { id: number; name: string };

export type EventFormData = {
  title: string;
  eventType: "PUBLIC" | "PRIVATE";
  category: EventCategory | "";
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  countryId: string;
  cityId: string;
  venue: string;
  description: string;
  ticketUrl: string;
  genres: string[];
  recap: string;
  audioLink: string;
  timezone: string;
};

export type GalleryImage = { id: number; url: string };

export type EventFormErrors = Partial<Record<keyof EventFormData, string>>;

export const FORM_DEFAULTS: EventFormData = {
  title: "",
  eventType: "PUBLIC",
  category: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  countryId: "",
  cityId: "",
  venue: "",
  description: "",
  ticketUrl: "",
  genres: [],
  recap: "",
  audioLink: "",
  timezone: "",
};

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  CLUB_NIGHT: "Club Night",
  FESTIVAL: "Festival",
  WEDDING: "Wedding",
  BIRTHDAY: "Birthday",
  CORPORATE: "Corporate",
  BEACH_PARTY: "Beach Party",
  LOUNGE: "Lounge",
  RESTAURANT_SET: "Restaurant Set",
  PRIVATE_PARTY: "Private Party",
  OPEN_AIR: "Open Air",
  LUXURY_EVENT: "Luxury Event",
  OTHER: "Other",
};
