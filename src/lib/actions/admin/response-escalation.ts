"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";

export interface EscalationRule {
  id: string;
  name: string;
  priority: "low" | "medium" | "high" | "critical";
  conditions: {
    ratingThreshold?: number; // Reviews below this rating
    hoursWithoutResponse: number; // Hours since review without response
    ratingCountThreshold?: number; // DJ has this many unresponded reviews
  };
  actions: EscalationAction[];
  enabled: boolean;
}

export interface EscalationAction {
  type: "notify_admin" | "notify_dj" | "flag_review" | "create_ticket" | "email_alert";
  recipients?: string[]; // For email alerts
  message?: string;
}

export const DEFAULT_ESCALATION_RULES: EscalationRule[] = [
  {
    id: "critical_1star_24h",
    name: "Critical - 1 Star Reviews (24h)",
    priority: "critical",
    conditions: {
      ratingThreshold: 2,
      hoursWithoutResponse: 24,
    },
    actions: [
      { type: "notify_admin", message: "Critical 1-star review unresponded for 24+ hours" },
      { type: "flag_review" },
      { type: "email_alert" },
    ],
    enabled: true,
  },
  {
    id: "high_2star_48h",
    name: "High - 2 Star Reviews (48h)",
    priority: "high",
    conditions: {
      ratingThreshold: 3,
      hoursWithoutResponse: 48,
    },
    actions: [
      { type: "notify_admin", message: "2-star review unresponded for 48+ hours" },
      { type: "notify_dj", message: "You have an unresponded review that requires attention" },
    ],
    enabled: true,
  },
  {
    id: "medium_multiple_unresponded",
    name: "Medium - Multiple Unresponded Reviews",
    priority: "medium",
    conditions: {
      ratingCountThreshold: 5,
      hoursWithoutResponse: 72,
    },
    actions: [
      { type: "notify_admin", message: "DJ has 5+ unresponded reviews" },
      { type: "notify_dj", message: "You have multiple unresponded reviews requiring attention" },
    ],
    enabled: true,
  },
  {
    id: "low_7days",
    name: "Low - Any Review (7 days)",
    priority: "low",
    conditions: {
      hoursWithoutResponse: 168,
    },
    actions: [
      { type: "notify_dj", message: "Reminder: You have reviews awaiting your response" },
    ],
    enabled: true,
  },
];

export interface EscalatedReview {
  id: number;
  rating: number;
  review: string | null;
  createdAt: Date;
  hoursWithoutResponse: number;
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
  ruleMatched: EscalationRule;
  escalationStatus: "pending" | "notified" | "escalated" | "resolved";
  escalatedAt?: Date;
}

export async function getEscalatedReviews(
  rules: EscalationRule[] = DEFAULT_ESCALATION_RULES,
): Promise<EscalatedReview[]> {
  await requireAdmin();

  const enabledRules = rules.filter((r) => r.enabled);
  if (enabledRules.length === 0) return [];

  const now = new Date();
  const escalatedReviews: EscalatedReview[] = [];

  for (const rule of enabledRules) {
    const thresholdDate = new Date(
      now.getTime() - rule.conditions.hoursWithoutResponse * 60 * 60 * 1000,
    );

    const where: any = {
      response: null,
      createdAt: { lte: thresholdDate },
    };

    if (rule.conditions.ratingThreshold) {
      where.rating = { lt: rule.conditions.ratingThreshold };
    }

    if (rule.conditions.ratingCountThreshold) {
      // Get DJs with many unresponded reviews
      const djsWithManyReviews = await prisma.djRating.groupBy({
        by: ["djProfileId"],
        where: { response: null },
        having: {
          id: {
            _count: { gt: rule.conditions.ratingCountThreshold },
          },
        },
      });

      where.djProfileId = { in: djsWithManyReviews.map((d) => d.djProfileId) };
    }

    const reviews = await prisma.djRating.findMany({
      where,
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
      orderBy: { createdAt: "asc" },
    });

    for (const review of reviews) {
      const hoursWithoutResponse =
        (now.getTime() - review.createdAt.getTime()) / (1000 * 60 * 60);

      // Check if already escalated
      const existingEscalation = await prisma.adminActionLog.findFirst({
        where: {
          action: "ESCALATE_REVIEW",
          targetId: review.id.toString(),
          targetType: "DjRating",
        },
        orderBy: { createdAt: "desc" },
      });

      const escalationStatus = existingEscalation
        ? "escalated"
        : "pending";
      const escalatedAt = existingEscalation?.createdAt;

      // Check if this review already matches a higher priority rule
      const alreadyMatched = escalatedReviews.some(
        (r) =>
          r.id === review.id &&
          r.ruleMatched.priority === "critical" &&
          rule.priority !== "critical",
      );

      if (!alreadyMatched) {
        escalatedReviews.push({
          ...review,
          hoursWithoutResponse,
          ruleMatched: rule,
          escalationStatus,
          escalatedAt,
        });
      }
    }
  }

  // Sort by priority and hours without response
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return escalatedReviews.sort((a, b) => {
    const priorityDiff =
      priorityOrder[a.ruleMatched.priority] - priorityOrder[b.ruleMatched.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.hoursWithoutResponse - a.hoursWithoutResponse;
  });
}

export async function escalateReview(
  reviewId: number,
  ruleId: string,
  notes?: string,
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

  const rule = DEFAULT_ESCALATION_RULES.find((r) => r.id === ruleId);
  if (!rule) {
    return { success: false, error: "Escalation rule not found" };
  }

  // Execute escalation actions
  for (const action of rule.actions) {
    try {
      switch (action.type) {
        case "notify_admin":
          await prisma.notification.create({
            data: {
              type: "REVIEW_ESCALATION" as any,
              recipientId: review.djProfile.userId,
              data: {
                ratingId: review.id,
                djProfileId: review.djProfileId,
                rating: review.rating,
                ruleId,
                priority: rule.priority,
                message: action.message,
              },
            },
          });
          break;

        case "notify_dj":
          await prisma.notification.create({
            data: {
              type: "RESPONSE_REQUIRED" as any,
              recipientId: review.djProfile.userId,
              data: {
                ratingId: review.id,
                djProfileId: review.djProfileId,
                rating: review.rating,
                message: action.message,
              },
            },
          });
          break;

        case "flag_review":
          await prisma.djRating.update({
            where: { id: reviewId },
            data: {
              moderationStatus: "FLAGGED" as any,
              moderatedAt: new Date(),
              moderatorNote: `Escalated via rule: ${rule.name}`,
            },
          });
          break;

        case "email_alert":
          // In production, this would send an actual email
          console.log(`Email alert sent for review ${reviewId}: ${action.message}`);
          break;

        case "create_ticket":
          // In production, this would create a support ticket
          console.log(`Support ticket created for review ${reviewId}`);
          break;
      }
    } catch (error) {
      console.error(`Failed to execute action ${action.type}:`, error);
    }
  }

  // Log the escalation
  await prisma.adminActionLog.create({
    data: {
      action: "ESCALATE_REVIEW",
      adminId: review.djProfile.userId,
      targetId: review.id.toString(),
      targetType: "DjRating",
      metadata: {
        ruleId,
        ruleName: rule.name,
        priority: rule.priority,
        notes,
      },
    },
  });

  return { success: true };
}

export async function resolveEscalation(
  reviewId: number,
  resolutionNotes?: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const review = await prisma.djRating.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    return { success: false, error: "Review not found" };
  }

  // Log the resolution
  await prisma.adminActionLog.create({
    data: {
      action: "RESOLVE_ESCALATION",
      adminId: review.userId,
      targetId: review.id.toString(),
      targetType: "DjRating",
      metadata: {
        resolutionNotes,
      },
    },
  });

  return { success: true };
}

export async function getEscalationStats(): Promise<{
  totalEscalated: number;
  criticalEscalations: number;
  highEscalations: number;
  mediumEscalations: number;
  lowEscalations: number;
  resolvedToday: number;
}> {
  await requireAdmin();

  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));

  const [totalEscalated, resolvedToday] = await Promise.all([
    prisma.adminActionLog.count({
      where: { action: "ESCALATE_REVIEW" },
    }),
    prisma.adminActionLog.count({
      where: {
        action: "RESOLVE_ESCALATION",
        createdAt: { gte: todayStart },
      },
    }),
  ]);

  const escalations = await prisma.adminActionLog.findMany({
    where: { action: "ESCALATE_REVIEW" },
    select: { metadata: true },
  });

  const criticalEscalations = escalations.filter(
    (e) => (e.metadata as any)?.priority === "critical",
  ).length;
  const highEscalations = escalations.filter(
    (e) => (e.metadata as any)?.priority === "high",
  ).length;
  const mediumEscalations = escalations.filter(
    (e) => (e.metadata as any)?.priority === "medium",
  ).length;
  const lowEscalations = escalations.filter(
    (e) => (e.metadata as any)?.priority === "low",
  ).length;

  return {
    totalEscalated,
    criticalEscalations,
    highEscalations,
    mediumEscalations,
    lowEscalations,
    resolvedToday,
  };
}