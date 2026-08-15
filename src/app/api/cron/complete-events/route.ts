import prisma from "@/lib/client";

export async function GET(request: Request) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return new Response("Cron secret is not configured", { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h after event ends
  const completionWindow = [
    { endDate: null, startDate: { lt: cutoff } },
    { endDate: { lt: cutoff } },
  ];

  // Find the events that are about to be marked completed so we can
  // notify attendees exactly once per event.
  const eventsToComplete = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      OR: completionWindow,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      ownerDj: {
        select: {
          id: true,
          stageName: true,
          slug: true,
        },
      },
      participants: {
        select: {
          djProfile: {
            select: {
              id: true,
              stageName: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (eventsToComplete.length > 0) {
    for (const event of eventsToComplete) {
      await prisma.$transaction(async (tx) => {
        const { count } = await tx.event.updateMany({
          where: { id: event.id, status: "PUBLISHED", OR: completionWindow },
          data: { status: "COMPLETED" },
        });
        if (count !== 1) return;

        // Auto-transition GOING → ATTENDED when event completes
        await tx.eventAttendance.updateMany({
          where: { eventId: event.id, status: "GOING" },
          data: { status: "ATTENDED" },
        });

        const attendees = await tx.eventAttendance.findMany({
          where: { eventId: event.id, status: "ATTENDED" },
          select: { userId: true },
        });

        if (attendees.length > 0) {
          // Filter out attendees who have already been notified or dismissed
          const attendeesToNotify: string[] = [];
          for (const attendee of attendees) {
            const existing = await tx.reviewNotificationTracking.findUnique({
              where: {
                userId_targetType_targetId: {
                  userId: attendee.userId,
                  targetType: "EVENT",
                  targetId: event.id,
                },
              },
            });

            // Only notify if not previously notified or if dismissed
            if (!existing || !existing.dismissedAt) {
              attendeesToNotify.push(attendee.userId);
            }

            // Track notification to prevent spam
            await tx.reviewNotificationTracking.upsert({
              where: {
                userId_targetType_targetId: {
                  userId: attendee.userId,
                  targetType: "EVENT",
                  targetId: event.id,
                },
              },
              create: {
                userId: attendee.userId,
                targetType: "EVENT",
                targetId: event.id,
                notifiedAt: new Date(),
              },
              update: {
                notifiedAt: new Date(),
              },
            });
          }

          if (attendeesToNotify.length > 0) {
            await tx.notification.createMany({
              data: attendeesToNotify.map((userId) => ({
                type: "EVENT_COMPLETED" as const,
                recipientId: userId,
                data: {
                  eventId: event.id,
                  eventSlug: event.slug,
                  eventTitle: event.title,
                  djCount: event.participants.length + 1, // owner + participants
                  djNames: [
                    event.ownerDj.stageName,
                    ...event.participants.map((p) => p.djProfile.stageName),
                  ].join(", "),
                },
              })),
            });
          }
        }
      });
    }
  }

  return new Response("OK");
}
