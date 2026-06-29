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
