import {
  Trophy,
  TrendingUp,
  Flame,
  Zap,
  CircleCheck,
  Shield,
  Handshake,
  Newspaper,
  MicVocal,
  Headphones,
  Music,
  BriefcaseBusiness,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Free plan defaults ──────────────────────────────────────────────────────────

export const FREE_DEFAULT_DJ = {
  stageName: "Amara Pulse",
  avatar: "/rated-6.webp",
  coverImage: "/noCover-3.png",
  bio: "Bringing the pulse of Lagos to the world stage. Amara blends Afrobeats and Amapiano into euphoric, floor-filling sets that transcend borders. With residencies across London, Paris, and Dubai, she's one of the fastest-rising names in global club culture.",
  city: "Lagos",
  country: "Nigeria",
  genres: ["Afrobeats", "Amapiano", "House"],
  socialLinks: [
    { platform: "instagram", url: "#" },
    { platform: "soundcloud", url: "#" },
    { platform: "tiktok", url: "#" },
    { platform: "spotify", url: "#" },
  ],
  avgRating: 4.8,
  ratingCount: 42,
  followerCount: 5200,
  eventsCount: 12,
  bookingEmail: "bookings@amarapulse.com",
  bookingPhone: "+44 7700 900123",
  website: "www.amarapulse.com",
  minFee: "£1,500",
  maxFee: "£8,000",
  djTypes: ["Festival", "Club", "Corporate"],
};

export const FREE_DEFAULT_EVENTS = [
  {
    id: 1,
    title: "Berlin Underground — Summer Closing",
    date: "2025-09-20T22:00:00Z",
    venue: "Berghain",
    city: "Berlin",
    country: "Germany",
  },
  {
    id: 2,
    title: "Sunburn Festival — Stage B",
    date: "2025-10-15T18:00:00Z",
    venue: "Candolim Beach",
    city: "Goa",
    country: "India",
  },
  {
    id: 3,
    title: "Warehouse Sessions Vol. 4",
    date: "2025-11-08T23:00:00Z",
    venue: "Fabric London",
    city: "London",
    country: "UK",
  },
];

export const FREE_DEFAULT_VENUES = [
  { name: "Berghain", city: "Berlin", country: "DE", count: 4 },
  { name: "Fabric London", city: "London", country: "UK", count: 6 },
  { name: "DC-10", city: "Ibiza", country: "ES", count: 3 },
  { name: "Club Space", city: "Miami", country: "US", count: 2 },
  { name: "Printworks", city: "London", country: "UK", count: 5 },
];

export const FREE_DEFAULT_REVIEWS = [
  {
    id: 1,
    rating: 5,
    review:
      "Absolutely electric set. The crowd energy was insane from first to last track. One of the best nights I've been to.",
    date: "2025-06-12",
    user: { name: "Alex K.", image: "/rated-1.webp" },
  },
  {
    id: 2,
    rating: 4,
    review:
      "Incredible mixing skills. The transitions were seamless and the track selection was perfect for the vibe.",
    date: "2025-05-28",
    user: { name: "Sarah M.", image: "/rated-2.webp" },
  },
  {
    id: 3,
    rating: 5,
    review:
      "Been following this DJ for years. Always delivers. Worth every penny for a booking.",
    date: "2025-04-10",
    user: { name: "Jay T.", image: "/rated-3.webp" },
  },
];

export const FREE_DEFAULT_MEDIA = [
  { id: 1, url: "/gallery-1.png" },
  { id: 2, url: "/gallery-2.png" },
  { id: 3, url: "/gallery-3.png" },
  { id: 4, url: "/gallery-4.png" },
  { id: 5, url: "/rated-9.webp" },
  { id: 6, url: "/rated-10.webp" },
];

export const FREE_DEFAULT_FEATURED_MIX = {
  id: undefined as number | undefined,
  title: "Afrobeats & Amapiano Fusion Vol.3",
  duration: "1h 24m",
  plays: "38.2k",
  platform: "SoundCloud",
  genres: ["Afrobeats", "Amapiano"],
  audioUrl: "https://soundcloud.com/soundcloud-shine/soundcloud-2025",
  thumbnail: "/gallery-1.png",
};

// ── Premium plan defaults ───────────────────────────────────────────────────────

export const PREMIUM_DEFAULT_DJ = {
  stageName: "Amara Pulse",
  avatar: "/rated-6.webp",
  coverImage: "/noCover-2.png",
  bio: "Bringing the pulse of Lagos to the world stage. Amara blends Afrobeats and Amapiano into euphoric, floor-filling sets that transcend borders. With residencies across London, Paris, and Dubai — and festival credits spanning 3 continents — she's one of the fastest-rising names in global club culture. Her sound bridges African heritage with contemporary dance music, creating a signature energy that transcends genre borders.",
  city: "Lagos",
  country: "Nigeria",
  genres: ["Afrobeats", "Amapiano", "House", "Afro-Tech"],
  socialLinks: [
    { platform: "instagram", url: "#" },
    { platform: "soundcloud", url: "#" },
    { platform: "tiktok", url: "#" },
    { platform: "spotify", url: "#" },
    { platform: "youtube", url: "#" },
  ],
  avgRating: 4.9,
  ratingCount: 127,
  followerCount: 18400,
  eventsCount: 64,
  responseRate: 98,
  bookingSuccessRate: 94,
  profileViews: 3240,
  bookingEmail: "bookings@amarapulse.com",
  bookingPhone: "+44 7700 900123",
  website: "www.amarapulse.com",
  minFee: "£2,500",
  maxFee: "£15,000",
  djTypes: ["Festival", "Club", "Corporate", "Private Events"],
  manager: {
    name: "Marcus Osei",
    email: "marcus@elitemanagement.com",
    phone: "+44 7900 112233",
  },
  agent: {
    name: "Sophie Laurent",
    agency: "Rhythm Agency",
    email: "sophie@rhythmagency.com",
  },
};

export const PREMIUM_DEFAULT_EVENTS = [
  {
    id: 1,
    title: "Afro Nation Portugal",
    date: "2025-07-10T18:00:00Z",
    venue: "Portimão Arena",
    city: "Portimão",
    country: "Portugal",
    status: "confirmed",
  },
  {
    id: 2,
    title: "Berlin Underground — Summer Closing",
    date: "2025-09-20T22:00:00Z",
    venue: "Berghain",
    city: "Berlin",
    country: "Germany",
    status: "confirmed",
  },
  {
    id: 3,
    title: "Sunburn Festival — Stage B",
    date: "2025-10-15T18:00:00Z",
    venue: "Candolim Beach",
    city: "Goa",
    country: "India",
    status: "confirmed",
  },
  {
    id: 4,
    title: "Warehouse Sessions Vol. 4",
    date: "2025-11-08T23:00:00Z",
    venue: "Fabric London",
    city: "London",
    country: "UK",
    status: "tentative",
  },
];

export const PREMIUM_DEFAULT_VENUES = [
  { name: "Berghain", city: "Berlin", count: 4 },
  { name: "Fabric London", city: "London", count: 6 },
  { name: "DC-10", city: "Ibiza", count: 3 },
  { name: "Club Space", city: "Miami", count: 2 },
  { name: "Printworks", city: "London", count: 5 },
  { name: "Shelter NYC", city: "New York", count: 3 },
];

export const PREMIUM_DEFAULT_REVIEWS = [
  {
    id: 1,
    rating: 5,
    review:
      "Absolutely electric set. The crowd energy was insane from first to last track. One of the best nights I've been to.",
    date: "2025-06-12",
    user: { name: "Alex K.", image: "/rated-1.webp" },
  },
  {
    id: 2,
    rating: 5,
    review:
      "Incredible mixing skills. The transitions were seamless and the track selection was perfect for the vibe.",
    date: "2025-05-28",
    user: { name: "Sarah M.", image: "/rated-2.webp" },
  },
  {
    id: 3,
    rating: 5,
    review:
      "Been following this DJ for years. Always delivers. Worth every penny for a booking.",
    date: "2025-04-10",
    user: { name: "Jay T.", image: "/rated-3.webp" },
  },
];

export type PremiumMediaItem = {
  id: number;
  url: string;
  type: "photo" | "video";
  videoUrl?: string;
  title?: string;
  views?: number;
};

export const PREMIUM_DEFAULT_MEDIA: PremiumMediaItem[] = [
  { id: 1, url: "/gallery-1.png", type: "photo" },
  { id: 2, url: "/gallery-2.png", type: "photo" },
  { id: 3, url: "/gallery-3.png", type: "photo" },
  { id: 4, url: "/gallery-4.png", type: "photo" },
  { id: 5, url: "/rated-9.webp", type: "photo" },
  { id: 6, url: "/rated-10.webp", type: "photo" },
  {
    id: 7,
    url: "/gallery-1.png",
    videoUrl: "",
    title: "Video 1",
    type: "video",
  },
  {
    id: 8,
    url: "/gallery-2.png",
    videoUrl: "",
    title: "Video 2",
    type: "video",
  },
];

export const PREMIUM_DEFAULT_ENDORSEMENTS = [
  {
    name: "Marco Bianchini",
    role: "Head Booker, Fabric London",
    quote:
      "Amara is the real deal. Her energy on stage is unmatched — we've rebooked her 6 times in 3 years.",
    avatar: "/rated-3.webp",
  },
  {
    name: "Priya Nair",
    role: "Events Director, Sunburn Festival",
    quote:
      "Our audience absolutely loved her set. Professional, punctual, and an incredible performer. Highly recommend.",
    avatar: "/rated-2.webp",
  },
  {
    name: "James Okafor",
    role: "Club Owner, Club Space Miami",
    quote:
      "The bookings she generates for our venue speak for themselves. A true headliner.",
    avatar: "/rated-1.webp",
  },
];

export const PREMIUM_DEFAULT_HIGHLIGHTS = [
  { year: "2025", title: "Afro Nation Portugal — Headliner", icon: Trophy },
  { year: "2024", title: "DJ Mag Top 100 — #47", icon: TrendingUp },
  { year: "2024", title: "Sunburn Festival India — Main Stage", icon: Flame },
  { year: "2023", title: "Mixmag Best Breakthrough DJ", icon: Zap },
  {
    year: "2023",
    title: "First African woman to headline Berghain",
    icon: CircleCheck,
  },
];

export const PREMIUM_DEFAULT_PRESS = [
  {
    id: 1,
    outlet: "Mixmag",
    type: "Feature",
    title: "The Sound of Lagos Goes Global",
    date: "Mar 2025",
    url: "",
    icon: Newspaper,
  },
  {
    id: 2,
    outlet: "Resident Advisor",
    type: "Interview",
    title: "Amara Pulse: 'Music is My Language'",
    date: "Jan 2025",
    url: "",
    icon: MicVocal,
  },
  {
    id: 3,
    outlet: "BBC Music",
    type: "Podcast",
    title: "Africa Dancefloor Series Ep.12",
    date: "Nov 2024",
    url: "",
    icon: Headphones,
  },
  {
    id: 4,
    outlet: "Fact Magazine",
    type: "Interview",
    title: "Breaking Borders Through Afrobeats",
    date: "Sep 2024",
    url: "",
    icon: Newspaper,
  },
];

export const PREMIUM_DEFAULT_PACKAGES = [
  {
    name: "Club Night",
    icon: Music,
    price: "From £2,500",
    duration: "3–4 hour set",
    includes: [
      "Setup consultation",
      "Custom setlist",
      "Social media promotion",
      "Press kit",
    ],
    color: "from-h_red/20 to-transparent",
  },
  {
    name: "Festival",
    icon: Flame,
    price: "From £6,000",
    duration: "60–90 min set",
    includes: [
      "Full production rider",
      "Stage management",
      "Exclusive promotion",
      "Post-show content",
    ],
    color: "from-amber-500/20 to-transparent",
    featured: true,
  },
  {
    name: "Private Event",
    icon: BriefcaseBusiness,
    price: "From £3,500",
    duration: "2–3 hour set",
    includes: [
      "Personalized playlist",
      "Equipment included",
      "Event consultation",
      "Professional PA",
    ],
    color: "from-blue-600/20 to-transparent",
  },
];

export const PREMIUM_DEFAULT_CALENDAR_DAYS = Array.from(
  { length: 30 },
  (_, i) => {
    const d = i + 1;
    const status = [5, 12, 20, 28].includes(d)
      ? "booked"
      : [8, 15, 22].includes(d)
        ? "tentative"
        : [3, 10, 17, 24, 27].includes(d)
          ? "available"
          : "free";
    return { day: d, status };
  },
);

export const PREMIUM_DEFAULT_MIXES = [
  {
    id: 1,
    title: "Afrobeats & Amapiano Vol.3",
    duration: "1h 24m",
    plays: "82.4k",
    platform: "SoundCloud",
    audioUrl: "",
  },
  {
    id: 2,
    title: "Late Night Club Mix 2025",
    duration: "2h 10m",
    plays: "41.8k",
    platform: "Mixcloud",
    audioUrl: "",
  },
  {
    id: 3,
    title: "Afro Nation Pre-Party Live",
    duration: "1h 45m",
    plays: "29.2k",
    platform: "SoundCloud",
    audioUrl: "",
  },
];

export const PREMIUM_DEFAULT_SPOTLIGHT = {
  featuredMix: {
    id: undefined as number | undefined,
    title: "Afrobeats & Amapiano Fusion Vol.3",
    duration: "1h 24m",
    plays: 82400,
    genres: ["Afrobeats", "Amapiano"],
    audioUrl: "https://soundcloud.com/soundcloud-shine/soundcloud-2025",
    thumbnail: "/gallery-1.png",
  },
  featuredVideo: {
    id: undefined as number | undefined,
    title: "Summer Closing Set — Full Recording",
    subtitle: "Live @ Berghain 2024",
    duration: "45 min",
    views: 211000,
    thumbnail: "",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
};

// ── Shared icon maps (premium) ──────────────────────────────────────────────────

export const HIGHLIGHT_ICONS: LucideIcon[] = [
  Trophy,
  Flame,
  TrendingUp,
  Zap,
  CircleCheck,
  Shield,
  Handshake,
];

export const PRESS_ICON_MAP: Record<string, LucideIcon> = {
  Feature: Newspaper,
  Interview: MicVocal,
  Podcast: Headphones,
};

export const PACKAGE_ICON_MAP: Record<string, LucideIcon> = {
  "Club Night": Music,
  Festival: Flame,
  "Private Event": BriefcaseBusiness,
};

export const ENDORSER_AVATARS = [
  "/rated-3.webp",
  "/rated-2.webp",
  "/rated-1.webp",
];
