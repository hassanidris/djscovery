import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";

// Intentionally dynamic (uses cookies/auth). Must never be called from
// within an ISR-cached page render. /events/[slug] stays a static shell;
// this route supplies the current viewer's per-event state via a client fetch.

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      isOwner: false,
      isOrganizer: false,
      hasAttended: false,
      reviewedDjIds: [],
      attendanceStatus: null,
      privateVenue: null,
    });
  }

  const numericEventId = parseInt(eventId, 10);
  if (isNaN(numericEventId)) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { id: numericEventId },
    select: {
      id: true,
      ownerDjId: true,
      venue: true,
      eventType: true,
      participants: {
        select: { djProfileId: true },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const djProfile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  const isOwner = !!djProfile && djProfile.id === event.ownerDjId;
  const isOrganizer = isOwner;

  const attendance = await prisma.eventAttendance.findUnique({
    where: {
      eventId_userId: {
        eventId: numericEventId,
        userId: user.id,
      },
    },
    select: { status: true },
  });

  const hasAttended = attendance?.status === "GOING";
  const attendanceStatus = attendance?.status ?? null;

  const reviewedDjIds = await prisma.eventReview
    .findMany({
      where: {
        eventId: numericEventId,
        userId: user.id,
      },
      select: { djProfileId: true },
    })
    .then((reviews) => reviews.map((r) => r.djProfileId));

  const privateVenue =
    event.eventType === "PRIVATE" && (isOwner || hasAttended)
      ? event.venue
      : null;

  return NextResponse.json({
    isOwner,
    isOrganizer,
    hasAttended,
    reviewedDjIds,
    attendanceStatus,
    privateVenue,
  });
}
