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
      participants: {
        select: { djProfileId: true },
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
          await tx.notification.createMany({
            data: attendees.map((attendee) => ({
              type: "EVENT_COMPLETED" as const,
              recipientId: attendee.userId,
              data: {
                eventId: event.id,
                eventSlug: event.slug,
                eventTitle: event.title,
                djCount: event.participants.length + 1, // owner + participants
              },
            })),
          });
        }
      });
    }
  }

  return new Response("OK");
}
