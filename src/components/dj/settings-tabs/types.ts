export type SocialLink = { platform: string; url: string };

export type ProfileData = {
  id: number;
  stageName: string;
  bio: string;
  avatar: string;
  coverImage: string;
  countryId: number | null;
  cityId: number | null;
  countryName: string;
  cityName: string;
  genres: string[];
  djTypes: string[];
  socialLinks: SocialLink[];
  bookingEmail: string;
  bookingPhone: string;
  feeMin: number | null;
  feeMax: number | null;
  feeCurrency: string;
  slug: string;
  plan: "FREE" | "PREMIUM";
  managerName: string;
  managerEmail: string;
  managerPhone: string;
  agentName: string;
  agentAgency: string;
  agentEmail: string;
};

export type Country = { id: number; name: string };
export type City = { id: number; name: string };

export type Highlight = {
  id: number;
  year: string;
  title: string;
  description: string | null;
};
