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
      canReview: false,
      reviewedDjIds: [],
      attendanceStatus: null,
      privateVenue: null,
      isAuthenticated: false,
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

  // `hasAttended` is used for gating access that should apply once a user has
  // RSVP'd (e.g. revealing a private venue address before the event) — it is
  // true for both "GOING" (upcoming) and "ATTENDED" (post-event, auto-set by
  // the complete-events cron job) statuses.
  const hasAttended =
    attendance?.status === "GOING" || attendance?.status === "ATTENDED";
  // `canReview` is stricter: reviews should only be allowed once attendance
  // has been confirmed post-event ("ATTENDED"). Since the complete-events
  // cron atomically flips GOING -> ATTENDED when an event completes, review
  // eligibility must check for "ATTENDED" specifically, not "GOING".
  const canReview = attendance?.status === "ATTENDED";
  const attendanceStatus = attendance?.status ?? null;

  // Check DjRating table for event-anchored reviews by this user.
  // (Previously checked EventReview table; now unified into DjRating.)
  const reviewedDjIds = await prisma.djRating
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
    canReview,
    reviewedDjIds,
    attendanceStatus,
    privateVenue,
    isAuthenticated: true,
  });
}
