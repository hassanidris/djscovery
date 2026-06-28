import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { updateReputationScore } from "@/lib/reputation/update";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId: eventIdParam } = await params;
  const eventId = parseInt(eventIdParam, 10);
  if (Number.isNaN(eventId)) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { djProfileId?: unknown; rating?: unknown; review?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { djProfileId, rating, review } = body;
  if (
    typeof djProfileId !== "number" ||
    typeof rating !== "number" ||
    typeof review !== "string"
  ) {
    return NextResponse.json(
      { error: "Missing or invalid fields" },
      { status: 400 },
    );
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 },
    );
  }

  const attendance = await prisma.eventAttendance.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
  });
  if (!attendance || attendance.status !== "ATTENDED") {
    return NextResponse.json(
      { error: "You must have attended this event to review" },
      { status: 403 },
    );
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const isCompleted =
    event.status === "COMPLETED" || new Date(event.startDate) < new Date();
  if (!isCompleted) {
    return NextResponse.json(
      { error: "Event must be completed before reviewing" },
      { status: 403 },
    );
  }

  const isParticipant = await prisma.eventDj.findUnique({
    where: { eventId_djProfileId: { eventId, djProfileId } },
  });
  if (!isParticipant) {
    return NextResponse.json(
      { error: "DJ did not perform at this event" },
      { status: 403 },
    );
  }

  const existingReview = await prisma.eventReview.findUnique({
    where: {
      userId_eventId_djProfileId: {
        userId: user.id,
        eventId,
        djProfileId,
      },
    },
  });
  if (existingReview) {
    return NextResponse.json(
      { error: "You have already reviewed this DJ for this event" },
      { status: 409 },
    );
  }

  const daysSince =
    (Date.now() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince > 30) {
    return NextResponse.json(
      { error: "Review window expired" },
      { status: 403 },
    );
  }

  if (review.length < 30) {
    return NextResponse.json(
      { error: "Review must be at least 30 characters" },
      { status: 400 },
    );
  }

  const createdReview = await prisma.eventReview.create({
    data: {
      eventId,
      djProfileId,
      userId: user.id,
      rating,
      review,
    },
  });

  await updateReputationScore(djProfileId, "EVENT_REVIEW_ADDED");

  return NextResponse.json(createdReview, { status: 201 });
}
