export type BookingViewerRole =
  | "guest"
  | "fan"
  | "organizer"
  | "admin"
  | "dj-owner";

export interface BookingViewerContext {
  role: BookingViewerRole;
  isAuthenticated: boolean;
  organizerDisplayName?: string | null;
  organizerContactEmail?: string | null;
}
