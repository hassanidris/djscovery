"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { updateReputationScore } from "@/lib/reputation/update";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { ActionResult, actionError, actionSuccess } from "./action-result";

async function checkVelocityLimits(
  organizerId: string,
  djProfileId: number,
): Promise<ActionResult> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentByOrganizer = await prisma.gigReview.count({
    where: { organizerId, createdAt: { gte: sevenDaysAgo } },
  });
  if (recentByOrganizer >= 1)
    return actionError("You can only review one gig per week");

  const recentToDj = await prisma.gigReview.count({
    where: { djProfileId, createdAt: { gte: sevenDaysAgo } },
  });
  if (recentToDj >= 3)
    return actionError("This DJ has received too many reviews recently");

  return actionSuccess();
}

export async function createGigReview(
  gigId: number,
  djProfileId: number,
  data: { rating: number; review?: string },
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("Unauthorized");

  const velocityCheck = await checkVelocityLimits(user.id, djProfileId);
  if (!velocityCheck.success) return velocityCheck;

  if (data.rating < 1 || data.rating > 5) {
    return actionError("Rating must be between 1 and 5");
  }

  const gig = await prisma.gig.findUnique({
    where: { id: gigId },
    include: {
      organizerProfile: true,
      applications: {
        where: { djProfileId, status: "ACCEPTED" },
        include: { djProfile: { select: { id: true, userId: true } } },
      },
      gigReviews: {
        where: { djProfileId },
      },
    },
  });

  if (!gig || gig.organizerProfile.userId !== user.id) {
    return actionError("Only the gig organizer can review");
  }

  if (gig.gigReviews.length > 0) {
    return actionError("You have already reviewed this DJ for this gig");
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

  if (!data.review || data.review.length < 30) {
    return actionError("Review must be at least 30 characters");
  }

  const h = await headers();

  const review = await prisma.gigReview.create({
    data: {
      gigId,
      djProfileId,
      organizerId: user.id,
      rating: data.rating,
      review: data.review,
      ipAddress: h.get("x-forwarded-for") || "unknown",
      userAgent: h.get("user-agent") || "unknown",
    },
  });

  await updateReputationScore(djProfileId, "GIG_REVIEW_ADDED" as const);

  await prisma.notification.create({
    data: {
      type: "NEW_RATING",
      recipientId: application.djProfile.userId,
      data: {
        gigId: gig.id,
        gigTitle: gig.title,
        rating: data.rating,
        reviewerName: gig.organizerProfile.displayName,
      },
    },
  });

  revalidatePath(`/gigs/${gig.slug}`);
  revalidatePath(`/gigs/${gig.slug}/review`);
  revalidatePath("/organizer/dashboard");
  revalidatePath(`/organizer/gigs/${gigId}`);

  return actionSuccess();
}
