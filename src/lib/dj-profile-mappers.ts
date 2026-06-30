import type { DjDemoData } from "@/types/dj-demo";
import { getDemoEventsByDjSlug } from "@/data/events-demo";
import { formatNumber } from "@/lib/utils/currency";
import { Newspaper } from "lucide-react";
import {
  REVIEWER_AVATARS,
  getPlatformFromUrl,
  formatPlays,
} from "@/components/dj-profile/dj-profile-shared";
import {
  ENDORSER_AVATARS,
  HIGHLIGHT_ICONS,
  PRESS_ICON_MAP,
  PACKAGE_ICON_MAP,
  type PremiumMediaItem,
} from "@/data/dj-profile-defaults";

// ── Shared base mappers ───────────────────────────────────────────────────────

function mapSocialLinks(d: DjDemoData) {
  return Object.entries(d.socials)
    .filter(([, url]) => Boolean(url))
    .map(([platform, url]) => ({ platform, url: url as string }));
}

export function mapDjToProps(d: DjDemoData) {
  return {
    stageName: d.stageName,
    avatar: d.avatar.url,
    coverImage: d.coverImage.url,
    bio: d.bio,
    city: d.location.city,
    country: d.location.country,
    genres: d.genres,
    socialLinks: mapSocialLinks(d),
    avgRating: d.stats.rating,
    ratingCount: d.stats.reviews,
    followerCount: d.stats.followers,
    eventsCount: d.stats.events,
    bookingEmail: d.booking.email,
    bookingPhone: d.booking.phone,
    website: d.booking.website,
    minFee: `${d.booking.feeRange.currency}${formatNumber(d.booking.feeRange.min)}`,
    maxFee: `${d.booking.feeRange.currency}${formatNumber(d.booking.feeRange.max)}`,
    djTypes: d.specialties,
  };
}

export function mapEventsFromData(
  d: DjDemoData,
  opts?: { withStatus?: boolean },
) {
  return getDemoEventsByDjSlug(d.slug).map((e, i) => ({
    id: i + 1,
    title: e.title,
    date: e.eventDate.toISOString(),
    venue: e.venue ?? "",
    city: e.city,
    country: e.country,
    slug: e.slug,
    isPast: e.daysOffset <= 0,
    ...(opts?.withStatus ? { status: "confirmed" as const } : {}),
  }));
}

export function mapVenuesFromData(
  d: DjDemoData,
  opts?: { withCountry?: boolean },
) {
  return d.venuesPlayed.map((v) => ({
    name: v.venue,
    city: v.city,
    country: opts?.withCountry ? "" : undefined,
    count: v.timesPlayed,
  }));
}

export function mapReviewsFromData(d: DjDemoData) {
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

export function mapMediaFromData(d: DjDemoData) {
  return d.media.photos.map((url, i) => ({ id: i + 1, url }));
}

export function mapFeaturedMix(d: DjDemoData) {
  const fm = d.spotlight.featuredMix;
  return {
    title: fm.title,
    duration: fm.duration,
    plays: formatPlays(fm.plays),
    platform: getPlatformFromUrl(fm.audioUrl),
    genres: fm.genres,
    audioUrl: fm.audioUrl,
  };
}

// ── Free plan wrappers (backward-compatible) ───────────────────────────────────

export function mapFreeDjToProps(d: DjDemoData) {
  return mapDjToProps(d);
}

export function mapFreeEventsFromData(d: DjDemoData) {
  return mapEventsFromData(d);
}

export function mapFreeVenuesFromData(d: DjDemoData) {
  return mapVenuesFromData(d, { withCountry: true });
}

export function mapFreeReviewsFromData(d: DjDemoData) {
  return mapReviewsFromData(d);
}

export function mapFreeMediaFromData(d: DjDemoData) {
  return mapMediaFromData(d);
}

export function mapFreeFeaturedMix(d: DjDemoData) {
  return mapFeaturedMix(d);
}

// ── Premium plan mappers ────────────────────────────────────────────────────────

export function mapPremiumDjToProps(d: DjDemoData) {
  return {
    ...mapDjToProps(d),
    responseRate: d.stats.responseRate,
    bookingSuccessRate: d.stats.bookingRate,
    profileViews: d.stats.monthlyViews,
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

export function mapPremiumEventsFromData(d: DjDemoData) {
  return mapEventsFromData(d, { withStatus: true });
}

export function mapPremiumVenuesFromData(d: DjDemoData) {
  return mapVenuesFromData(d);
}

export function mapPremiumReviewsFromData(d: DjDemoData) {
  return mapReviewsFromData(d);
}

export function mapPremiumMediaFromData(d: DjDemoData): PremiumMediaItem[] {
  const photos: PremiumMediaItem[] = d.media.photos.map((url, i) => ({
    id: i + 1,
    url,
    type: "photo" as const,
  }));
  const videoThumb = d.spotlight.featuredVideo.thumbnail || "/gallery-1.png";
  const videos: PremiumMediaItem[] = d.media.videos.map((v, i) => ({
    id: photos.length + i + 1,
    url: videoThumb,
    videoUrl: v.url,
    title: v.title,
    type: "video" as const,
  }));
  return [...photos, ...videos];
}

export function mapEndorsementsFromData(d: DjDemoData) {
  return d.endorsements.map((e, i) => ({
    name: e.name,
    role: `${e.role}, ${e.company}`,
    quote: e.quote,
    avatar: ENDORSER_AVATARS[i % ENDORSER_AVATARS.length],
  }));
}

export function mapHighlightsFromData(d: DjDemoData) {
  return d.careerHighlights.map((h, i) => ({
    year: String(h.year),
    title: h.title,
    icon: HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length],
  }));
}

export function mapPressFromData(d: DjDemoData) {
  return d.press.map((p) => ({
    outlet: p.source,
    type: p.type,
    title: p.title,
    date: p.date,
    icon: PRESS_ICON_MAP[p.type] ?? Newspaper,
  }));
}

export function mapPackagesFromData(d: DjDemoData) {
  const PKG_COLORS: Record<string, string> = {
    "Club Night": "from-h_red/20 to-transparent",
    Festival: "from-amber-500/20 to-transparent",
    "Private Event": "from-blue-600/20 to-transparent",
  };
  return d.packages.map((pkg, i) => ({
    name: pkg.name,
    icon:
      PACKAGE_ICON_MAP[pkg.name] ?? HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length],
    price: `From ${pkg.currency}${formatNumber(pkg.priceFrom)}`,
    duration: pkg.features[0] ?? "",
    includes: pkg.features.slice(1),
    color: PKG_COLORS[pkg.name] ?? "from-h_red/20 to-transparent",
    featured: pkg.popular ?? false,
  }));
}

export function mapMixesFromData(d: DjDemoData) {
  const featured = mapFeaturedMix(d);
  const rest = d.media.mixes.map((m) => ({
    title: m.title,
    duration: "",
    plays: "",
    platform: getPlatformFromUrl(m.url),
    audioUrl: m.url,
  }));
  return [featured, ...rest];
}

export function buildCalendarFromData(d: DjDemoData) {
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

export function getCalendarMonthLabel(d: DjDemoData): string {
  const [y, mo] = d.availability.month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(y, mo - 1, 1));
}
