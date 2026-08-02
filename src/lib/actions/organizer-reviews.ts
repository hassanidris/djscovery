"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { ActionResult, actionError, actionSuccess } from "./action-result";
import { updateOrganizerReputationScore } from "@/lib/reputation/organizer-update";

async function checkVelocityLimits(
  djProfileId: number,
  organizerProfileId: number,
): Promise<ActionResult> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentByDj = await prisma.organizerReview.count({
    where: {
      djProfileId,
      createdAt: { gte: sevenDaysAgo },
    },
  });
  if (recentByDj >= 1)
    return actionError("You can only review one organizer per week");

  const recentToOrganizer = await prisma.organizerReview.count({
    where: {
      organizerProfileId,
      createdAt: { gte: sevenDaysAgo },
    },
  });
  if (recentToOrganizer >= 3)
    return actionError("This organizer has received too many reviews recently");

  return actionSuccess();
}

export async function createOrganizerReview(
  gigId: number,
  organizerProfileId: number,
  data: {
    communication: number;
    payment: number;
    professionalism: number;
    venueQuality: number;
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
    data.communication,
    data.payment,
    data.professionalism,
    data.venueQuality,
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

  // Get DJ profile for this user
  const djProfile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
  });
  if (!djProfile) return actionError("DJ profile not found");

  const velocityCheck = await checkVelocityLimits(
    djProfile.id,
    organizerProfileId,
  );
  if (!velocityCheck.success) return velocityCheck;

  const gig = await prisma.gig.findUnique({
    where: { id: gigId },
    include: {
      organizerProfile: true,
      applications: {
        where: {
          djProfileId: djProfile.id,
          status: "ACCEPTED",
        },
        include: {
          djProfile: {
            select: {
              id: true,
              userId: true,
            },
          },
        },
      },
      organizerReviews: {
        where: { djProfileId: djProfile.id },
      },
    },
  });

  if (!gig || gig.organizerProfileId !== organizerProfileId) {
    return actionError("Gig not found or organizer mismatch");
  }

  if (gig.organizerReviews.length > 0) {
    return actionError("You have already reviewed this organizer for this gig");
  }

  if (gig.applications.length === 0) {
    return actionError("No accepted application found");
  }

  const application = gig.applications[0];
  const hire = await prisma.hire.findUnique({
    where: { applicationId: application.id },
  });

  if (!hire || hire.status !== "COMPLETED") {
    return actionError("Gig must be completed before reviewing");
  }

  const completedAt = hire.completedAt || gig.eventDate;
  const daysSinceCompletion =
    (Date.now() - new Date(completedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCompletion > 30) {
    return actionError("Review window expired (30 days)");
  }

  const trimmedReview = data.review?.trim();
  if (!trimmedReview || trimmedReview.length < 30) {
    return actionError("Review must be at least 30 characters");
  }

  const h = await headers();

  let review;
  try {
    review = await prisma.organizerReview.create({
      data: {
        gigId,
        djProfileId: djProfile.id,
        organizerProfileId,
        communication: data.communication,
        payment: data.payment,
        professionalism: data.professionalism,
        venueQuality: data.venueQuality,
        rating: overallRating,
        review: data.review,
        ipAddress: h.get("x-forwarded-for") || "unknown",
        userAgent: h.get("user-agent") || "unknown",
      },
    });
  } catch (error) {
    // Handle P2002 unique constraint violation (duplicate review)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return actionError(
        "You have already reviewed this organizer for this gig",
      );
    }
    // Re-throw unrelated database errors
    throw error;
  }

  // Update organizer reputation score
  const reputationResult = await updateOrganizerReputationScore(
    organizerProfileId,
    "ORGANIZER_REVIEW_ADDED" as const,
  );

  if (!reputationResult.success) {
    console.error(
      "Failed to update organizer reputation after review creation:",
      reputationResult.error,
    );
    // Review is committed; proceed with notification and revalidation
  }

  // Create notification for organizer
  await prisma.notification.create({
    data: {
      type: "NEW_RATING",
      recipientId: gig.organizerProfile.userId,
      data: {
        gigId: gig.id,
        gigTitle: gig.title,
        rating: overallRating,
        reviewerName: djProfile.stageName,
        reviewType: "organizer",
      },
    },
  });

  revalidatePath(`/gigs/${gig.slug}`);
  revalidatePath(`/gigs/${gig.slug}/organizer-review`);
  revalidatePath("/dj/dashboard");
  revalidatePath(`/organizers/${gig.organizerProfile.slug}`);

  return actionSuccess();
}
