import prisma from "@/lib/client";

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

export async function getTrendingEvents(limit = 6) {
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
        eventType: e.eventType,
        category: e.category,
        startDate: e.eventDate,
        posterUrl: e.posterUrl ?? null,
        location: [e.city, e.country].filter(Boolean).join(", "),
        djName: e.djSlug,
        djSlug: e.djSlug,
        isDemo: true,
      }));
  }

  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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

export type TrendingEvent = Awaited<
  ReturnType<typeof getTrendingEvents>
>[number];

// ============================================================
// HOMEPAGE — NEW EVENTS
// Recently published upcoming events
// ============================================================

export async function getNewEvents(limit = 6) {
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
        eventType: e.eventType,
        category: e.category,
        startDate: e.eventDate,
        posterUrl: e.posterUrl ?? null,
        location: [e.city, e.country].filter(Boolean).join(", "),
        djName: e.djSlug,
        djSlug: e.djSlug,
        isDemo: true,
      }));
  }

  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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

export type NewEvent = Awaited<ReturnType<typeof getNewEvents>>[number];

// ============================================================
// DJ PROFILE — DJ'S EVENTS
// Events where the DJ is owner or participant
// ============================================================

export async function getDjEvents(djProfileId: number, limit = 12) {
  const now = new Date();

  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
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
