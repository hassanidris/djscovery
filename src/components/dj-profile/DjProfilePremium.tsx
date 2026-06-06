"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapPin,
  faStar,
  faUsers,
  faCalendarDays,
  faUserPlus,
  faShareNodes,
  faPlay,
  faMusic,
  faVideo,
  faImage,
  faCheckCircle,
  faChartLine,
  faCrown,
  faEnvelope,
  faPhone,
  faGlobe,
  faLocationDot,
  faTrophy,
  faFireFlameCurved,
  faHeadphones,
  faArrowTrendUp,
  faUserGroup,
  faBullseye,
  faBuildingColumns,
  faNewspaper,
  faMicrophoneLines,
  faBriefcase,
  faShield,
  faRocket,
  faBolt,
  faCircleCheck,
  faEye,
  faCalendarCheck,
  faHandshake,
} from "@fortawesome/free-solid-svg-icons";
import {
  faInstagram,
  faTiktok,
  faYoutube,
  faSoundcloud,
  faSpotify,
  faApple,
} from "@fortawesome/free-brands-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { format } from "date-fns";
import type { DjDemoData, ViewMode } from "@/types/dj-demo";
import MediaVideoModal from "@/components/dj-profile/MediaVideoModal";
import MediaAudioPlayer from "@/components/dj-profile/MediaAudioPlayer";
import MediaGalleryLightbox from "@/components/dj-profile/MediaGalleryLightbox";

// ── Demo Data ──────────────────────────────────────────────────────────────────

const DEFAULT_DJ = {
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

const DEFAULT_EVENTS = [
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

const DEFAULT_VENUES = [
  { name: "Berghain", city: "Berlin", count: 4 },
  { name: "Fabric London", city: "London", count: 6 },
  { name: "DC-10", city: "Ibiza", count: 3 },
  { name: "Club Space", city: "Miami", count: 2 },
  { name: "Printworks", city: "London", count: 5 },
  { name: "Shelter NYC", city: "New York", count: 3 },
];

const DEFAULT_REVIEWS = [
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

type MediaItem = {
  id: number;
  url: string;
  type: "photo" | "video";
  videoUrl?: string;
  title?: string;
};

const DEFAULT_MEDIA: MediaItem[] = [
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

const DEFAULT_ENDORSEMENTS = [
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

const DEFAULT_HIGHLIGHTS = [
  { year: "2025", title: "Afro Nation Portugal — Headliner", icon: faTrophy },
  { year: "2024", title: "DJ Mag Top 100 — #47", icon: faArrowTrendUp },
  {
    year: "2024",
    title: "Sunburn Festival India — Main Stage",
    icon: faFireFlameCurved,
  },
  { year: "2023", title: "Mixmag Best Breakthrough DJ", icon: faBolt },
  {
    year: "2023",
    title: "First African woman to headline Berghain",
    icon: faCircleCheck,
  },
];

const DEFAULT_PRESS = [
  {
    outlet: "Mixmag",
    type: "Feature",
    title: "The Sound of Lagos Goes Global",
    date: "Mar 2025",
    icon: faNewspaper,
  },
  {
    outlet: "Resident Advisor",
    type: "Interview",
    title: "Amara Pulse: 'Music is My Language'",
    date: "Jan 2025",
    icon: faMicrophoneLines,
  },
  {
    outlet: "BBC Music",
    type: "Podcast",
    title: "Africa Dancefloor Series Ep.12",
    date: "Nov 2024",
    icon: faHeadphones,
  },
  {
    outlet: "Fact Magazine",
    type: "Interview",
    title: "Breaking Borders Through Afrobeats",
    date: "Sep 2024",
    icon: faNewspaper,
  },
];

const DEFAULT_PACKAGES = [
  {
    name: "Club Night",
    icon: faMusic,
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
    icon: faFireFlameCurved,
    price: "From £6,000",
    duration: "60–90 min set",
    includes: [
      "Full production rider",
      "Stage management",
      "Exclusive promotion",
      "Post-show content",
    ],
    color: "from-purple-600/20 to-transparent",
    featured: true,
  },
  {
    name: "Private Event",
    icon: faBriefcase,
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

const SOCIAL_ICONS: Record<string, IconDefinition> = {
  instagram: faInstagram,
  tiktok: faTiktok,
  youtube: faYoutube,
  soundcloud: faSoundcloud,
  spotify: faSpotify,
  website: faGlobe,
  apple: faApple,
};

// Calendar data — Sep 2025
const DEFAULT_CALENDAR_DAYS = Array.from({ length: 30 }, (_, i) => {
  const d = i + 1;
  const status = [5, 12, 20, 28].includes(d)
    ? "booked"
    : [8, 15, 22].includes(d)
      ? "tentative"
      : [3, 10, 17, 24, 27].includes(d)
        ? "available"
        : "free";
  return { day: d, status };
});

const DEFAULT_MIXES = [
  {
    title: "Afrobeats & Amapiano Vol.3",
    duration: "1h 24m",
    plays: "82.4k",
    platform: "SoundCloud",
    audioUrl: "",
  },
  {
    title: "Late Night Club Mix 2025",
    duration: "2h 10m",
    plays: "41.8k",
    platform: "Mixcloud",
    audioUrl: "",
  },
  {
    title: "Afro Nation Pre-Party Live",
    duration: "1h 45m",
    plays: "29.2k",
    platform: "SoundCloud",
    audioUrl: "",
  },
];

// ── JSON → Component mapping helpers ──────────────────────────────────────────

const HIGHLIGHT_ICONS: IconDefinition[] = [
  faTrophy,
  faFireFlameCurved,
  faArrowTrendUp,
  faBolt,
  faCircleCheck,
  faShield,
  faHandshake,
];

const PRESS_ICON_MAP: Record<string, IconDefinition> = {
  Feature: faNewspaper,
  Interview: faMicrophoneLines,
  Podcast: faHeadphones,
};

const PACKAGE_ICON_MAP: Record<string, IconDefinition> = {
  "Club Night": faMusic,
  Festival: faFireFlameCurved,
  "Private Event": faBriefcase,
};

const REVIEWER_AVATARS = ["/rated-1.webp", "/rated-2.webp", "/rated-3.webp"];
const ENDORSER_AVATARS = ["/rated-3.webp", "/rated-2.webp", "/rated-1.webp"];

function getPlatformFromUrl(url: string): string {
  if (url.includes("soundcloud")) return "SoundCloud";
  if (url.includes("mixcloud")) return "Mixcloud";
  if (url.includes("spotify")) return "Spotify";
  if (url.includes("youtube")) return "YouTube";
  return "External";
}

function formatPlays(plays: number): string {
  if (plays >= 1000) return `${(plays / 1000).toFixed(1)}k`;
  return String(plays);
}

function mapDjToProps(d: DjDemoData) {
  const socialLinks = Object.entries(d.socials)
    .filter(([, url]) => Boolean(url))
    .map(([platform, url]) => ({ platform, url: url as string }));
  return {
    stageName: d.stageName,
    avatar: d.avatar.url,
    coverImage: d.coverImage.url,
    bio: d.bio,
    city: d.location.city,
    country: d.location.country,
    genres: d.genres,
    socialLinks,
    avgRating: d.stats.rating,
    ratingCount: d.stats.reviews,
    followerCount: d.stats.followers,
    eventsCount: d.stats.events,
    responseRate: d.stats.responseRate,
    bookingSuccessRate: d.stats.bookingRate,
    profileViews: d.stats.monthlyViews,
    bookingEmail: d.booking.email,
    bookingPhone: d.booking.phone,
    website: d.booking.website,
    minFee: `${d.booking.feeRange.currency}${d.booking.feeRange.min.toLocaleString()}`,
    maxFee: `${d.booking.feeRange.currency}${d.booking.feeRange.max.toLocaleString()}`,
    djTypes: d.specialties,
    manager: {
      name: d.team.manager.name,
      email: d.team.manager.email,
      phone: "",
    },
    agent: {
      name: d.team.bookingAgent.name,
      agency: d.team.bookingAgent.agency,
      email: d.team.bookingAgent.email,
    },
  };
}

function mapEventsFromData(d: DjDemoData) {
  const normalizeEventDate = (value: string) =>
    value.includes("T") ? value : `${value}T20:00:00Z`;
  return d.upcomingEvents.map((e, i) => ({
    id: i + 1,
    title: e.title,
    date: normalizeEventDate(e.date),
    venue: e.venue,
    city: e.city,
    country: "",
    status: "confirmed" as const,
  }));
}

function mapVenuesFromData(d: DjDemoData) {
  return d.venuesPlayed.map((v) => ({
    name: v.venue,
    city: v.city,
    count: v.timesPlayed,
  }));
}

function mapReviewsFromData(d: DjDemoData) {
  return d.reviewsList.map((r, i) => ({
    id: i + 1,
    rating: r.rating,
    review: r.comment,
    date: r.date,
    user: {
      name: r.name,
      image: REVIEWER_AVATARS[i % REVIEWER_AVATARS.length],
    },
  }));
}

function mapMediaFromData(d: DjDemoData): MediaItem[] {
  const photos: MediaItem[] = d.media.photos.map((url, i) => ({
    id: i + 1,
    url,
    type: "photo" as const,
  }));
  const videoThumb = d.spotlight.featuredVideo.thumbnail || "/gallery-1.png";
  const videos: MediaItem[] = d.media.videos.map((v, i) => ({
    id: photos.length + i + 1,
    url: videoThumb,
    videoUrl: v.url,
    title: v.title,
    type: "video" as const,
  }));
  return [...photos, ...videos];
}

function mapEndorsementsFromData(d: DjDemoData) {
  return d.endorsements.map((e, i) => ({
    name: e.name,
    role: `${e.role}, ${e.company}`,
    quote: e.quote,
    avatar: ENDORSER_AVATARS[i % ENDORSER_AVATARS.length],
  }));
}

function mapHighlightsFromData(d: DjDemoData) {
  return d.careerHighlights.map((h, i) => ({
    year: String(h.year),
    title: h.title,
    icon: HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length],
  }));
}

function mapPressFromData(d: DjDemoData) {
  return d.press.map((p) => ({
    outlet: p.source,
    type: p.type,
    title: p.title,
    date: p.date,
    icon: PRESS_ICON_MAP[p.type] ?? faNewspaper,
  }));
}

function mapPackagesFromData(d: DjDemoData) {
  const PKG_COLORS: Record<string, string> = {
    "Club Night": "from-h_red/20 to-transparent",
    Festival: "from-purple-600/20 to-transparent",
    "Private Event": "from-blue-600/20 to-transparent",
  };
  return d.packages.map((pkg, i) => ({
    name: pkg.name,
    icon:
      PACKAGE_ICON_MAP[pkg.name] ?? HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length],
    price: `From ${d.booking.feeRange.currency}${pkg.priceFrom.toLocaleString()}`,
    duration: pkg.features[0] ?? "",
    includes: pkg.features.slice(1),
    color: PKG_COLORS[pkg.name] ?? "from-h_red/20 to-transparent",
    featured: pkg.popular ?? false,
  }));
}

function mapMixesFromData(d: DjDemoData) {
  const fm = d.spotlight.featuredMix;
  const featured = {
    title: fm.title,
    duration: fm.duration,
    plays: formatPlays(fm.plays),
    platform: getPlatformFromUrl(fm.audioUrl),
    audioUrl: fm.audioUrl,
  };
  const rest = d.media.mixes.map((m) => ({
    title: m.title,
    duration: "",
    plays: "",
    platform: getPlatformFromUrl(m.url),
    audioUrl: m.url,
  }));
  return [featured, ...rest];
}

function buildCalendarFromData(d: DjDemoData) {
  const [y, mo] = d.availability.month.split("-").map(Number);
  const daysInMonth = new Date(y, mo, 0).getDate();
  const { availableDays, bookedDays, tentativeDays } = d.availability;
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const status = bookedDays.includes(day)
      ? "booked"
      : tentativeDays.includes(day)
        ? "tentative"
        : availableDays.includes(day)
          ? "available"
          : "free";
    return { day, status };
  });
}

function getCalendarMonthLabel(d: DjDemoData): string {
  const [y, mo] = d.availability.month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(y, mo - 1, 1));
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function Stars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "lg";
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={cn(
            size === "lg" ? "h-4 w-4" : "h-3 w-3",
            i <= Math.round(rating) ? "text-amber-400" : "text-gray-700",
          )}
        />
      ))}
    </div>
  );
}

function SectionHeading({
  children,
  sub,
}: {
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="font-heading text-xl text-white">{children}</h2>
      {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

function StatPill({
  value,
  label,
  trend,
}: {
  value: string;
  label: string;
  trend?: string;
}) {
  return (
    <div className="flex flex-col items-center p-4 rounded-xl bg-white/3 border border-white/8">
      <span className="text-2xl font-bold text-white">{value}</span>
      {trend && (
        <span className="text-emerald-400 text-[10px] font-semibold">
          {trend}
        </span>
      )}
      <span className="text-gray-500 text-xs mt-1 text-center">{label}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DjProfilePremium({
  djData,
  viewMode = "fan",
}: {
  djData?: DjDemoData;
  viewMode?: ViewMode;
} = {}) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const [mediaTab, setMediaTab] = useState<"photos" | "videos" | "mixes">(
    "photos",
  );

  // ── Resolve data: JSON prop overrides hardcoded defaults ──────────────────
  const DJ = djData ? mapDjToProps(djData) : DEFAULT_DJ;
  const EVENTS = djData ? mapEventsFromData(djData) : DEFAULT_EVENTS;
  const VENUES = djData ? mapVenuesFromData(djData) : DEFAULT_VENUES;
  const REVIEWS = djData ? mapReviewsFromData(djData) : DEFAULT_REVIEWS;
  const MEDIA = djData ? mapMediaFromData(djData) : DEFAULT_MEDIA;
  const ENDORSEMENTS = djData
    ? mapEndorsementsFromData(djData)
    : DEFAULT_ENDORSEMENTS;
  const HIGHLIGHTS = djData
    ? mapHighlightsFromData(djData)
    : DEFAULT_HIGHLIGHTS;
  const PRESS = djData ? mapPressFromData(djData) : DEFAULT_PRESS;
  const PACKAGES = djData ? mapPackagesFromData(djData) : DEFAULT_PACKAGES;
  const CALENDAR_DAYS = djData
    ? buildCalendarFromData(djData)
    : DEFAULT_CALENDAR_DAYS;
  const MIXES = djData ? mapMixesFromData(djData) : DEFAULT_MIXES;
  const calendarLabel = djData
    ? getCalendarMonthLabel(djData)
    : "September 2025";
  const SPOTLIGHT = djData
    ? djData.spotlight
    : {
        featuredMix: {
          title: "Afrobeats & Amapiano Fusion Vol.3",
          duration: "1h 24m",
          plays: 82400,
          genres: ["Afrobeats", "Amapiano"],
          audioUrl: "#",
          coverImage: "/gallery-1.png",
        },
        featuredVideo: {
          title: "Summer Closing Set — Full Recording",
          subtitle: "Live @ Berghain 2024",
          duration: "45 min",
          views: 211000,
          thumbnail: "/gallery-1.png",
          videoUrl: "#",
        },
      };

  const location = `${DJ.city}, ${DJ.country}`;

  return (
    <div className="min-h-screen bg-black">
      {/* ── PREMIUM HERO ── */}
      <section className="w-full">
        <div className="relative w-full h-72 md:h-105 overflow-hidden">
          <Image
            src={DJ.coverImage}
            alt="cover"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-black/10" />
          <div className="absolute inset-0 bg-linear-to-r from-h_red/10 to-transparent" />
          {/* Premium ambient glow */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-20 sm:-mt-16 pb-5">
            {/* Avatar with premium ring */}
            <div className="relative shrink-0 z-10">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden ring-4 ring-amber-400 ring-offset-2 ring-offset-black">
                <Image
                  src={DJ.avatar}
                  alt={DJ.stageName}
                  width={144}
                  height={144}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 size-8 rounded-full bg-amber-400 border-2 border-black flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faCrown}
                  className="h-3.5 w-3.5 text-black"
                />
              </div>
            </div>

            <div className="flex-1 min-w-0 pt-1 sm:pb-2">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="font-heading text-3xl md:text-4xl text-white leading-none z-10">
                  Dj {DJ.stageName}
                </h1>
                <div className="flex items-center gap-1.5">
                  <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/25 text-xs h-5.5">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="h-2.5 w-2.5 mr-1"
                    />
                    Verified
                  </Badge>
                  <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 text-xs h-5.5">
                    <FontAwesomeIcon
                      icon={faCrown}
                      className="h-2.5 w-2.5 mr-1"
                    />
                    Premium
                  </Badge>
                </div>
              </div>
              <p className="text-gray-400 text-sm flex items-center gap-1.5">
                <FontAwesomeIcon
                  icon={faMapPin}
                  className="h-3 w-3 text-h_red"
                />{" "}
                {location}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:pb-2 flex-wrap">
              <Button className="bg-h_red hover:bg-h_redDark text-white font-semibold px-5">
                <FontAwesomeIcon
                  icon={faCalendarCheck}
                  className="h-3.5 w-3.5 mr-1.5"
                />
                Book DJ
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-gray-300 hover:bg-white/5"
              >
                <FontAwesomeIcon
                  icon={faUserPlus}
                  className="h-3.5 w-3.5 mr-1.5"
                />
                Follow
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <FontAwesomeIcon icon={faShareNodes} className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {DJ.genres.map((g) => (
              <Badge
                key={g}
                className="bg-h_redDark/50 text-red-100 border-0 h-6"
              >
                {g}
              </Badge>
            ))}
          </div>

          {/* Social */}
          <div className="flex items-center gap-2 mb-6">
            {DJ.socialLinks.map((l) => {
              const icon = SOCIAL_ICONS[l.platform];
              if (!icon) return null;
              return (
                <a
                  key={l.platform}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-white/8"
                >
                  <FontAwesomeIcon icon={icon} className="h-4 w-4" />
                </a>
              );
            })}
          </div>

          <Separator className="bg-white/10" />

          {/* Premium stats bar — 6 metrics */}
          <div className="grid grid-cols-3 md:grid-cols-6 py-5 divide-x divide-white/10">
            {[
              {
                val: DJ.followerCount.toLocaleString(),
                label: "Followers",
                icon: faUsers,
              },
              {
                val: DJ.avgRating.toFixed(1),
                label: `${DJ.ratingCount} reviews`,
                icon: faStar,
                amber: true,
              },
              {
                val: DJ.eventsCount.toString(),
                label: "Events",
                icon: faCalendarDays,
              },
              {
                val: `${DJ.responseRate}%`,
                label: "Response Rate",
                icon: faBolt,
                green: true,
              },
              {
                val: `${DJ.bookingSuccessRate}%`,
                label: "Booking Rate",
                icon: faHandshake,
                green: true,
              },
              {
                val: DJ.profileViews.toLocaleString(),
                label: "Monthly Views",
                icon: faEye,
              },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center py-1">
                <span className="text-xl md:text-2xl font-bold text-white">
                  {s.val}
                </span>
                <span
                  className={cn(
                    "text-xs flex items-center gap-1 mt-1",
                    s.amber
                      ? "text-amber-400"
                      : s.green
                        ? "text-emerald-400"
                        : "text-gray-500",
                  )}
                >
                  <FontAwesomeIcon icon={s.icon} className="h-2.5 w-2.5" />
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <Separator className="bg-white/10" />
        </div>
      </section>

      {/* ── PAGE BODY ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── MAIN COLUMN ── */}
          <div className="lg:col-span-2 flex flex-col gap-12">
            {/* ── SPOTLIGHT ── */}
            <section>
              <SectionHeading sub="Curated featured content">
                Spotlight
              </SectionHeading>
              <div className="grid sm:grid-cols-2 gap-4">
                <MediaAudioPlayer
                  audioUrl={SPOTLIGHT.featuredMix.audioUrl}
                  title={SPOTLIGHT.featuredMix.title}
                >
                  <Card className="bg-h_blackLight/30 border-white/8 overflow-hidden group cursor-pointer hover:border-amber-500/30 transition-all gap-0">
                    <div className="relative h-44 bg-linear-to-br from-h_red/20 via-purple-900/20 to-black">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-14 rounded-full bg-h_red/20 border border-h_red/30 flex items-center justify-center group-hover:bg-h_red/30 transition-colors">
                          <FontAwesomeIcon
                            icon={faPlay}
                            className="h-5 w-5 text-white ml-0.5"
                          />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-black/60 text-gray-300 border-white/10 text-[10px]">
                          <FontAwesomeIcon
                            icon={faHeadphones}
                            className="h-2.5 w-2.5 mr-1"
                          />
                          Featured Mix
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-white text-sm font-semibold">
                        {SPOTLIGHT.featuredMix.title}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {SPOTLIGHT.featuredMix.duration} ·{" "}
                        {formatPlays(SPOTLIGHT.featuredMix.plays)} plays
                      </p>
                    </div>
                  </Card>
                </MediaAudioPlayer>
                <MediaVideoModal
                  videoUrl={SPOTLIGHT.featuredVideo.videoUrl}
                  thumbnail={SPOTLIGHT.featuredVideo.thumbnail}
                  title={SPOTLIGHT.featuredVideo.title}
                >
                  <Card className="bg-h_blackLight/30 border-white/8 overflow-hidden group cursor-pointer hover:border-amber-500/30 transition-all gap-0">
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={SPOTLIGHT.featuredVideo.thumbnail}
                        alt="video"
                        fill
                        className="object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-14 rounded-full bg-black/50 border border-white/20 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                          <FontAwesomeIcon
                            icon={faPlay}
                            className="h-5 w-5 text-white ml-0.5"
                          />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-black/60 text-gray-300 border-white/10 text-[10px]">
                          <FontAwesomeIcon
                            icon={faVideo}
                            className="h-2.5 w-2.5 mr-1"
                          />
                          {SPOTLIGHT.featuredVideo.subtitle}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-white text-sm font-semibold">
                        {SPOTLIGHT.featuredVideo.title}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {SPOTLIGHT.featuredVideo.duration} ·{" "}
                        {formatPlays(SPOTLIGHT.featuredVideo.views)} views
                      </p>
                    </div>
                  </Card>
                </MediaVideoModal>
              </div>
            </section>

            <Separator className="bg-white/8" />

            {/* ── PERFORMANCE INSIGHTS (owner-only in fan view) ── */}
            {viewMode !== "fan" && (
              <section>
                <SectionHeading sub="Last 30 days · Premium analytics">
                  Performance Insights
                </SectionHeading>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <StatPill value="3,240" label="Profile Views" trend="+24%" />
                  <StatPill value="47" label="Booking Requests" trend="+18%" />
                  <StatPill value="+312" label="New Followers" trend="+9%" />
                  <StatPill value="94%" label="Booking Rate" />
                </div>
                <Card className="bg-h_blackLight/30 border-white/8 p-5 gap-0">
                  <h3 className="text-white text-sm font-semibold mb-4">
                    Top Cities (Audience)
                  </h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { city: "London", pct: 28 },
                      { city: "Lagos", pct: 22 },
                      { city: "Berlin", pct: 17 },
                      { city: "New York", pct: 13 },
                      { city: "Ibiza", pct: 10 },
                    ].map((c) => (
                      <div key={c.city} className="flex items-center gap-3">
                        <span className="text-gray-400 text-xs w-20 shrink-0">
                          {c.city}
                        </span>
                        <Progress
                          value={c.pct}
                          className="flex-1 h-1.5 bg-white/8"
                        />
                        <span className="text-gray-500 text-xs w-8 text-right">
                          {c.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <Card className="bg-h_blackLight/30 border-white/8 p-4 gap-0">
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                      Audience Age
                    </h3>
                    {[
                      ["18–24", 35],
                      ["25–34", 44],
                      ["35–44", 16],
                      ["45+", 5],
                    ].map(([g, v]) => (
                      <div key={g} className="flex items-center gap-2 mb-1.5">
                        <span className="text-gray-400 text-xs w-12 shrink-0">
                          {g}
                        </span>
                        <Progress
                          value={Number(v)}
                          className="flex-1 h-1 bg-white/8"
                        />
                        <span className="text-gray-500 text-xs w-7 text-right">
                          {v}%
                        </span>
                      </div>
                    ))}
                  </Card>
                  <Card className="bg-h_blackLight/30 border-white/8 p-4 gap-0">
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                      Profile Traffic
                    </h3>
                    {[
                      ["Direct", 42],
                      ["Search", 31],
                      ["Social", 18],
                      ["Referral", 9],
                    ].map(([src, v]) => (
                      <div key={src} className="flex items-center gap-2 mb-1.5">
                        <span className="text-gray-400 text-xs w-14 shrink-0">
                          {src}
                        </span>
                        <Progress
                          value={Number(v)}
                          className="flex-1 h-1 bg-white/8"
                        />
                        <span className="text-gray-500 text-xs w-7 text-right">
                          {v}%
                        </span>
                      </div>
                    ))}
                  </Card>
                </div>
              </section>
            )}

            <Separator className="bg-white/8" />

            {/* ── AVAILABILITY CALENDAR ── */}
            <section>
              <SectionHeading sub={`${calendarLabel} availability`}>
                Availability Calendar
              </SectionHeading>
              <div className="flex items-center gap-4 mb-4">
                {[
                  { color: "bg-emerald-500", label: "Available" },
                  { color: "bg-h_red", label: "Booked" },
                  { color: "bg-amber-500", label: "Tentative" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={cn("size-2.5 rounded-full", l.color)} />
                    <span className="text-gray-400 text-xs">{l.label}</span>
                  </div>
                ))}
              </div>
              <Card className="bg-h_blackLight/30 border-white/8 p-5 gap-0">
                <div className="grid grid-cols-7 gap-1.5">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <div
                        key={d}
                        className="text-center text-gray-600 text-[10px] font-semibold pb-1"
                      >
                        {d}
                      </div>
                    ),
                  )}
                  {/* Empty cells for day alignment */}
                  {Array.from({ length: 0 }).map((_, i) => (
                    <div key={`e${i}`} />
                  ))}
                  {CALENDAR_DAYS.map(({ day, status }) => (
                    <div
                      key={day}
                      className={cn(
                        "h-9 rounded-md flex items-center justify-center text-xs font-medium cursor-pointer transition-all",
                        status === "booked" &&
                          "bg-h_red/20 text-h_red border border-h_red/30",
                        status === "tentative" &&
                          "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                        status === "available" &&
                          "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25",
                        status === "free" && "text-gray-600 hover:bg-white/5",
                      )}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            <Separator className="bg-white/8" />

            {/* ── BOOKING PACKAGES ── */}
            <section>
              <SectionHeading sub="Tailored options for every event type">
                Booking Packages
              </SectionHeading>
              <div className="grid sm:grid-cols-3 gap-4">
                {PACKAGES.map((pkg) => (
                  <Card
                    key={pkg.name}
                    className={cn(
                      "relative overflow-hidden border-white/8 p-5 flex flex-col gap-0",
                      pkg.featured
                        ? "border-amber-500/30 bg-linear-to-b from-amber-500/10 to-h_blackLight/30"
                        : "bg-h_blackLight/30",
                    )}
                  >
                    {pkg.featured && (
                      <Badge className="absolute top-3 right-3 bg-amber-500/15 text-amber-400 border-amber-500/25 text-[10px]">
                        Most Popular
                      </Badge>
                    )}
                    <div className="size-10 rounded-lg bg-h_red/10 border border-h_red/20 flex items-center justify-center mb-3">
                      <FontAwesomeIcon
                        icon={pkg.icon}
                        className="h-4 w-4 text-h_red"
                      />
                    </div>
                    <p className="text-white font-semibold text-sm">
                      {pkg.name}
                    </p>
                    <p className="text-h_red text-lg font-bold mt-1">
                      {pkg.price}
                    </p>
                    <p className="text-gray-500 text-xs mb-3">{pkg.duration}</p>
                    <ul className="flex flex-col gap-1.5 flex-1">
                      {pkg.includes.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-1.5 text-gray-400 text-xs"
                        >
                          <FontAwesomeIcon
                            icon={faCircleCheck}
                            className="h-3 w-3 text-emerald-500 shrink-0"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full mt-4 bg-h_red hover:bg-h_redDark text-white font-semibold"
                      size="sm"
                    >
                      Enquire
                    </Button>
                  </Card>
                ))}
              </div>
            </section>

            <Separator className="bg-white/8" />

            {/* ── ABOUT ── */}
            <section>
              <SectionHeading>About Me</SectionHeading>
              <p
                className={cn(
                  "text-gray-300 text-sm leading-relaxed",
                  !bioExpanded && "line-clamp-4",
                )}
              >
                {DJ.bio}
              </p>
              <button
                onClick={() => setBioExpanded(!bioExpanded)}
                className="text-h_red text-xs mt-2 hover:text-red-400 transition-colors"
              >
                {bioExpanded ? "Show less" : "Read more"}
              </button>
              <div className="flex items-center gap-2 flex-wrap mt-4">
                <span className="text-xs text-gray-500 shrink-0">
                  Specializes in:
                </span>
                {DJ.djTypes.map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="border-white/15 text-gray-300 text-xs"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </section>

            <Separator className="bg-white/8" />

            {/* ── EXTENDED MEDIA LIBRARY ── */}
            <section>
              <SectionHeading sub="Full media library · Unlimited with Premium">
                Media Library
              </SectionHeading>
              <div className="flex gap-2 mb-4">
                {(["photos", "videos", "mixes"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMediaTab(tab)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize",
                      mediaTab === tab
                        ? "bg-h_red text-white"
                        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10",
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {mediaTab === "photos" && (
                <MediaGalleryLightbox
                  photos={MEDIA.filter((m) => m.type === "photo")}
                />
              )}
              {mediaTab === "videos" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {MEDIA.filter((m) => m.type === "video").map((m) => (
                    <MediaVideoModal
                      key={m.id}
                      videoUrl={m.videoUrl ?? ""}
                      thumbnail={m.url}
                      title={m.title ?? "Video"}
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden ring-1 ring-white/5 hover:ring-h_red/40 transition-all cursor-pointer group">
                        <Image
                          src={m.url}
                          alt="video"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-60"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="size-12 rounded-full bg-black/50 border border-white/20 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                            <FontAwesomeIcon
                              icon={faPlay}
                              className="h-4 w-4 text-white ml-0.5"
                            />
                          </div>
                        </div>
                      </div>
                    </MediaVideoModal>
                  ))}
                </div>
              )}
              {mediaTab === "mixes" && (
                <div className="flex flex-col gap-3">
                  {MIXES.map((mix) => (
                    <MediaAudioPlayer
                      key={mix.title}
                      audioUrl={mix.audioUrl}
                      title={mix.title}
                    >
                      <Card className="bg-h_blackLight/30 border-white/8 p-4 gap-0 flex flex-row items-center cursor-pointer hover:border-white/15 transition-colors">
                        <div className="size-12 rounded-lg bg-linear-to-br from-h_red/30 to-purple-900/30 border border-white/8 flex items-center justify-center shrink-0 mr-4">
                          <FontAwesomeIcon
                            icon={faMusic}
                            className="h-4 w-4 text-h_red"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold">
                            {mix.title}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {mix.platform} · {mix.duration} · {mix.plays} plays
                          </p>
                        </div>
                        <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                          <FontAwesomeIcon
                            icon={faPlay}
                            className="h-3 w-3 ml-0.5"
                          />
                        </div>
                      </Card>
                    </MediaAudioPlayer>
                  ))}
                </div>
              )}
            </section>

            <Separator className="bg-white/8" />

            {/* ── CAREER HIGHLIGHTS ── */}
            <section>
              <SectionHeading sub="Key milestones and achievements">
                Career Highlights
              </SectionHeading>
              <div className="relative flex flex-col gap-0">
                {HIGHLIGHTS.map((h, i) => (
                  <div key={i} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className="size-9 rounded-full bg-h_red/10 border border-h_red/20 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon
                          icon={h.icon}
                          className="h-3.5 w-3.5 text-h_red"
                        />
                      </div>
                      {i < HIGHLIGHTS.length - 1 && (
                        <div className="w-px flex-1 bg-white/8 mt-2" />
                      )}
                    </div>
                    <div className="pb-1 pt-1.5">
                      <p className="text-white text-sm font-semibold">
                        {h.title}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">{h.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="bg-white/8" />

            {/* ── INDUSTRY ENDORSEMENTS ── */}
            <section>
              <SectionHeading sub="What industry professionals say">
                Industry Endorsements
              </SectionHeading>
              <div className="flex flex-col gap-4">
                {ENDORSEMENTS.map((e) => (
                  <Card
                    key={e.name}
                    className="bg-h_blackLight/30 border-white/8 p-5 gap-0"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="size-11 ring-1 ring-white/10 shrink-0">
                        <AvatarImage src={e.avatar} />
                        <AvatarFallback className="bg-h_blackLight text-white text-xs">
                          {e.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white text-sm font-semibold">
                            {e.name}
                          </span>
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                            <FontAwesomeIcon
                              icon={faBuildingColumns}
                              className="h-2 w-2 mr-1"
                            />
                            Venue
                          </Badge>
                        </div>
                        <p className="text-gray-500 text-xs mb-2">{e.role}</p>
                        <p className="text-gray-300 text-sm leading-relaxed italic">
                          &ldquo;{e.quote}&rdquo;
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            <Separator className="bg-white/8" />

            {/* ── PRESS & MEDIA ── */}
            <section>
              <SectionHeading sub="Interviews, features, and podcasts">
                Press &amp; Media
              </SectionHeading>
              <div className="grid sm:grid-cols-2 gap-3">
                {PRESS.map((p) => (
                  <Card
                    key={p.title}
                    className="bg-h_blackLight/30 border-white/8 p-4 gap-0 hover:border-white/15 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="size-9 rounded-md bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon
                          icon={p.icon}
                          className="h-3.5 w-3.5 text-gray-400 group-hover:text-white transition-colors"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-h_red text-xs font-bold">
                            {p.outlet}
                          </span>
                          <Badge className="bg-white/5 text-gray-500 border-white/8 text-[10px]">
                            {p.type}
                          </Badge>
                        </div>
                        <p className="text-white text-sm font-medium line-clamp-2">
                          {p.title}
                        </p>
                        <p className="text-gray-600 text-xs mt-1">{p.date}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            <Separator className="bg-white/8" />

            {/* ── WHERE I'VE PLAYED ── */}
            <section>
              <SectionHeading>Where I&apos;ve Played</SectionHeading>
              <div className="grid sm:grid-cols-2 gap-2">
                {VENUES.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-h_blackLight/30 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="size-8 rounded-md bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon
                        icon={faLocationDot}
                        className="h-3 w-3 text-h_red"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{v.name}</p>
                      <p className="text-gray-500 text-xs">{v.city}</p>
                    </div>
                    <Badge className="bg-white/5 text-gray-400 border-white/10 text-xs shrink-0">
                      {v.count}x
                    </Badge>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="bg-white/8" />

            {/* ── CROWD FEEDBACK ── */}
            <section>
              <SectionHeading sub={`${DJ.ratingCount} verified reviews`}>
                Crowd Feedback
              </SectionHeading>
              <div className="flex flex-col sm:flex-row gap-6 mb-7 p-5 rounded-xl bg-h_blackLight/30 border border-white/5">
                <div className="flex flex-col items-center justify-center shrink-0 min-w-24 gap-1.5">
                  <span className="text-5xl font-bold text-white leading-none">
                    {DJ.avgRating.toFixed(1)}
                  </span>
                  <Stars rating={DJ.avgRating} size="lg" />
                  <span className="text-xs text-gray-500">
                    {DJ.ratingCount} reviews
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-center gap-2">
                  {[5, 4, 3, 2, 1].map((s) => {
                    const pct =
                      s === 5
                        ? 89
                        : s === 4
                          ? 8
                          : s === 3
                            ? 2
                            : s === 2
                              ? 1
                              : 0;
                    return (
                      <div key={s} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-3 text-right">
                          {s}
                        </span>
                        <FontAwesomeIcon
                          icon={faStar}
                          className="h-3 w-3 text-amber-400 shrink-0"
                        />
                        <Progress
                          value={pct}
                          className="flex-1 h-1.5 bg-white/8"
                        />
                        <span className="text-xs text-gray-600 w-8 text-right">
                          {Math.round((DJ.ratingCount * pct) / 100)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {REVIEWS.map((r) => (
                  <Card
                    key={r.id}
                    className="bg-h_blackLight/30 border-white/5 p-5 gap-0"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="size-9 ring-1 ring-white/10 shrink-0">
                        <AvatarImage src={r.user.image} />
                        <AvatarFallback className="bg-h_blackLight text-white text-xs">
                          {r.user.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-medium">
                              {r.user.name}
                            </span>
                            <Stars rating={r.rating} />
                          </div>
                          <span className="text-xs text-gray-600">
                            {r.date}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                          {r.review}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="sticky top-28 flex flex-col gap-5 h-fit">
            {/* Priority Booking CTA */}
            <Card className="border-amber-500/25 overflow-hidden gap-0 bg-linear-to-b from-amber-500/8 to-h_blackLight/30">
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <FontAwesomeIcon
                    icon={faRocket}
                    className="h-3.5 w-3.5 text-amber-400"
                  />
                  <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">
                    Priority Booking
                  </span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">
                  Book {DJ.stageName}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-xs font-medium">
                    Responding within 2 hours
                  </span>
                </div>
                <Button className="w-full bg-h_red hover:bg-h_redDark text-white font-semibold mb-2">
                  <FontAwesomeIcon
                    icon={faCalendarCheck}
                    className="h-3.5 w-3.5 mr-1.5"
                  />
                  Book / Hire DJ
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/15 text-gray-300 hover:bg-white/5"
                >
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="h-3.5 w-3.5 mr-1.5"
                  />
                  Send Inquiry
                </Button>
              </div>
              <div className="px-5 py-3 border-t border-white/5 flex justify-between">
                <div className="text-center">
                  <p className="text-white text-sm font-bold">
                    {DJ.responseRate}%
                  </p>
                  <p className="text-gray-500 text-[10px]">Response Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-white text-sm font-bold">
                    {DJ.bookingSuccessRate}%
                  </p>
                  <p className="text-gray-500 text-[10px]">Booking Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-white text-sm font-bold">&lt;2h</p>
                  <p className="text-gray-500 text-[10px]">Reply Time</p>
                </div>
              </div>
            </Card>

            {/* Upcoming Events */}
            <div>
              <h3 className="text-white text-sm font-semibold mb-3">
                Upcoming Events
              </h3>
              <div className="flex flex-col gap-2">
                {EVENTS.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-h_blackLight/30 border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-md bg-h_red/10 border border-h_red/20 flex flex-col items-center justify-center">
                      <span className="text-h_red text-[9px] font-bold uppercase leading-none">
                        {format(new Date(e.date), "MMM")}
                      </span>
                      <span className="text-white text-sm font-bold leading-none mt-0.5">
                        {format(new Date(e.date), "d")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">
                        {e.title}
                      </p>
                      <p className="text-gray-500 text-[10px] mt-0.5 truncate">
                        {[e.venue, e.city].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    {e.status === "tentative" && (
                      <Badge className="shrink-0 bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                        TBC
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-white/8" />

            {/* Professional Contacts */}
            <div>
              <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faBriefcase}
                  className="h-3 w-3 text-h_red"
                />
                Professional Team
              </h3>
              <div className="flex flex-col gap-2">
                <Card className="bg-h_blackLight/30 border-white/8 p-3 gap-0">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">
                    Manager
                  </p>
                  <p className="text-white text-xs font-semibold">
                    {DJ.manager.name}
                  </p>
                  <a
                    href={`mailto:${DJ.manager.email}`}
                    className="text-gray-400 text-[11px] hover:text-h_red transition-colors truncate block mt-0.5"
                  >
                    {DJ.manager.email}
                  </a>
                </Card>
                <Card className="bg-h_blackLight/30 border-white/8 p-3 gap-0">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">
                    Booking Agent
                  </p>
                  <p className="text-white text-xs font-semibold">
                    {DJ.agent.name}
                  </p>
                  <p className="text-gray-500 text-[10px] mt-0.5">
                    {DJ.agent.agency}
                  </p>
                  <a
                    href={`mailto:${DJ.agent.email}`}
                    className="text-gray-400 text-[11px] hover:text-h_red transition-colors truncate block mt-0.5"
                  >
                    {DJ.agent.email}
                  </a>
                </Card>
              </div>
            </div>

            <Separator className="bg-white/8" />

            {/* Fee Range */}
            <Card className="bg-h_blackLight/30 border-white/8 p-4 gap-0">
              <h3 className="text-white text-sm font-semibold mb-3">
                Fee Range
              </h3>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-2xl font-bold text-white">
                  {DJ.minFee}
                </span>
                <span className="text-gray-500 text-sm mb-0.5">
                  – {DJ.maxFee}
                </span>
              </div>
              <p className="text-gray-500 text-xs">
                Per event · varies by duration & travel
              </p>
            </Card>

            {/* Analytics snapshot (owner-only in fan view) */}
            {viewMode !== "fan" && (
              <Card className="bg-h_blackLight/30 border-white/8 p-4 gap-0">
                <div className="flex items-center gap-2 mb-3">
                  <FontAwesomeIcon
                    icon={faChartLine}
                    className="h-3.5 w-3.5 text-emerald-400"
                  />
                  <h3 className="text-white text-xs font-semibold">
                    This Month
                  </h3>
                </div>
                {[
                  { label: "Profile Views", val: "3,240", trend: "+24%" },
                  { label: "Booking Requests", val: "47", trend: "+18%" },
                  { label: "New Followers", val: "312", trend: "+9%" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center justify-between mb-2"
                  >
                    <span className="text-gray-400 text-xs">{m.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white text-xs font-semibold">
                        {m.val}
                      </span>
                      <span className="text-emerald-400 text-[10px]">
                        {m.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </Card>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
