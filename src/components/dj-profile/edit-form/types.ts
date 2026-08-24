export type Country = { id: number; name: string };
export type City = { id: number; name: string };
export type AvailabilityDay = { day: number; status: string };

export interface ProfileData {
  id: number;
  stageName: string;
  bio: string;
  experienceYears: number | null;
  avatar: string;
  coverImage: string;
  countryId: number | null;
  cityId: number | null;
  countryName: string;
  cityName: string;
  genres: string[];
  djTypes: string[];
  socialLinks: { platform: string; url: string }[];
  bookingEmail: string;
  bookingPhone: string;
  feeMin: number | null;
  feeMax: number | null;
  feeCurrency: string;
  slug: string;
  plan: "FREE" | "PREMIUM";
  // Team
  managerName: string;
  managerEmail: string;
  managerPhone: string;
  agentName: string;
  agentAgency: string;
  agentEmail: string;
  // Availability
  availabilityTimezone: string;
  availabilityMonth: string;
  availabilityDays: AvailabilityDay[];
  // Featured performance
  featuredPerformanceUrl: string;
  featuredPerformanceContext: string;
}

export interface EditDjProfileFormProps {
  profile: ProfileData;
  countries: Country[];
  initialCities: City[];
  userId: string;
  allMedia: import("@/lib/actions/dj-media").MediaItem[];
}
