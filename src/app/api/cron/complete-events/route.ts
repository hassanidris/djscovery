import prisma from "@/lib/client";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48h after start

  // Find the events that are about to be marked completed so we can
  // notify attendees exactly once per event.
  const eventsToComplete = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      startDate: { lt: cutoff },
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
    await prisma.event.updateMany({
      where: {
        id: { in: eventsToComplete.map((e) => e.id) },
      },
      data: { status: "COMPLETED" },
    });

    for (const event of eventsToComplete) {
      const attendees = await prisma.eventAttendance.findMany({
        where: { eventId: event.id, status: "ATTENDED" },
        select: { userId: true },
      });

      if (attendees.length > 0) {
        await prisma.notification.createMany({
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
    }
  }

  return new Response("OK");
}
