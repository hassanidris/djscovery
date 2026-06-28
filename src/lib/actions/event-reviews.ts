"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { updateReputationScore } from "@/lib/reputation/update";
import { revalidatePath } from "next/cache";

export async function createEventReview(
  eventId: number,
  djProfileId: number,
  data: { rating: number; review: string },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  if (data.rating < 1 || data.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const attendance = await prisma.eventAttendance.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
  });
  if (!attendance || attendance.status !== "ATTENDED") {
    throw new Error("You must have attended this event to review");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { slug: true, status: true, startDate: true },
  });
  if (!event) throw new Error("Event not found");
  if (event.status !== "COMPLETED") {
    throw new Error("Event must be completed before reviewing");
  }

  const isParticipant = await prisma.eventDj.findUnique({
    where: { eventId_djProfileId: { eventId, djProfileId } },
  });
  if (!isParticipant) throw new Error("DJ did not perform at this event");

  const existingReview = await prisma.eventReview.findUnique({
    where: {
      userId_eventId_djProfileId: {
        userId: user.id,
        eventId,
        djProfileId,
      },
    },
  });
  if (existingReview) throw new Error("You have already reviewed this DJ for this event");

  const daysSince =
    (Date.now() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince > 30) throw new Error("Review window expired (30 days)");

  if (!data.review || data.review.length < 30) {
    throw new Error("Review must be at least 30 characters");
  }

  const createdReview = await prisma.eventReview.create({
    data: {
      eventId,
      djProfileId,
      userId: user.id,
      rating: data.rating,
      review: data.review,
    },
  });

  await updateReputationScore(djProfileId, "EVENT_REVIEW_ADDED");

  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/fan/profile");

  return createdReview;
}
