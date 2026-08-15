"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";

export interface ResponseTrackingData {
  overview: {
    totalReviews: number;
    respondedReviews: number;
    unrespondedReviews: number;
    responseRate: number;
    avgResponseTime: number; // in hours
  };
  unrespondedReviews: {
    id: number;
    rating: number;
    review: string | null;
    createdAt: Date;
    djProfileId: number;
    djProfile: {
      id: number;
      stageName: string;
      userId: string;
    };
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }[];
  djPerformance: {
    djProfileId: number;
    stageName: string;
    totalReviews: number;
    respondedCount: number;
    responseRate: number;
    avgResponseTime: number;
    avgRating: number;
  }[];
  responseTrends: {
    period: string;
    responseCount: number;
    avgResponseTime: number;
  }[];
}

export async function getResponseTrackingData(
  timeRange: "7d" | "30d" | "90d" = "30d",
): Promise<ResponseTrackingData> {
  await requireAdmin();

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
  const [totalReviews, respondedReviews, unrespondedReviews] =
    await Promise.all([
      prisma.djRating.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.djRating.count({
        where: {
          createdAt: { gte: startDate },
          response: { not: null },
        },
      }),
      prisma.djRating.count({
        where: {
          createdAt: { gte: startDate },
          response: null,
        },
      }),
    ]);

  const responseRate =
    totalReviews > 0 ? (respondedReviews / totalReviews) * 100 : 0;

  // Calculate average response time
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

  const avgResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) /
        responseTimes.length
      : 0;

  // Unresponded reviews with details
  const unrespondedReviewsData = await prisma.djRating.findMany({
    where: {
      createdAt: { gte: startDate },
      response: null,
    },
    include: {
      djProfile: {
        select: {
          id: true,
          stageName: true,
          userId: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // DJ performance metrics
  const djPerformanceRaw = await prisma.djRating.groupBy({
    by: ["djProfileId"],
    where: { createdAt: { gte: startDate } },
    _count: true,
    _avg: { rating: true },
  });

  const respondedCounts = await prisma.djRating.groupBy({
    by: ["djProfileId"],
    where: {
      createdAt: { gte: startDate },
      response: { not: null },
    },
    _count: true,
  });

  const djResponseTimes = await prisma.djRating.findMany({
    where: {
      createdAt: { gte: startDate },
      response: { not: null },
      respondedAt: { not: null },
    },
    select: { djProfileId: true, createdAt: true, respondedAt: true },
  });

  const djResponseTimeMap = new Map<number, number[]>();
  djResponseTimes.forEach((r) => {
    const responseTime = r.respondedAt!.getTime() - r.createdAt.getTime();
    const hours = responseTime / (1000 * 60 * 60);
    if (!djResponseTimeMap.has(r.djProfileId)) {
      djResponseTimeMap.set(r.djProfileId, []);
    }
    djResponseTimeMap.get(r.djProfileId)!.push(hours);
  });

  const djProfiles = await prisma.djProfile.findMany({
    where: {
      id: { in: djPerformanceRaw.map((d) => d.djProfileId) },
    },
    select: { id: true, stageName: true },
  });

  const djPerformance = djPerformanceRaw.map((dj) => {
    const profile = djProfiles.find((p) => p.id === dj.djProfileId);
    const responded = respondedCounts.find(
      (r) => r.djProfileId === dj.djProfileId,
    );
    const responseTimes = djResponseTimeMap.get(dj.djProfileId) || [];
    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length
        : 0;

    return {
      djProfileId: dj.djProfileId,
      stageName: profile?.stageName || "Unknown",
      totalReviews: dj._count,
      respondedCount: responded?._count || 0,
      responseRate:
        dj._count > 0 ? ((responded?._count || 0) / dj._count) * 100 : 0,
      avgResponseTime,
      avgRating: dj._avg.rating || 0,
    };
  });

  // Response trends (daily)
  const responseTrendsRaw = await prisma.djRating.groupBy({
    by: ["createdAt"],
    where: {
      createdAt: { gte: startDate },
      response: { not: null },
    },
    _count: true,
    orderBy: { createdAt: "asc" },
  });

  const responseTrendsMap = new Map<
    string,
    { count: number; totalTime: number }
  >();
  responseTrendsRaw.forEach((trend) => {
    const date = trend.createdAt.toISOString().split("T")[0];
    const existing = responseTrendsMap.get(date) || { count: 0, totalTime: 0 };
    responseTrendsMap.set(date, {
      count: existing.count + trend._count,
      totalTime: existing.totalTime,
    });
  });

  const responseTrends = Array.from(responseTrendsMap.entries()).map(
    ([period, data]) => ({
      period,
      responseCount: data.count,
      avgResponseTime: data.count > 0 ? data.totalTime / data.count : 0,
    }),
  );

  return {
    overview: {
      totalReviews,
      respondedReviews,
      unrespondedReviews,
      responseRate,
      avgResponseTime,
    },
    unrespondedReviews: unrespondedReviewsData,
    djPerformance: djPerformance.sort(
      (a, b) => b.responseRate - a.responseRate,
    ),
    responseTrends,
  };
}

export async function getUnrespondedReviews(
  limit = 20,
  offset = 0,
): Promise<ResponseTrackingData["unrespondedReviews"]> {
  await requireAdmin();

  const reviews = await prisma.djRating.findMany({
    where: {
      response: null,
    },
    include: {
      djProfile: {
        select: {
          id: true,
          stageName: true,
          userId: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
  });

  return reviews;
}

export async function getDjResponseMetrics(
  djProfileId: number,
  timeRange: "7d" | "30d" | "90d" = "30d",
): Promise<{
  totalReviews: number;
  respondedCount: number;
  responseRate: number;
  avgResponseTime: number;
  avgRating: number;
  recentResponses: {
    id: number;
    review: string | null;
    rating: number;
    response: string;
    respondedAt: Date;
    createdAt: Date;
  }[];
}> {
  await requireAdmin();

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

  const [totalReviews, respondedCount, avgRatingResult] = await Promise.all([
    prisma.djRating.count({
      where: { djProfileId, createdAt: { gte: startDate } },
    }),
    prisma.djRating.count({
      where: {
        djProfileId,
        createdAt: { gte: startDate },
        response: { not: null },
      },
    }),
    prisma.djRating.aggregate({
      where: { djProfileId, createdAt: { gte: startDate } },
      _avg: { rating: true },
    }),
  ]);

  const responseTimeData = await prisma.djRating.findMany({
    where: {
      djProfileId,
      createdAt: { gte: startDate },
      response: { not: null },
      respondedAt: { not: null },
    },
    select: { createdAt: true, respondedAt: true },
  });

  const responseTimes = responseTimeData.map((r) => {
    const responseTime = r.respondedAt!.getTime() - r.createdAt.getTime();
    return responseTime / (1000 * 60 * 60);
  });

  const avgResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) /
        responseTimes.length
      : 0;

  const recentResponses = await prisma.djRating.findMany({
    where: {
      djProfileId,
      response: { not: null },
    },
    select: {
      id: true,
      review: true,
      rating: true,
      response: true,
      respondedAt: true,
      createdAt: true,
    },
    orderBy: { respondedAt: "desc" },
    take: 10,
  });

  return {
    totalReviews,
    respondedCount,
    responseRate: totalReviews > 0 ? (respondedCount / totalReviews) * 100 : 0,
    avgResponseTime,
    avgRating: avgRatingResult._avg.rating || 0,
    recentResponses: recentResponses.map((r) => ({
      ...r,
      response: r.response!,
      respondedAt: r.respondedAt!,
    })),
  };
}
