import prisma from "@/lib/client";
import { cacheGet, cacheSet } from "@/lib/cache";

const TRENDING_EVENTS_TTL = 300;
const NEW_EVENTS_TTL = 300;

export type TrendingEvent = {
  id: number;
  slug: string;
  title: string;
  eventType: string;
  category: string;
  startDate: Date;
  posterUrl: string | null;
  location: string;
  djName: string;
  djSlug: string;
  isDemo: boolean;
};

export type NewEvent = TrendingEvent;

// ============================================================
// FAN — ATTENDED EVENTS WITH PENDING DJ REVIEWS
// Completed events the user attended within the 30-day review
// window, including only DJs that have not been reviewed yet.
// ============================================================

export async function getAttendedEventsWithPendingReviews(userId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const attendances = await prisma.eventAttendance.findMany({
    where: { userId, status: "ATTENDED" },
    select: { eventId: true },
  });

  const eventIds = attendances.map((a) => a.eventId);
  if (eventIds.length === 0) return [];

  const events = await prisma.event.findMany({
    where: {
      id: { in: eventIds },
      status: "COMPLETED",
      startDate: { gte: thirtyDaysAgo },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      startDate: true,
      posterUrl: true,
      city: { select: { name: true } },
      ownerDj: {
        select: { id: true, slug: true, stageName: true, avatar: true },
      },
      participants: {
        select: {
          role: true,
          djProfile: {
            select: { id: true, slug: true, stageName: true, avatar: true },
          },
        },
      },
      eventReviews: {
        where: { userId },
        select: { djProfileId: true },
      },
    },
  });

  return events
    .map((e) => {
      const ownerDj = e.ownerDj
        ? { ...e.ownerDj, role: "Owner" as const }
        : null;
      const participantDjs = e.participants.map((p) => ({
        ...p.djProfile,
        role: p.role,
      }));
      const allDjs = ownerDj ? [ownerDj, ...participantDjs] : participantDjs;
      const reviewedIds = new Set(e.eventReviews.map((r) => r.djProfileId));
      const djs = allDjs.map((dj) => ({
        ...dj,
        reviewed: reviewedIds.has(dj.id),
      }));
      const pendingDjs = djs.filter((dj) => !dj.reviewed);
      const daysRemaining = Math.max(
        0,
        30 -
          Math.floor(
            (Date.now() - new Date(e.startDate).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
      );
      return {
        eventId: e.id,
        slug: e.slug,
        title: e.title,
        startDate: e.startDate,
        posterUrl: e.posterUrl,
        cityName: e.city?.name ?? null,
        djs,
        pendingDjs,
        reviewedCount: djs.filter((dj) => dj.reviewed).length,
        totalDjCount: djs.length,
        daysRemaining,
      };
    })
    .filter((e) => e.pendingDjs.length > 0);
}

export type AttendedEventWithPendingReview = Awaited<
  ReturnType<typeof getAttendedEventsWithPendingReviews>
>[number];

// ============================================================
// HOMEPAGE — TRENDING EVENTS
// Upcoming events sorted by popularity (views + attendance)
// ============================================================

export async function getTrendingEvents(limit = 6): Promise<TrendingEvent[]> {
  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging";

  if (isStaging) {
    // Use demo data for staging
    const { getDemoEvents } = await import("@/data/events-demo");
    const demoEvents = getDemoEvents();
    return demoEvents
      .filter((e) => e.daysOffset > 0) // Only upcoming
      .slice(0, limit)
      .map((e) => ({
        id: 0,
        slug: e.slug,
        title: e.title,
        eventType: e.eventType ?? "",
        category: e.category ?? "",
        startDate: e.eventDate,
        posterUrl: e.posterUrl ?? null,
        location: [e.city, e.country].filter(Boolean).join(", "),
        djName:
          e.djName ||
          e.djSlug
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
        djSlug: e.djSlug,
        isDemo: true,
      }));
  }

  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const cacheKey = `trending_events:homepage:${limit}`;
  const cached = await cacheGet<TrendingEvent[]>(cacheKey);
  if (cached) return cached;

  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      startDate: { gt: new Date(), lte: thirtyDaysFromNow },
      deletedAt: null,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      eventType: true,
      category: true,
      startDate: true,
      posterUrl: true,
      viewCount: true,
      city: { select: { name: true } },
      country: { select: { name: true } },
      ownerDj: {
        select: { slug: true, stageName: true },
      },
      _count: {
        select: {
          participants: true,
        },
      },
    },
    orderBy: [{ viewCount: "desc" }, { startDate: "asc" }],
    take: limit,
  });

  const result = events.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    eventType: e.eventType ?? "",
    category: e.category ?? "",
    startDate: e.startDate,
    posterUrl: e.posterUrl,
    location: [e.city?.name, e.country?.name].filter(Boolean).join(", "),
    djName: e.ownerDj.stageName,
    djSlug: e.ownerDj.slug,
    isDemo: false,
  }));

  await cacheSet(cacheKey, result, TRENDING_EVENTS_TTL);
  return result;
}

// ============================================================
// HOMEPAGE — NEW EVENTS
// Recently published upcoming events
// ============================================================

export async function getNewEvents(limit = 6): Promise<NewEvent[]> {
  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging";

  if (isStaging) {
    // Use demo data for staging
    const { getDemoEvents } = await import("@/data/events-demo");
    const demoEvents = getDemoEvents();
    return demoEvents
      .filter((e) => e.daysOffset > 0) // Only upcoming
      .slice(0, limit)
      .map((e) => ({
        id: 0,
        slug: e.slug,
        title: e.title,
        eventType: e.eventType ?? "",
        category: e.category ?? "",
        startDate: e.eventDate,
        posterUrl: e.posterUrl ?? null,
        location: [e.city, e.country].filter(Boolean).join(", "),
        djName:
          e.djName ||
          e.djSlug
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
        djSlug: e.djSlug,
        isDemo: true,
      }));
  }

  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const cacheKey = `new_events:homepage:${limit}`;
  const cached = await cacheGet<NewEvent[]>(cacheKey);
  if (cached) return cached;

  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      startDate: { gt: new Date(), lte: thirtyDaysFromNow },
      deletedAt: null,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      eventType: true,
      category: true,
      startDate: true,
      posterUrl: true,
      createdAt: true,
      city: { select: { name: true } },
      country: { select: { name: true } },
      ownerDj: {
        select: { slug: true, stageName: true },
      },
    },
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });

  const result = events.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    eventType: e.eventType ?? "",
    category: e.category ?? "",
    startDate: e.startDate,
    posterUrl: e.posterUrl,
    location: [e.city?.name, e.country?.name].filter(Boolean).join(", "),
    djName: e.ownerDj.stageName,
    djSlug: e.ownerDj.slug,
    isDemo: false,
  }));

  await cacheSet(cacheKey, result, NEW_EVENTS_TTL);
  return result;
}

// ============================================================
// DJ PROFILE — DJ'S EVENTS
// Events where the DJ is owner or participant
// ============================================================

export async function getDjEvents(djProfileId: number, limit = 12) {
  const now = new Date();

  const events = await prisma.event.findMany({
    where: {
      status: { in: ["PUBLISHED", "COMPLETED"] },
      deletedAt: null,
      OR: [
        { ownerDjId: djProfileId },
        {
          participants: {
            some: { djProfileId },
          },
        },
      ],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      eventType: true,
      category: true,
      startDate: true,
      posterUrl: true,
      city: { select: { name: true } },
      country: { select: { name: true } },
      ownerDj: {
        select: { slug: true, stageName: true },
      },
    },
    orderBy: [{ startDate: "desc" }],
    take: limit,
  });

  return events.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    eventType: e.eventType,
    category: e.category,
    startDate: e.startDate,
    posterUrl: e.posterUrl,
    location: [e.city?.name, e.country?.name].filter(Boolean).join(", "),
    djName: e.ownerDj.stageName,
    djSlug: e.ownerDj.slug,
    isDemo: false,
  }));
}

export type DjEvent = Awaited<ReturnType<typeof getDjEvents>>[number];

// ============================================================
// VENUE REVIEW CONTEXT
// Data needed to render the venue review prompt for a
// specific event. Returns null if the current user did not attend
// the event or if there is no venue associated.
// ============================================================

export async function getVenueReviewContextBySlug(
  slug: string,
  userId: string,
) {
  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      startDate: true,
      venue: true,
      cityId: true,
      countryId: true,
      venueReviews: {
        where: { userId },
      },
    },
  });

  if (!event) return null;

  // Check if user attended the event
  const attendance = await prisma.eventAttendance.findUnique({
    where: { eventId_userId: { eventId: event.id, userId } },
  });

  if (!attendance || attendance.status !== "ATTENDED") return null;

  // Check if event has a venue
  if (!event.venue) return null;

  // Return null if event has no cityId - venue lookup requires valid location
  if (!event.cityId) return null;

  // Read-only: find existing venue record
  const venue = await prisma.venue.findFirst({
    where: {
      name: event.venue,
      cityId: event.cityId,
    },
  });

  if (!venue) return null;

  const isCompleted = event.status === "COMPLETED";
  const alreadyReviewed = event.venueReviews.length > 0;

  let reviewWindowOpen = false;
  let daysRemaining = null;

  if (isCompleted && !alreadyReviewed) {
    const daysSince =
      (Date.now() - new Date(event.startDate).getTime()) /
      (1000 * 60 * 60 * 24);

    if (daysSince <= 30) {
      reviewWindowOpen = true;
      daysRemaining = Math.max(0, Math.floor(30 - daysSince));
    }
  }

  return {
    eventId: event.id,
    eventSlug: event.slug,
    eventTitle: event.title,
    venueId: venue.id,
    venueName: venue.name,
    isCompleted,
    alreadyReviewed,
    reviewWindowOpen,
    daysRemaining,
  };
}

export type VenueReviewContext = NonNullable<
  Awaited<ReturnType<typeof getVenueReviewContextBySlug>>
>;
