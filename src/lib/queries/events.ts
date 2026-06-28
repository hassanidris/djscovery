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
      ownerDj: {
        select: { id: true, slug: true, stageName: true, avatar: true },
      },
      participants: {
        select: {
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
      const allDjs = [
        e.ownerDj,
        ...e.participants.map((p) => p.djProfile),
      ];
      const reviewedIds = new Set(e.eventReviews.map((r) => r.djProfileId));
      const pendingDjs = allDjs.filter((dj) => !reviewedIds.has(dj.id));
      return {
        eventId: e.id,
        slug: e.slug,
        title: e.title,
        startDate: e.startDate,
        posterUrl: e.posterUrl,
        pendingDjs,
      };
    })
    .filter((e) => e.pendingDjs.length > 0);
}

export type AttendedEventWithPendingReview = Awaited<
  ReturnType<typeof getAttendedEventsWithPendingReviews>
>[number];
