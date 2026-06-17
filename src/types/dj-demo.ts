export type DjPlan = "premium" | "free";
export type DjType = "fictional_demo" | "famous_demo";

export type ViewMode = "fan" | "organizer" | "dj-owner" | "admin";

export interface DjDemoData {
  id: string;
  slug: string;
  type: DjType;
  plan: DjPlan;
  verified: boolean;
  featured: boolean;
  name: string;
  stageName: string;
  location: {
    city: string;
    country: string;
  };
  avatar: {
    url: string;
    alt: string;
  };
  coverImage: {
    url: string;
    alt: string;
  };
  genres: string[];
  socials: {
    instagram?: string;
    soundcloud?: string;
    spotify?: string;
    youtube?: string;
    tiktok?: string;
    anghami?: string;
    website?: string;
    apple?: string;
  };
  stats: {
    followers: number;
    rating: number;
    reviews: number;
    events: number;
    responseRate: number;
    bookingRate: number;
    monthlyViews: number;
  };
  spotlight: {
    featuredMix: {
      title: string;
      duration: string;
      plays: number;
      genres: string[];
      audioUrl: string;
      coverImage: string;
    };
    featuredVideo: {
      title: string;
      subtitle: string;
      duration: string;
      views: number;
      thumbnail: string;
      videoUrl: string;
    };
  };
  analytics: {
    profileViews: { value: number; growth: number };
    bookingRequests: { value: number; growth: number };
    newFollowers: { value: number; growth: number };
    bookingRate: number;
    topCities: Array<{ city: string; percentage: number }>;
    audienceAge: Array<{ range: string; percentage: number }>;
    trafficSources: Array<{ source: string; percentage: number }>;
  };
  availability: {
    timezone: string;
    month: string;
    availableDays: number[];
    bookedDays: number[];
    tentativeDays: number[];
  };
  packages: Array<{
    name: string;
    priceFrom: number;
    currency: string;
    features: string[];
    popular?: boolean;
  }>;
  bio: string;
  specialties: string[];
  media: {
    photos: string[];
    videos: Array<{ title: string; url: string }>;
    mixes: Array<{ title: string; url: string }>;
  };
  careerHighlights: Array<{ title: string; year: number }>;
  endorsements: Array<{
    name: string;
    role: string;
    company: string;
    quote: string;
  }>;
  press: Array<{
    source: string;
    type: string;
    title: string;
    date: string;
  }>;
  venuesPlayed: Array<{
    venue: string;
    city: string;
    timesPlayed: number;
  }>;
  reviewsList: Array<{
    name: string;
    rating: number;
    date: string;
    comment: string;
  }>;
  team: {
    manager: { name: string; email: string };
    bookingAgent: { name: string; agency: string; email: string };
  };
  booking: {
    email: string;
    phone: string;
    website: string;
    feeRange: { min: number; max: number; currency: string };
  };
  upcomingEvents: Array<{
    title: string;
    venue: string;
    city: string;
    date: string;
    slug?: string;
    isPast?: boolean;
  }>;
}
