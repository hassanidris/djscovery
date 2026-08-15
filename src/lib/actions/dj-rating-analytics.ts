"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { ActionResult, actionError, actionSuccess } from "./action-result";

export interface ReviewAnalyticsData {
  totalReviews: number;
  averageRating: number;
  directCount: number;
  eventCount: number;
  gigCount: number;
  ratingDistribution: { rating: number; count: number }[];
  recentTrend: "up" | "down" | "stable";
  helpfulCount: number;
  reviewTypeBreakdown: {
    direct: number;
    eventAttendee: number;
    eventOrganizer: number;
    gigOrganizer: number;
  };
}

export async function getDjRatingAnalytics(
  djProfileId: number,
): Promise<ActionResult<ReviewAnalyticsData>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("Unauthorized");

  // Check if user owns this DJ profile
  const djProfile = await prisma.djProfile.findUnique({
    where: { id: djProfileId },
    select: { userId: true },
  });

  if (!djProfile) {
    return actionError("DJ profile not found");
  }

  if (djProfile.userId !== user.id) {
    return actionError("You can only view analytics for your own profile");
  }

  // Fetch all ratings for this DJ
  const ratings = await prisma.djRating.findMany({
    where: { djProfileId },
    select: {
      rating: true,
      reviewType: true,
      eventId: true,
      helpfulCount: true,
      createdAt: true,
      response: true,
      respondedAt: true,
    },
  });

  // Fetch gig reviews
  const gigReviews = await prisma.djGigReview.findMany({
    where: { djProfileId },
    select: { rating: true },
  });

  // Calculate analytics
  const totalReviews = ratings.length + gigReviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          (ratings.reduce((sum, r) => sum + r.rating, 0) +
            gigReviews.reduce((sum, r) => sum + r.rating, 0)) /
          totalReviews
        ).toFixed(1)
      : "0.0";

  const directCount = ratings.filter((r) => !r.eventId).length;
  const eventCount = ratings.filter((r) => r.eventId).length;
  const gigCount = gigReviews.length;

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count:
      ratings.filter((r) => r.rating === rating).length +
      gigReviews.filter((r) => r.rating === rating).length,
  }));

  // Review type breakdown
  const reviewTypeBreakdown = {
    direct: ratings.filter((r) => r.reviewType === "DIRECT").length,
    eventAttendee: ratings.filter((r) => r.reviewType === "EVENT_ATTENDEE")
      .length,
    eventOrganizer: ratings.filter((r) => r.reviewType === "EVENT_ORGANIZER")
      .length,
    gigOrganizer: gigReviews.length,
  };

  // Total helpful votes
  const helpfulCount = ratings.reduce(
    (sum, r) => sum + ((r as any).helpfulCount || 0),
    0,
  );

  // Calculate recent trend (last 30 days vs previous 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const recentRatings = ratings.filter((r) => r.createdAt >= thirtyDaysAgo);
  const previousRatings = ratings.filter(
    (r) => r.createdAt >= sixtyDaysAgo && r.createdAt < thirtyDaysAgo,
  );

  const recentAvg =
    recentRatings.length > 0
      ? recentRatings.reduce((sum, r) => sum + r.rating, 0) /
        recentRatings.length
      : 0;
  const previousAvg =
    previousRatings.length > 0
      ? previousRatings.reduce((sum, r) => sum + r.rating, 0) /
        previousRatings.length
      : 0;

  let recentTrend: "up" | "down" | "stable" = "stable";
  if (recentAvg > previousAvg + 0.2) {
    recentTrend = "up";
  } else if (recentAvg < previousAvg - 0.2) {
    recentTrend = "down";
  }

  return actionSuccess({
    totalReviews,
    averageRating: parseFloat(averageRating),
    directCount,
    eventCount,
    gigCount,
    ratingDistribution,
    recentTrend,
    helpfulCount,
    reviewTypeBreakdown,
  });
}
