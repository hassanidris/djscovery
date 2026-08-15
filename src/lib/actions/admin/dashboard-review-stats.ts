"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";

export interface DashboardReviewStats {
  pendingModeration: number;
  suspiciousReviews: number;
  unrespondedReviews: number;
  averageRating: number;
  totalReviews: number;
  recentReviews: {
    id: number;
    rating: number;
    review: string | null;
    moderationStatus: string;
    createdAt: Date;
    djProfile: {
      id: number;
      stageName: string;
    };
    user: {
      id: string;
      name: string | null;
    };
  }[];
}

export async function getDashboardReviewStats(): Promise<DashboardReviewStats> {
  await requireAdmin();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    pendingModeration,
    suspiciousReviews,
    unrespondedReviews,
    totalReviews,
    averageRatingResult,
    recentReviews,
  ] = await Promise.all([
    prisma.djRating.count({
      where: {
        moderationStatus: "PENDING",
      },
    }),
    prisma.djRating.count({
      where: {
        moderationStatus: "FLAGGED",
      },
    }),
    prisma.djRating.count({
      where: {
        response: null,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.djRating.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.djRating.aggregate({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      _avg: { rating: true },
    }),
    prisma.djRating.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        rating: true,
        review: true,
        moderationStatus: true,
        createdAt: true,
        djProfile: {
          select: {
            id: true,
            stageName: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  return {
    pendingModeration,
    suspiciousReviews,
    unrespondedReviews,
    totalReviews,
    averageRating: averageRatingResult._avg.rating || 0,
    recentReviews,
  };
}
