export type SocialLink = { platform: string; url: string };

export interface ProfileData {
  displayName: string;
  organizerType: string;
  bio: string;
  logoUrl: string;
  coverImageUrl: string;
  website: string;
  contactEmail: string;
  phone: string;
  countryId: number | null;
  cityId: number | null;
  countryName: string;
  cityName: string;
  socialLinks: SocialLink[];
  slug: string;
}

export interface Country {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
}
