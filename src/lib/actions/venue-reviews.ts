"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { ActionResult, actionError, actionSuccess } from "./action-result";

async function checkVelocityLimits(
  userId: string,
  venueId: number,
): Promise<ActionResult> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentByUser = await prisma.venueReview.count({
    where: { userId, createdAt: { gte: sevenDaysAgo } },
  });
  if (recentByUser >= 2)
    return actionError("You can only review 2 venues per week");

  const recentToVenue = await prisma.venueReview.count({
    where: { venueId, createdAt: { gte: sevenDaysAgo } },
  });
  if (recentToVenue >= 5)
    return actionError("This venue has received too many reviews recently");

  return actionSuccess();
}

export async function createVenueReview(
  eventId: number,
  venueId: number,
  data: {
    soundSystem: number;
    atmosphere: number;
    location: number;
    accessibility: number;
    review?: string;
  },
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("Unauthorized");

  // Validate ratings
  const ratings = [
    data.soundSystem,
    data.atmosphere,
    data.location,
    data.accessibility,
  ];
  for (const rating of ratings) {
    if (rating < 1 || rating > 5) {
      return actionError("All ratings must be between 1 and 5");
    }
  }

  // Calculate overall rating as average of categories
  const overallRating = Math.round(
    ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
  );

  const velocityCheck = await checkVelocityLimits(user.id, venueId);
  if (!velocityCheck.success) return velocityCheck;

  // Check if user attended the event
  const attendance = await prisma.eventAttendance.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
  });
  if (!attendance || attendance.status !== "ATTENDED") {
    return actionError("You must have attended this event to review the venue");
  }

  // Check if event is completed
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });
  if (!event) return actionError("Event not found");
  if (event.status !== "COMPLETED") {
    return actionError("Event must be completed before reviewing");
  }

  // Check if venue exists
  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
  });
  if (!venue) return actionError("Venue not found");

  // Check if user already reviewed this venue for this event
  const existingReview = await prisma.venueReview.findUnique({
    where: {
      eventId_venueId_userId: {
        eventId,
        venueId,
        userId: user.id,
      },
    },
  });
  if (existingReview) {
    return actionError("You have already reviewed this venue for this event");
  }

  // Check 30-day review window
  const daysSince =
    (Date.now() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince > 30) {
    return actionError("Review window expired (30 days)");
  }

  if (!data.review || data.review.length < 30) {
    return actionError("Review must be at least 30 characters");
  }

  const h = await headers();

  const review = await prisma.venueReview.create({
    data: {
      eventId,
      venueId,
      userId: user.id,
      soundSystem: data.soundSystem,
      atmosphere: data.atmosphere,
      location: data.location,
      accessibility: data.accessibility,
      rating: overallRating,
      review: data.review,
      ipAddress: h.get("x-forwarded-for") || "unknown",
      userAgent: h.get("user-agent") || "unknown",
    },
  });

  // Update venue reputation score
  const { updateVenueReputationScore } =
    await import("@/lib/reputation/venue-update");
  await updateVenueReputationScore(venueId, "VENUE_REVIEW_ADDED" as any);

  // Create notification for venue owner (if applicable)
  // For now, venues don't have direct owners, but we could notify event organizers
  const ownerDj = await prisma.djProfile.findUnique({
    where: { id: event.ownerDjId },
    select: { userId: true },
  });

  if (ownerDj) {
    await prisma.notification.create({
      data: {
        type: "NEW_RATING",
        recipientId: ownerDj.userId,
        data: {
          eventId: event.id,
          eventTitle: event.title,
          rating: String(overallRating),
          reviewType: "venue",
          venueName: venue.name,
        },
      },
    });
  }

  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/fan/profile");

  return actionSuccess();
}
