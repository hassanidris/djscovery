"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { updateReputationScore } from "@/lib/reputation/update";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function checkVelocityLimits(organizerId: string, djProfileId: number) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentByOrganizer = await prisma.gigReview.count({
    where: { organizerId, createdAt: { gte: sevenDaysAgo } },
  });
  if (recentByOrganizer >= 1)
    throw new Error("You can only review one gig per week");

  const recentToDj = await prisma.gigReview.count({
    where: { djProfileId, createdAt: { gte: sevenDaysAgo } },
  });
  if (recentToDj >= 3)
    throw new Error("This DJ has received too many reviews recently");
}

export async function createGigReview(
  gigId: number,
  djProfileId: number,
  data: { rating: number; review?: string },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await checkVelocityLimits(user.id, djProfileId);

  if (data.rating < 1 || data.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
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
    throw new Error("Only the gig organizer can review");
  }

  if (gig.gigReviews.length > 0) {
    throw new Error("You have already reviewed this DJ for this gig");
  }

  if (gig.applications.length === 0) {
    throw new Error("No accepted application found");
  }

  const application = gig.applications[0];
  const hire = await prisma.hire.findUnique({
    where: { applicationId: application.id },
  });

  if (!hire || hire.status !== "COMPLETED") {
    throw new Error("Gig must be completed before reviewing");
  }

  const completedAt = hire.completedAt || gig.eventDate;
  const daysSinceCompletion =
    (Date.now() - new Date(completedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCompletion > 30) {
    throw new Error("Review window expired (30 days)");
  }

  if (!data.review || data.review.length < 30) {
    throw new Error("Review must be at least 30 characters");
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

  await updateReputationScore(djProfileId, "GIG_REVIEW_ADDED");

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
  revalidatePath(`/dashboard/organizer/gigs/${gigId}`);

  return review;
}
