"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { detectSpam } from "./spam-detection";
import { detectDuplicates } from "./duplicate-detection";
import { analyzeReviewSentiment } from "./sentiment-analysis";

export interface ModerationSuggestion {
  reviewId: number;
  suggestedAction:
    "approve" | "hide" | "flag" | "delete" | "review" | "respond";
  confidence: number; // 0-1
  priority: "low" | "medium" | "high" | "critical";
  reasons: string[];
  indicators: {
    spam?: {
      isSpam: boolean;
      spamType: string;
      confidence: number;
    };
    duplicate?: {
      isDuplicate: boolean;
      duplicateType: string;
      confidence: number;
      matchedCount: number;
    };
    sentiment?: {
      sentiment: string;
      score: number;
      confidence: number;
    };
    suspicious?: {
      factors: string[];
      severity: string;
      score: number;
    };
  };
  metadata: {
    rating: number;
    hasText: boolean;
    textLength: number;
    createdAt: Date;
    userId: string;
    djProfileId: number;
  };
}

export async function generateModerationSuggestions(
  reviewId: number,
): Promise<ModerationSuggestion> {
  await requireAdmin();

  const review = await prisma.djRating.findUnique({
    where: { id: reviewId },
    select: {
      id: true,
      rating: true,
      review: true,
      createdAt: true,
      userId: true,
      djProfileId: true,
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  // Run all analyses
  const [spamResult, duplicateResult, sentimentResult] = await Promise.all([
    detectSpam(reviewId),
    detectDuplicates(reviewId),
    analyzeReviewSentiment(reviewId),
  ]);

  // Get suspicious factors from existing moderation system
  const { detectSuspiciousReviews } = await import("./review-moderation");
  const suspiciousReviews = await detectSuspiciousReviews(100, 30);
  const suspiciousReview = suspiciousReviews.find(
    (r) => r.reviewId === reviewId,
  );

  const reasons: string[] = [];
  let confidence = 0;
  let suggestedAction: ModerationSuggestion["suggestedAction"] = "review";
  let priority: ModerationSuggestion["priority"] = "low";

  // Analyze spam
  if (spamResult.isSpam) {
    reasons.push(`Detected as ${spamResult.spamType} spam`);
    confidence += spamResult.confidence * 0.4;
    suggestedAction = spamResult.confidence > 0.8 ? "delete" : "flag";
    priority = spamResult.confidence > 0.8 ? "critical" : "high";
  }

  // Analyze duplicates
  if (duplicateResult.isDuplicate) {
    reasons.push(
      `Duplicate review detected (${duplicateResult.duplicateType}, ${duplicateResult.matchedReviews.length} matches)`,
    );
    confidence += duplicateResult.confidence * 0.3;
    if (duplicateResult.confidence > 0.95) {
      suggestedAction = "delete";
      priority = "high";
    } else if (suggestedAction !== "delete") {
      suggestedAction = "flag";
    }
  }

  // Analyze sentiment
  if (
    sentimentResult.sentiment === "negative" &&
    sentimentResult.confidence > 0.7
  ) {
    reasons.push("Strong negative sentiment detected");
    confidence += sentimentResult.confidence * 0.1;
    if (suggestedAction === "review") {
      suggestedAction = "review"; // Keep as review, but flag for attention
      priority = "medium";
    }
  }

  // Analyze suspicious factors
  if (
    suspiciousReview &&
    suspiciousReview.suspiciousFactors.factors.length > 0
  ) {
    reasons.push(
      `Suspicious factors: ${suspiciousReview.suspiciousFactors.factors.join(", ")}`,
    );
    confidence += (suspiciousReview.suspiciousFactors.score / 10) * 0.2;
    if (suspiciousReview.suspiciousFactors.severity === "high") {
      priority = "high";
      if (suggestedAction === "review") {
        suggestedAction = "flag";
      }
    }
  }

  // Adjust confidence
  confidence = Math.min(confidence, 1);

  // Default action if no issues detected
  if (reasons.length === 0) {
    suggestedAction = "approve";
    confidence = 0.9;
    reasons.push("No issues detected, safe to approve");
  }

  // Check if response is needed
  if (!review.review && review.rating >= 4 && suggestedAction === "approve") {
    suggestedAction = "respond";
    reasons.push(
      "High rating without text, consider requesting detailed feedback",
    );
  }

  return {
    reviewId,
    suggestedAction,
    confidence,
    priority,
    reasons,
    indicators: {
      spam: spamResult.isSpam
        ? {
            isSpam: spamResult.isSpam,
            spamType: spamResult.spamType,
            confidence: spamResult.confidence,
          }
        : undefined,
      duplicate: duplicateResult.isDuplicate
        ? {
            isDuplicate: duplicateResult.isDuplicate,
            duplicateType: duplicateResult.duplicateType,
            confidence: duplicateResult.confidence,
            matchedCount: duplicateResult.matchedReviews.length,
          }
        : undefined,
      sentiment: {
        sentiment: sentimentResult.sentiment,
        score: sentimentResult.score,
        confidence: sentimentResult.confidence,
      },
      suspicious: suspiciousReview
        ? {
            factors: suspiciousReview.suspiciousFactors.factors,
            severity: suspiciousReview.suspiciousFactors.severity,
            score: suspiciousReview.suspiciousFactors.score,
          }
        : undefined,
    },
    metadata: {
      rating: review.rating,
      hasText: !!review.review,
      textLength: review.review?.length || 0,
      createdAt: review.createdAt,
      userId: review.userId,
      djProfileId: review.djProfileId,
    },
  };
}

export async function batchGenerateSuggestions(
  reviewIds: number[],
): Promise<ModerationSuggestion[]> {
  await requireAdmin();

  const suggestions: ModerationSuggestion[] = [];

  for (const reviewId of reviewIds) {
    const suggestion = await generateModerationSuggestions(reviewId);
    suggestions.push(suggestion);
  }

  // Sort by priority and confidence
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  suggestions.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.confidence - a.confidence;
  });

  return suggestions;
}

export async function getModerationQueueWithSuggestions(
  limit = 50,
  timeRangeDays = 30,
): Promise<{
  suggestions: ModerationSuggestion[];
  stats: {
    total: number;
    byAction: Record<string, number>;
    byPriority: Record<string, number>;
    avgConfidence: number;
  };
}> {
  await requireAdmin();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRangeDays);

  const reviews = await prisma.djRating.findMany({
    where: {
      createdAt: { gte: startDate },
      moderationStatus: "PENDING",
    },
    select: { id: true },
    take: limit,
  });

  const suggestions = await batchGenerateSuggestions(reviews.map((r) => r.id));

  const byAction: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  let totalConfidence = 0;

  for (const suggestion of suggestions) {
    byAction[suggestion.suggestedAction] =
      (byAction[suggestion.suggestedAction] || 0) + 1;
    byPriority[suggestion.priority] =
      (byPriority[suggestion.priority] || 0) + 1;
    totalConfidence += suggestion.confidence;
  }

  const avgConfidence =
    suggestions.length > 0 ? totalConfidence / suggestions.length : 0;

  return {
    suggestions,
    stats: {
      total: suggestions.length,
      byAction,
      byPriority,
      avgConfidence,
    },
  };
}

export async function applySuggestion(
  reviewId: number,
  action: ModerationSuggestion["suggestedAction"],
  adminNote?: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const review = await prisma.djRating.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    return { success: false, error: "Review not found" };
  }

  // Import moderation actions
  const { approveReview, hideReview, flagReview, deleteReview } =
    await import("../admin-review-management");

  try {
    switch (action) {
      case "approve":
        const approveFormData = new FormData();
        approveFormData.set("ratingId", reviewId.toString());
        if (adminNote) approveFormData.set("adminNote", adminNote);
        await approveReview(approveFormData);
        break;
      case "hide":
        const hideFormData = new FormData();
        hideFormData.set("ratingId", reviewId.toString());
        if (adminNote) hideFormData.set("adminNote", adminNote);
        await hideReview(hideFormData);
        break;
      case "flag":
        const flagFormData = new FormData();
        flagFormData.set("ratingId", reviewId.toString());
        if (adminNote) flagFormData.set("adminNote", adminNote);
        await flagReview(flagFormData);
        break;
      case "delete":
        const deleteFormData = new FormData();
        deleteFormData.set("ratingId", reviewId.toString());
        if (adminNote) deleteFormData.set("adminNote", adminNote);
        await deleteReview(deleteFormData);
        break;
      case "respond":
        // Send notification to DJ to respond
        await prisma.notification.create({
          data: {
            type: "RESPONSE_REQUESTED" as any,
            recipientId: review.djProfileId.toString(),
            data: {
              ratingId: reviewId,
              message: adminNote || "Please respond to this review",
            },
          },
        });
        break;
      case "review":
        // Just log for manual review
        await prisma.adminActionLog.create({
          data: {
            action: "MANUAL_REVIEW_REQUESTED",
            adminId: review.userId,
            targetId: reviewId.toString(),
            targetType: "DjRating",
            metadata: {
              adminNote,
            },
          },
        });
        break;
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to apply suggestion:", error);
    return { success: false, error: "Failed to apply suggestion" };
  }
}
