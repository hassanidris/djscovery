"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { updateReputationScore } from "@/lib/reputation/update";
import { revalidatePath } from "next/cache";
import { ActionResult, actionError, actionSuccess } from "./action-result";

export async function createEventReview(
  eventId: number,
  djProfileId: number,
  data: { rating: number; review: string },
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("Unauthorized");

  if (data.rating < 1 || data.rating > 5) {
    return actionError("Rating must be between 1 and 5");
  }

  const attendance = await prisma.eventAttendance.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
  });
  if (!attendance || attendance.status !== "ATTENDED") {
    return actionError("You must have attended this event to review");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      slug: true,
      title: true,
      status: true,
      startDate: true,
      ownerDjId: true,
    },
  });
  if (!event) return actionError("Event not found");
  if (event.status !== "COMPLETED") {
    return actionError("Event must be completed before reviewing");
  }

  const participant = await prisma.eventDj.findUnique({
    where: { eventId_djProfileId: { eventId, djProfileId } },
  });
  const canReviewDj = event.ownerDjId === djProfileId || Boolean(participant);
  if (!canReviewDj) return actionError("DJ did not perform at this event");

  const existingReview = await prisma.eventReview.findUnique({
    where: {
      userId_eventId_djProfileId: {
        userId: user.id,
        eventId,
        djProfileId,
      },
    },
  });
  if (existingReview)
    return actionError("You have already reviewed this DJ for this event");

  const daysSince =
    (Date.now() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince > 30) return actionError("Review window expired (30 days)");

  if (!data.review || data.review.length < 30) {
    return actionError("Review must be at least 30 characters");
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

  const djProfile = await prisma.djProfile.findUnique({
    where: { id: djProfileId },
    select: { userId: true },
  });

  if (djProfile) {
    await prisma.notification.create({
      data: {
        type: "NEW_RATING",
        recipientId: djProfile.userId,
        data: {
          eventId,
          eventTitle: event.title,
          rating: data.rating,
          reviewerType: "fan",
        },
      },
    });
  }

  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/fan/profile");

  return actionSuccess();
}
