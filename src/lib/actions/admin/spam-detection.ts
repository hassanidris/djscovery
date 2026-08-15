"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";

export interface SpamDetectionResult {
  reviewId: number;
  isSpam: boolean;
  confidence: number; // 0-1
  spamType: "none" | "bot" | "fake" | "incentivized" | "spam";
  indicators: string[];
  reason: string;
}

export interface SpamPattern {
  id: string;
  name: string;
  pattern: RegExp | string;
  type: "bot" | "fake" | "incentivized" | "spam";
  weight: number;
}

const SPAM_PATTERNS: SpamPattern[] = [
  // Bot patterns
  {
    id: "bot_random_chars",
    name: "Random character sequences",
    pattern: /[a-z]{10,}|[0-9]{10,}/i,
    type: "bot",
    weight: 0.8,
  },
  {
    id: "bot_keyboard_smash",
    name: "Keyboard smash",
    pattern: /(asdf|qwer|zxcv|jkl;){2,}/i,
    type: "bot",
    weight: 0.7,
  },
  {
    id: "bot_repeated_chars",
    name: "Repeated characters",
    pattern: /(.)\1{5,}/,
    type: "bot",
    weight: 0.6,
  },

  // Fake review patterns
  {
    id: "fake_generic_positive",
    name: "Generic positive phrases",
    pattern:
      /(great|awesome|amazing|excellent|perfect|best|love)\s+(great|awesome|amazing|excellent|perfect|best|love)/i,
    type: "fake",
    weight: 0.5,
  },
  {
    id: "fake_template_review",
    name: "Template-like structure",
    pattern:
      /^(I|We)\s+(really|very|extremely)\s+(enjoyed|loved|liked)\s+(this|the|my)\s+(experience|service|performance)\.\s+(Would|Will)\s+(definitely|certainly)\s+(recommend|come back)/i,
    type: "fake",
    weight: 0.7,
  },
  {
    id: "fake_excessive_praise",
    name: "Excessive praise",
    pattern:
      /(best|amazing|awesome|perfect|incredible|outstanding).{0,50}(best|amazing|awesome|perfect|incredible|outstanding)/i,
    type: "fake",
    weight: 0.4,
  },

  // Incentivized review patterns
  {
    id: "incentivized_compensation",
    name: "Compensation mentions",
    pattern:
      /(paid|compensated|discount|free|voucher|coupon|refund|incentive)/i,
    type: "incentivized",
    weight: 0.9,
  },
  {
    id: "incentivized_request",
    name: "Review request language",
    pattern:
      /(asked|requested|told|instructed)\s+(to|me)\s+(leave|write|post)\s+(a|this|the)\s+(review|feedback)/i,
    type: "incentivized",
    weight: 0.8,
  },

  // General spam patterns
  {
    id: "spam_url",
    name: "URL in review",
    pattern: /(https?:\/\/|www\.|\.com|\.org|\.net)/i,
    type: "spam",
    weight: 0.6,
  },
  {
    id: "spam_email",
    name: "Email address",
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    type: "spam",
    weight: 0.7,
  },
  {
    id: "spam_phone",
    name: "Phone number",
    pattern: /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\(\d{3}\)\s*\d{3}[-.\s]?\d{4}/,
    type: "spam",
    weight: 0.5,
  },
  {
    id: "spam_all_caps",
    name: "All caps",
    pattern: /^[A-Z\s!?.,]+$/,
    type: "spam",
    weight: 0.4,
  },
  {
    id: "spam_repeated_words",
    name: "Repeated words",
    pattern: /\b(\w+)\s+\1\s+\1/i,
    type: "spam",
    weight: 0.5,
  },
];

export async function detectSpam(
  reviewId: number,
): Promise<SpamDetectionResult> {
  await requireAdmin();

  const review = await prisma.djRating.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          createdAt: true,
          _count: {
            select: { djRatings: true },
          },
        },
      },
    },
  });

  if (!review) {
    return {
      reviewId,
      isSpam: false,
      confidence: 0,
      spamType: "none",
      indicators: [],
      reason: "Review not found",
    };
  }

  const indicators: string[] = [];
  let totalScore = 0;
  let maxWeight = 0;
  let detectedType: SpamPattern["type"] | "none" = "none";

  // Analyze review text
  if (review.review) {
    for (const pattern of SPAM_PATTERNS) {
      const regex =
        pattern.pattern instanceof RegExp
          ? pattern.pattern
          : new RegExp(pattern.pattern, "i");

      if (regex.test(review.review)) {
        indicators.push(pattern.name);
        totalScore += pattern.weight;

        if (pattern.weight > maxWeight) {
          maxWeight = pattern.weight;
          detectedType = pattern.type;
        }
      }
    }
  }

  // Analyze user behavior patterns
  const userAgeDays =
    (Date.now() - review.user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (userAgeDays < 1) {
    indicators.push("Very new user account");
    totalScore += 0.3;
  }

  if (review.user._count.djRatings === 1) {
    indicators.push("First review from user");
    totalScore += 0.2;
  }

  // Analyze rating pattern
  if (review.rating === 5 && !review.review) {
    indicators.push("5-star with no text");
    totalScore += 0.3;
  }

  if (review.rating === 1 && review.review && review.review.length < 20) {
    indicators.push("1-star with very short text");
    totalScore += 0.4;
  }

  // Calculate confidence
  const confidence = Math.min(totalScore / 2, 1);

  // Determine if spam
  const isSpam = confidence > 0.5;

  // Determine spam type
  let spamType: SpamDetectionResult["spamType"] = "spam"; // Default to spam if isSpam is true
  if (isSpam && detectedType !== "none") {
    spamType = detectedType;
  }

  // Generate reason
  const reason = isSpam
    ? `Detected as ${spamType} spam with ${confidence.toFixed(2)} confidence. Indicators: ${indicators.join(", ")}`
    : "Review appears legitimate";

  return {
    reviewId,
    isSpam,
    confidence,
    spamType,
    indicators,
    reason,
  };
}

export async function batchDetectSpam(
  reviewIds: number[],
): Promise<SpamDetectionResult[]> {
  await requireAdmin();

  const results: SpamDetectionResult[] = [];

  for (const reviewId of reviewIds) {
    const result = await detectSpam(reviewId);
    results.push(result);
  }

  return results;
}

export async function getSpamStats(): Promise<{
  totalReviews: number;
  detectedSpam: number;
  spamByType: Record<string, number>;
  avgConfidence: number;
}> {
  await requireAdmin();

  const totalReviews = await prisma.djRating.count();

  // Get all reviews and analyze them
  const reviews = await prisma.djRating.findMany({
    select: { id: true },
    take: 1000, // Limit for performance
  });

  const spamResults = await batchDetectSpam(reviews.map((r) => r.id));

  const detectedSpam = spamResults.filter((r) => r.isSpam).length;
  const spamByType: Record<string, number> = {};
  let totalConfidence = 0;

  for (const result of spamResults) {
    if (result.isSpam) {
      spamByType[result.spamType] = (spamByType[result.spamType] || 0) + 1;
      totalConfidence += result.confidence;
    }
  }

  const avgConfidence = detectedSpam > 0 ? totalConfidence / detectedSpam : 0;

  return {
    totalReviews,
    detectedSpam,
    spamByType,
    avgConfidence,
  };
}

export async function markAsSpam(
  reviewId: number,
  adminNote?: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const review = await prisma.djRating.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    return { success: false, error: "Review not found" };
  }

  // Update review moderation status
  await prisma.djRating.update({
    where: { id: reviewId },
    data: {
      moderationStatus: "FLAGGED" as any,
      moderatedAt: new Date(),
      moderatorNote: adminNote || "Marked as spam by automated detection",
    },
  });

  // Log the action
  await prisma.adminActionLog.create({
    data: {
      action: "MARK_AS_SPAM",
      adminId: review.userId,
      targetId: reviewId.toString(),
      targetType: "DjRating",
      metadata: {
        adminNote,
      },
    },
  });

  return { success: true };
}

export async function markAsNotSpam(
  reviewId: number,
  adminNote?: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const review = await prisma.djRating.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    return { success: false, error: "Review not found" };
  }

  // Update review moderation status
  await prisma.djRating.update({
    where: { id: reviewId },
    data: {
      moderationStatus: "APPROVED" as any,
      moderatedAt: new Date(),
      moderatorNote: adminNote || "Marked as not spam (false positive)",
    },
  });

  // Log the action
  await prisma.adminActionLog.create({
    data: {
      action: "MARK_AS_NOT_SPAM",
      adminId: review.userId,
      targetId: reviewId.toString(),
      targetType: "DjRating",
      metadata: {
        adminNote,
      },
    },
  });

  return { success: true };
}
