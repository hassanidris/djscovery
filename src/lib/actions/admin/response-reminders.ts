"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";

export interface ReminderRule {
  id: string;
  name: string;
  hoursThreshold: number;
  ratingThreshold?: number; // Only remind for reviews below this rating
  enabled: boolean;
}

const DEFAULT_REMINDER_RULES: ReminderRule[] = [
  {
    id: "urgent_24h",
    name: "Urgent - 24 hours",
    hoursThreshold: 24,
    ratingThreshold: 3,
    enabled: true,
  },
  {
    id: "standard_72h",
    name: "Standard - 72 hours",
    hoursThreshold: 72,
    ratingThreshold: 4,
    enabled: true,
  },
  {
    id: "low_priority_7d",
    name: "Low Priority - 7 days",
    hoursThreshold: 168,
    ratingThreshold: 5,
    enabled: true,
  },
];

export interface ReviewNeedingReminder {
  id: number;
  rating: number;
  review: string | null;
  createdAt: Date;
  hoursSinceReview: number;
  djProfileId: number;
  djProfile: {
    id: number;
    stageName: string;
    userId: string;
    user: {
      id: string;
      email: string;
      name: string | null;
    };
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  ruleMatched: ReminderRule;
}

export async function getReviewsNeedingReminder(
  rules: ReminderRule[] = DEFAULT_REMINDER_RULES,
): Promise<ReviewNeedingReminder[]> {
  await requireAdmin();

  const enabledRules = rules.filter((r) => r.enabled);
  if (enabledRules.length === 0) return [];

  const now = new Date();
  const reviewsNeedingReminder: ReviewNeedingReminder[] = [];

  for (const rule of enabledRules) {
    const thresholdDate = new Date(
      now.getTime() - rule.hoursThreshold * 60 * 60 * 1000,
    );

    const reviews = await prisma.djRating.findMany({
      where: {
        response: null,
        createdAt: { lte: thresholdDate },
        ...(rule.ratingThreshold && { rating: { lt: rule.ratingThreshold } }),
      },
      include: {
        djProfile: {
          select: {
            id: true,
            stageName: true,
            userId: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
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
      orderBy: { createdAt: "asc" },
    });

    for (const review of reviews) {
      const hoursSinceReview =
        (now.getTime() - review.createdAt.getTime()) / (1000 * 60 * 60);

      // Check if this review already matches a higher priority rule
      const alreadyMatched = reviewsNeedingReminder.some(
        (r) =>
          r.id === review.id &&
          r.ruleMatched.hoursThreshold < rule.hoursThreshold,
      );

      if (!alreadyMatched) {
        reviewsNeedingReminder.push({
          ...review,
          hoursSinceReview,
          ruleMatched: rule,
        });
      }
    }
  }

  // Sort by hours since review (oldest first)
  return reviewsNeedingReminder.sort(
    (a, b) => b.hoursSinceReview - a.hoursSinceReview,
  );
}

export async function sendReminderNotification(
  reviewId: number,
  customMessage?: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const review = await prisma.djRating.findUnique({
    where: { id: reviewId },
    include: {
      djProfile: {
        select: {
          id: true,
          stageName: true,
          userId: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!review) {
    return { success: false, error: "Review not found" };
  }

  if (review.response) {
    return { success: false, error: "Review already has a response" };
  }

  // Create notification for the DJ
  try {
    await prisma.notification.create({
      data: {
        type: "REVIEW_RESPONSE_REMINDER" as any,
        recipientId: review.djProfile.userId,
        data: {
          ratingId: review.id,
          djProfileId: review.djProfileId,
          rating: review.rating,
          review: review.review,
          customMessage:
            customMessage || "You have a review that needs your response.",
        },
      },
    });

    // Log the reminder action
    await prisma.adminActionLog.create({
      data: {
        action: "SEND_RESPONSE_REMINDER",
        adminId: review.djProfile.userId, // Will be overridden by requireAdmin
        targetId: review.id.toString(),
        targetType: "DjRating",
        metadata: {
          djProfileId: review.djProfileId,
          djName: review.djProfile.stageName,
          customMessage,
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send reminder notification:", error);
    return { success: false, error: "Failed to send reminder" };
  }
}

export async function sendBulkReminders(
  reviewIds: number[],
  customMessage?: string,
): Promise<{ success: number; failed: number; errors: string[] }> {
  await requireAdmin();

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const reviewId of reviewIds) {
    const result = await sendReminderNotification(reviewId, customMessage);
    if (result.success) {
      success++;
    } else {
      failed++;
      errors.push(`Review ${reviewId}: ${result.error}`);
    }
  }

  return { success, failed, errors };
}

export async function getReminderStats(): Promise<{
  totalUnresponded: number;
  needingUrgentReminder: number;
  needingStandardReminder: number;
  needingLowPriorityReminder: number;
  avgTimeUnresponded: number;
}> {
  await requireAdmin();

  const now = new Date();
  const urgentThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const standardThreshold = new Date(now.getTime() - 72 * 60 * 60 * 1000);
  const lowPriorityThreshold = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  );

  const [totalUnresponded, urgentReviews, standardReviews, lowPriorityReviews] =
    await Promise.all([
      prisma.djRating.count({ where: { response: null } }),
      prisma.djRating.count({
        where: {
          response: null,
          createdAt: { lte: urgentThreshold },
          rating: { lt: 3 },
        },
      }),
      prisma.djRating.count({
        where: {
          response: null,
          createdAt: { lte: standardThreshold },
          rating: { lt: 4 },
        },
      }),
      prisma.djRating.count({
        where: {
          response: null,
          createdAt: { lte: lowPriorityThreshold },
        },
      }),
    ]);

  // Calculate average time unresponded
  const unrespondedReviews = await prisma.djRating.findMany({
    where: { response: null },
    select: { createdAt: true },
  });

  const avgTimeUnresponded =
    unrespondedReviews.length > 0
      ? unrespondedReviews.reduce((sum, r) => {
          const hours =
            (now.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60);
          return sum + hours;
        }, 0) / unrespondedReviews.length
      : 0;

  return {
    totalUnresponded,
    needingUrgentReminder: urgentReviews,
    needingStandardReminder: standardReviews,
    needingLowPriorityReminder: lowPriorityReviews,
    avgTimeUnresponded,
  };
}
