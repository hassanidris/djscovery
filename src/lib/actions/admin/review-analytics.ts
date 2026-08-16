"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { cacheGet, cacheSet } from "@/lib/cache";

const REVIEW_ANALYTICS_TTL = 120;

export interface ReviewAnalyticsData {
  overview: {
    totalReviews: number;
    averageRating: number;
    totalDjsReviewed: number;
    totalReviewers: number;
    pendingModeration: number;
    flaggedReviews: number;
    hiddenReviews: number;
  };
  qualityMetrics: {
    ratingDistribution: { rating: number; count: number; percentage: number }[];
    helpfulnessStats: {
      totalHelpfulVotes: number;
      averageHelpfulPerReview: number;
      mostHelpfulReviews: number;
    };
    reviewLengthStats: {
      averageLength: number;
      withText: number;
      withoutText: number;
    };
  };
  reviewerPatterns: {
    topReviewers: {
      userId: string;
      username: string;
      reviewCount: number;
      averageRating: number;
    }[];
    reviewerFrequency: { count: string; reviewers: number }[];
    reviewTypeDistribution: {
      type: string;
      count: number;
      percentage: number;
    }[];
    recentActivity: { date: string; count: number }[];
  };
  djResponseMetrics: {
    overallResponseRate: number;
    averageResponseTime: number; // in hours
    respondedDjs: number;
    totalDjsWithReviews: number;
    responseTimeDistribution: { range: string; count: number }[];
  };
  trends: {
    reviewGrowth: { period: string; count: number }[];
    ratingTrend: { period: string; averageRating: number }[];
    moderationActions: { action: string; count: number }[];
  };
}

export async function getReviewAnalytics(
  timeRange: "7d" | "30d" | "90d" = "30d",
): Promise<ReviewAnalyticsData> {
  await requireAdmin();

  const cacheKey = `admin_review_analytics:${timeRange}`;
  const cached = await cacheGet<ReviewAnalyticsData>(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const startDate = new Date();

  switch (timeRange) {
    case "7d":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(now.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(now.getDate() - 90);
      break;
  }

  // Overview metrics
  const [
    totalReviews,
    averageRatingResult,
    totalDjsReviewed,
    totalReviewers,
    pendingModeration,
    flaggedReviews,
    hiddenReviews,
  ] = await Promise.all([
    prisma.djRating.count({ where: { createdAt: { gte: startDate } } }),
    prisma.djRating.aggregate({
      where: { createdAt: { gte: startDate } },
      _avg: { rating: true },
    }),
    prisma.djRating
      .groupBy({
        by: ["djProfileId"],
        where: { createdAt: { gte: startDate } },
      })
      .then((results) => results.length),
    prisma.djRating
      .groupBy({
        by: ["userId"],
        where: { createdAt: { gte: startDate } },
      })
      .then((results) => results.length),
    prisma.djRating.count({
      where: {
        createdAt: { gte: startDate },
        moderationStatus: "PENDING",
      },
    }),
    prisma.djRating.count({
      where: {
        createdAt: { gte: startDate },
        moderationStatus: "FLAGGED",
      },
    }),
    prisma.djRating.count({
      where: {
        createdAt: { gte: startDate },
        moderationStatus: "HIDDEN",
      },
    }),
  ]);

  const averageRating = averageRatingResult._avg.rating || 0;

  // Quality metrics
  const ratingDistributionRaw = await prisma.djRating.groupBy({
    by: ["rating"],
    where: { createdAt: { gte: startDate } },
    _count: true,
    orderBy: { rating: "desc" },
  });

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const found = ratingDistributionRaw.find((r) => r.rating === rating);
    const count = found?._count || 0;
    return {
      rating,
      count,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
    };
  });

  const helpfulnessStats = await prisma.djRating.aggregate({
    where: { createdAt: { gte: startDate } },
    _sum: { helpfulCount: true },
    _avg: { helpfulCount: true },
    _max: { helpfulCount: true },
  });

  const reviewsWithTextData = await prisma.djRating.findMany({
    where: {
      createdAt: { gte: startDate },
      AND: [{ review: { not: null } }, { review: { not: "" } }],
    },
    select: { review: true },
  });

  const totalReviewLength = reviewsWithTextData.reduce(
    (sum, r) => sum + (r.review?.length || 0),
    0,
  );
  const averageLength =
    reviewsWithTextData.length > 0
      ? totalReviewLength / reviewsWithTextData.length
      : 0;
  const reviewsWithTextCount = reviewsWithTextData.length;

  // Reviewer patterns
  const topReviewersRaw = await prisma.djRating.groupBy({
    by: ["userId"],
    where: { createdAt: { gte: startDate } },
    _count: true,
    _avg: { rating: true },
    orderBy: { _count: { userId: "desc" } },
    take: 10,
  });

  const topReviewersUserIds = topReviewersRaw.map((r) => r.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: topReviewersUserIds } },
    select: { id: true, username: true },
  });

  const topReviewers = topReviewersRaw.map((reviewer) => {
    const user = users.find((u) => u.id === reviewer.userId);
    return {
      userId: reviewer.userId,
      username: user?.username || "Unknown",
      reviewCount: reviewer._count,
      averageRating: reviewer._avg.rating || 0,
    };
  });

  const reviewerFrequencyRaw = await prisma.djRating.groupBy({
    by: ["userId"],
    where: { createdAt: { gte: startDate } },
    _count: true,
  });

  const reviewerFrequency = [1, 2, 3, 4, 5, 6].map((count) => {
    const reviewers =
      count === 6
        ? reviewerFrequencyRaw.filter((r) => r._count >= 6).length
        : reviewerFrequencyRaw.filter((r) => r._count === count).length;
    return { count: count === 6 ? "6+" : count.toString(), reviewers };
  });

  const reviewTypeDistributionRaw = await prisma.djRating.groupBy({
    by: ["reviewType"],
    where: { createdAt: { gte: startDate } },
    _count: true,
  });

  const reviewTypeDistribution = [
    "DIRECT",
    "EVENT_ATTENDEE",
    "EVENT_ORGANIZER",
    null,
  ].map((type) => {
    const found = reviewTypeDistributionRaw.find((r) => r.reviewType === type);
    const count = found?._count || 0;
    return {
      type: type || "UNKNOWN",
      count,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
    };
  });

  // Recent activity (daily)
  const recentActivityRaw = await prisma.djRating.groupBy({
    by: ["createdAt"],
    where: { createdAt: { gte: startDate } },
    _count: true,
    orderBy: { createdAt: "asc" },
  });

  const recentActivityMap = new Map<string, number>();
  recentActivityRaw.forEach((activity) => {
    const date = activity.createdAt.toISOString().split("T")[0];
    recentActivityMap.set(
      date,
      (recentActivityMap.get(date) || 0) + activity._count,
    );
  });

  const recentActivity = Array.from(recentActivityMap.entries()).map(
    ([date, count]) => ({
      date,
      count,
    }),
  );

  // DJ response metrics
  const reviewsWithDjResponseCount = await prisma.djRating.count({
    where: {
      createdAt: { gte: startDate },
      response: { not: null },
    },
  });

  const responseTimeData = await prisma.djRating.findMany({
    where: {
      createdAt: { gte: startDate },
      response: { not: null },
      respondedAt: { not: null },
    },
    select: { createdAt: true, respondedAt: true },
  });

  const responseTimes = responseTimeData.map((r) => {
    const responseTime = r.respondedAt!.getTime() - r.createdAt.getTime();
    return responseTime / (1000 * 60 * 60); // Convert to hours
  });

  const averageResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) /
        responseTimes.length
      : 0;

  const responseTimeDistribution = [
    { range: "< 1h", count: responseTimes.filter((t) => t < 1).length },
    {
      range: "1-24h",
      count: responseTimes.filter((t) => t >= 1 && t < 24).length,
    },
    {
      range: "1-7d",
      count: responseTimes.filter((t) => t >= 24 && t < 168).length,
    },
    { range: "> 7d", count: responseTimes.filter((t) => t >= 168).length },
  ];

  const respondedDjs = await prisma.djRating
    .groupBy({
      by: ["djProfileId"],
      where: {
        createdAt: { gte: startDate },
        response: { not: null },
      },
    })
    .then((results) => results.length);

  const totalDjsWithReviews = await prisma.djRating
    .groupBy({
      by: ["djProfileId"],
      where: { createdAt: { gte: startDate } },
    })
    .then((results) => results.length);

  // Trends
  const reviewGrowthRaw = await prisma.djRating.groupBy({
    by: ["createdAt"],
    where: { createdAt: { gte: startDate } },
    _count: true,
    orderBy: { createdAt: "asc" },
  });

  const reviewGrowthMap = new Map<string, number>();
  reviewGrowthRaw.forEach((growth) => {
    const date = growth.createdAt.toISOString().split("T")[0];
    reviewGrowthMap.set(date, (reviewGrowthMap.get(date) || 0) + growth._count);
  });

  const reviewGrowth = Array.from(reviewGrowthMap.entries()).map(
    ([period, count]) => ({
      period,
      count,
    }),
  );

  const ratingTrendRaw = await prisma.djRating.groupBy({
    by: ["createdAt"],
    where: { createdAt: { gte: startDate } },
    _avg: { rating: true },
    orderBy: { createdAt: "asc" },
  });

  const ratingTrendMap = new Map<string, { sum: number; count: number }>();
  ratingTrendRaw.forEach((trend) => {
    const date = trend.createdAt.toISOString().split("T")[0];
    const existing = ratingTrendMap.get(date) || { sum: 0, count: 0 };
    ratingTrendMap.set(date, {
      sum: existing.sum + (trend._avg.rating || 0),
      count: existing.count + 1,
    });
  });

  const ratingTrend = Array.from(ratingTrendMap.entries()).map(
    ([period, data]) => ({
      period,
      averageRating: data.count > 0 ? data.sum / data.count : 0,
    }),
  );

  const moderationActionsRaw = await prisma.adminActionLog.groupBy({
    by: ["action"],
    where: {
      createdAt: { gte: startDate },
      targetType: "DjRating",
    },
    _count: true,
  });

  const moderationActions = moderationActionsRaw.map((action) => ({
    action: action.action,
    count: action._count,
  }));

  const result: ReviewAnalyticsData = {
    overview: {
      totalReviews,
      averageRating,
      totalDjsReviewed,
      totalReviewers,
      pendingModeration,
      flaggedReviews,
      hiddenReviews,
    },
    qualityMetrics: {
      ratingDistribution,
      helpfulnessStats: {
        totalHelpfulVotes: helpfulnessStats._sum.helpfulCount || 0,
        averageHelpfulPerReview: helpfulnessStats._avg.helpfulCount || 0,
        mostHelpfulReviews: helpfulnessStats._max.helpfulCount || 0,
      },
      reviewLengthStats: {
        averageLength,
        withText: reviewsWithTextCount,
        withoutText: totalReviews - reviewsWithTextCount,
      },
    },
    reviewerPatterns: {
      topReviewers,
      reviewerFrequency,
      reviewTypeDistribution,
      recentActivity,
    },
    djResponseMetrics: {
      overallResponseRate:
        totalReviews > 0
          ? (reviewsWithDjResponseCount / totalReviews) * 100
          : 0,
      averageResponseTime,
      respondedDjs,
      totalDjsWithReviews,
      responseTimeDistribution,
    },
    trends: {
      reviewGrowth,
      ratingTrend,
      moderationActions,
    },
  };

  await cacheSet(cacheKey, result, REVIEW_ANALYTICS_TTL);
  return result;
}
