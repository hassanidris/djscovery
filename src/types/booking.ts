export type BookingViewerRole =
  "guest" | "fan" | "organizer" | "admin" | "dj-owner";

export interface BookingViewerContext {
  role: BookingViewerRole;
  isAuthenticated: boolean;
  organizerDisplayName?: string | null;
  organizerContactEmail?: string | null;
  organizerCityId?: number | null;
  organizerCityName?: string | null;
  organizerCountryId?: number | null;
}

export type CountryOption = {
  id: number;
  name: string;
};

export type CityOption = {
  id: number;
  name: string;
};

export interface BookingFormOptions {
  countries: CountryOption[];
  initialCities?: CityOption[];
  initialVenues?: string[];
  defaultCountryId?: number | null;
  defaultCityId?: number | null;
  defaultCurrency?: string;
}
