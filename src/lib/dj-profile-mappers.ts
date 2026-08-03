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
  // First, try the demo events lookup (works for fictional demo DJs)
  const demoEvents = getDemoEventsByDjSlug(d.slug);
  if (demoEvents.length > 0) {
    return demoEvents.map((e, i) => ({
      id: i + 1,
      title: e.title,
      date: e.eventDate.toISOString(),
      venue: e.venue ?? "",
      city: e.city,
      country: e.country,
      slug: e.slug,
      isPast: e.daysOffset <= 0,
      eventType: (e as any).eventType,
      category: (e as any).category,
      ...(opts?.withStatus ? { status: "confirmed" as const } : {}),
    }));
  }

  // Fall back to DB-backed events passed via DjDemoData.events
  const dbEvents = (d as any).events;
  if (Array.isArray(dbEvents) && dbEvents.length > 0) {
    return dbEvents.map((e: any) => ({
      id: e.id,
      title: e.title,
      date: new Date(e.startDate).toISOString(),
      venue: e.venue ?? "",
      city: e.city ?? "",
      country: e.country ?? "",
      slug: e.slug ?? "",
      isPast: new Date(e.startDate) < new Date(),
      eventType: e.eventType,
      category: e.category,
      status: e.status,
    }));
  }

  // Fall back to upcomingEvents (legacy field)
  const upcoming = d.upcomingEvents || [];
  if (upcoming.length > 0) {
    return upcoming.map((e, i) => ({
      id: (e as any).id ?? i + 1,
      title: e.title,
      date: new Date(e.date || (e as any).eventDate).toISOString(),
      venue: e.venue ?? "",
      city: e.city ?? "",
      country: (e as any).country ?? "",
      slug: e.slug ?? "",
      isPast: e.isPast ?? new Date(e.date || (e as any).eventDate) < new Date(),
      eventType: (e as any).eventType,
      category: (e as any).category,
    }));
  }

  return [];
}

export function mapVenuesFromData(
  d: DjDemoData,
  opts?: { withCountry?: boolean },
) {
  return (d.venuesPlayed || []).map((v, i) => ({
    id: v.id || i + 1,
    venueName: v.venue,
    eventDate: v.date || null,
    description: v.description || null,
    city: { name: v.city },
    country: opts?.withCountry ? { name: v.country || "" } : { name: "" },
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
    id: fm.id,
    title: fm.title,
    duration: fm.duration,
    plays: formatPlays(fm.plays),
    platform: getPlatformFromUrl(fm.audioUrl),
    genres: fm.genres,
    audioUrl: fm.audioUrl,
    thumbnail: fm.thumbnail,
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
  const events = Array.isArray((d as any).events) ? (d as any).events : [];
  return events.map((e: any, i: number) => ({
    id: e.id,
    title: e.title,
    date: e.startDate?.toISOString() || new Date().toISOString(),
    venue: e.venue || "",
    city: e.city?.name || e.city || "",
    country: e.country?.name || e.country || "",
    slug: e.slug || "",
    isPast: new Date(e.startDate) < new Date(),
    eventType: e.eventType,
    category: e.category,
    status: e.status,
  }));
}

export function mapPremiumVenuesFromData(d: DjDemoData) {
  const venues = Array.isArray((d as any).venues) ? (d as any).venues : [];
  return venues.map((v: any, i: number) => ({
    id: v.id || i + 1,
    venueName: v.venueName || v.venue,
    eventDate: v.eventDate || null,
    description: v.description || null,
    city: { name: v.city?.name || v.city || "" },
    country: { name: v.country?.name || v.country || "" },
    latitude: v.latitude,
    longitude: v.longitude,
  }));
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
    id: v.id,
    url: v.thumbnail || videoThumb,
    videoUrl: v.url,
    title: v.title,
    type: "video" as const,
    views: v.views ?? 0,
  }));
  return [...photos, ...videos];
}

export function mapEndorsementsFromData(d: DjDemoData) {
  const endorsements = Array.isArray((d as any).endorsements)
    ? (d as any).endorsements
    : [];
  return endorsements.map((e: any, i: number) => ({
    id: e.id,
    name: e.name,
    role: `${e.role}, ${e.company}`,
    quote: e.quote,
    avatar: e.avatar || ENDORSER_AVATARS[i % ENDORSER_AVATARS.length],
  }));
}

export function mapHighlightsFromData(d: DjDemoData) {
  const highlights = Array.isArray((d as any).careerHighlights)
    ? (d as any).careerHighlights
    : [];
  return highlights.map((h: any, i: number) => ({
    id: h.id,
    year: String(h.year),
    title: h.title,
    description: h.description,
    icon: HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length],
  }));
}

export function mapPressFromData(d: DjDemoData) {
  const press = Array.isArray((d as any).press) ? (d as any).press : [];
  return press.map((p: any) => ({
    id: p.id,
    outlet: p.source,
    type: p.type,
    title: p.title,
    date: p.date,
    url: p.url || "",
    icon: PRESS_ICON_MAP[p.type] ?? Newspaper,
  }));
}

export function mapPackagesFromData(d: DjDemoData) {
  const PKG_COLORS: Record<string, string> = {
    "Club Night": "from-h_red/20 to-transparent",
    Festival: "from-amber-500/20 to-transparent",
    "Private Event": "from-blue-600/20 to-transparent",
  };
  const packages = Array.isArray((d as any).packages)
    ? (d as any).packages
    : [];
  return packages.map((pkg: any, i: number) => {
    // Use duration string directly (e.g., "3-4 hours", "2 hours")
    const duration = pkg.duration || "";

    // Format price range
    let price = `From ${pkg.currency}${formatNumber(pkg.priceFrom)}`;
    if (pkg.priceTo && pkg.priceTo > pkg.priceFrom) {
      price = `From ${pkg.currency}${formatNumber(pkg.priceFrom)} – ${pkg.currency}${formatNumber(pkg.priceTo)}`;
    }

    return {
      id: pkg.id,
      name: pkg.name,
      icon:
        PACKAGE_ICON_MAP[pkg.name] ??
        HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length],
      price,
      duration,
      includes: pkg.features || [],
      color: PKG_COLORS[pkg.name] ?? "from-h_red/20 to-transparent",
      featured: pkg.popular ?? false,
      priceFrom: pkg.priceFrom,
      priceTo: pkg.priceTo,
      currency: pkg.currency,
      sortOrder: pkg.sortOrder || 0,
    };
  });
}

export function mapMixesFromData(d: DjDemoData) {
  const featured = mapFeaturedMix(d);
  const rest = d.media.mixes
    .filter((m) => m.id !== featured.id)
    .map((m) => ({
      id: m.id,
      title: m.title,
      duration: m.duration || "",
      plays: formatPlays(m.plays ?? 0),
      platform: getPlatformFromUrl(m.url),
      audioUrl: m.url,
    }));
  return [featured, ...rest];
}

function isValidMonthFormat(monthStr: string): boolean {
  if (!monthStr || !monthStr.includes("-")) return false;
  const [y, m] = monthStr.split("-").map(Number);
  if (!y || !m || Number.isNaN(y) || Number.isNaN(m)) return false;
  return m >= 1 && m <= 12 && y >= 2000 && y <= 2100;
}

export function buildCalendarFromData(d: DjDemoData) {
  const monthStr = d.availability.month;
  if (!isValidMonthFormat(monthStr)) {
    return [];
  }
  const [y, mo] = monthStr.split("-").map(Number);
  const daysInMonth = new Date(y, mo, 0).getDate();
  const { availableDays, bookedDays, tentativeDays } = d.availability;
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const status =
      Array.isArray(bookedDays) && bookedDays.includes(day)
        ? "booked"
        : Array.isArray(tentativeDays) && tentativeDays.includes(day)
          ? "tentative"
          : Array.isArray(availableDays) && availableDays.includes(day)
            ? "available"
            : "free";
    return { day, status };
  });
}

export function getCalendarMonthLabel(d: DjDemoData): string {
  const monthStr = d.availability.month;
  if (!isValidMonthFormat(monthStr)) {
    return "Select a month";
  }
  const [y, mo] = monthStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(y, mo - 1, 1));
}
