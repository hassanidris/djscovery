"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";

export interface DuplicateDetectionResult {
  reviewId: number;
  isDuplicate: boolean;
  confidence: number; // 0-1
  duplicateType: "none" | "exact" | "near" | "similar" | "pattern";
  matchedReviews: {
    id: number;
    similarity: number;
    review: string | null;
    rating: number;
    djProfileId: number;
    createdAt: Date;
  }[];
  reason: string;
}

export interface DuplicatePattern {
  id: string;
  name: string;
  description: string;
  threshold: number; // Similarity threshold 0-1
}

const DUPLICATE_PATTERNS: DuplicatePattern[] = [
  {
    id: "exact_match",
    name: "Exact Text Match",
    description: "Identical review text",
    threshold: 1.0,
  },
  {
    id: "near_exact",
    name: "Near-Exact Match",
    description: "Text with minor differences (typos, punctuation)",
    threshold: 0.95,
  },
  {
    id: "high_similarity",
    name: "High Similarity",
    description: "Very similar structure and content",
    threshold: 0.85,
  },
  {
    id: "moderate_similarity",
    name: "Moderate Similarity",
    description: "Similar themes with different wording",
    threshold: 0.7,
  },
];

// Levenshtein distance for string similarity
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] =
          1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

// Calculate similarity between two strings (0-1)
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;

  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(
    str1.toLowerCase(),
    str2.toLowerCase(),
  );
  return 1 - distance / maxLen;
}

// Jaccard similarity for word overlap
function jaccardSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

// Normalize text for comparison
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function detectDuplicates(
  reviewId: number,
  timeRangeDays = 30,
): Promise<DuplicateDetectionResult> {
  await requireAdmin();

  const review = await prisma.djRating.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    return {
      reviewId,
      isDuplicate: false,
      confidence: 0,
      duplicateType: "none",
      matchedReviews: [],
      reason: "Review not found",
    };
  }

  if (!review.review) {
    return {
      reviewId,
      isDuplicate: false,
      confidence: 0,
      duplicateType: "none",
      matchedReviews: [],
      reason: "Review has no text to compare",
    };
  }

  // Get recent reviews from the same user
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRangeDays);

  const userReviews = await prisma.djRating.findMany({
    where: {
      userId: review.userId,
      id: { not: reviewId },
      createdAt: { gte: startDate },
      review: { not: null },
    },
    select: {
      id: true,
      review: true,
      rating: true,
      djProfileId: true,
      createdAt: true,
    },
  });

  // Get reviews with similar text from all users
  const allRecentReviews = await prisma.djRating.findMany({
    where: {
      id: { not: reviewId },
      createdAt: { gte: startDate },
      review: { not: null },
    },
    select: {
      id: true,
      review: true,
      rating: true,
      djProfileId: true,
      userId: true,
      createdAt: true,
    },
    take: 500,
  });

  const matchedReviews: DuplicateDetectionResult["matchedReviews"] = [];
  let maxSimilarity = 0;
  let duplicateType: DuplicateDetectionResult["duplicateType"] = "none";

  // Check against user's own reviews
  for (const userReview of userReviews) {
    if (!userReview.review) continue;

    const similarity = calculateSimilarity(review.review, userReview.review);
    const jaccard = jaccardSimilarity(review.review, userReview.review);
    const combinedSimilarity = (similarity + jaccard) / 2;

    if (combinedSimilarity > 0.7) {
      matchedReviews.push({
        id: userReview.id,
        similarity: combinedSimilarity,
        review: userReview.review,
        rating: userReview.rating,
        djProfileId: userReview.djProfileId,
        createdAt: userReview.createdAt,
      });

      if (combinedSimilarity > maxSimilarity) {
        maxSimilarity = combinedSimilarity;
      }
    }
  }

  // Check against all reviews for cross-user patterns
  for (const otherReview of allRecentReviews) {
    if (!otherReview.review || otherReview.userId === review.userId) continue;

    const similarity = calculateSimilarity(review.review, otherReview.review);
    const jaccard = jaccardSimilarity(review.review, otherReview.review);
    const combinedSimilarity = (similarity + jaccard) / 2;

    if (combinedSimilarity > 0.85) {
      matchedReviews.push({
        id: otherReview.id,
        similarity: combinedSimilarity,
        review: otherReview.review,
        rating: otherReview.rating,
        djProfileId: otherReview.djProfileId,
        createdAt: otherReview.createdAt,
      });

      if (combinedSimilarity > maxSimilarity) {
        maxSimilarity = combinedSimilarity;
      }
    }
  }

  // Sort by similarity
  matchedReviews.sort((a, b) => b.similarity - a.similarity);

  // Determine duplicate type
  if (maxSimilarity >= 1.0) {
    duplicateType = "exact";
  } else if (maxSimilarity >= 0.95) {
    duplicateType = "near";
  } else if (maxSimilarity >= 0.85) {
    duplicateType = "similar";
  } else if (maxSimilarity >= 0.7) {
    duplicateType = "pattern";
  }

  const isDuplicate = maxSimilarity > 0.7;
  const confidence = maxSimilarity;

  const reason = isDuplicate
    ? `Detected as ${duplicateType} duplicate with ${confidence.toFixed(2)} confidence. Found ${matchedReviews.length} similar reviews.`
    : "No significant duplicates found";

  return {
    reviewId,
    isDuplicate,
    confidence,
    duplicateType,
    matchedReviews,
    reason,
  };
}

export async function batchDetectDuplicates(
  reviewIds: number[],
  timeRangeDays = 30,
): Promise<DuplicateDetectionResult[]> {
  await requireAdmin();

  const results: DuplicateDetectionResult[] = [];

  for (const reviewId of reviewIds) {
    const result = await detectDuplicates(reviewId, timeRangeDays);
    results.push(result);
  }

  return results;
}

export async function getDuplicateStats(): Promise<{
  totalReviews: number;
  detectedDuplicates: number;
  duplicatesByType: Record<string, number>;
  avgSimilarity: number;
}> {
  await requireAdmin();

  const totalReviews = await prisma.djRating.count();

  // Get recent reviews and analyze them
  const reviews = await prisma.djRating.findMany({
    where: {
      review: { not: null },
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    select: { id: true },
    take: 500,
  });

  const duplicateResults = await batchDetectDuplicates(reviews.map((r) => r.id));

  const detectedDuplicates = duplicateResults.filter((r) => r.isDuplicate).length;
  const duplicatesByType: Record<string, number> = {};
  let totalSimilarity = 0;

  for (const result of duplicateResults) {
    if (result.isDuplicate) {
      duplicatesByType[result.duplicateType] =
        (duplicatesByType[result.duplicateType] || 0) + 1;
      totalSimilarity += result.confidence;
    }
  }

  const avgSimilarity =
    detectedDuplicates > 0 ? totalSimilarity / detectedDuplicates : 0;

  return {
    totalReviews,
    detectedDuplicates,
    duplicatesByType,
    avgSimilarity,
  };
}

export async function getDuplicateClusters(
  minSimilarity = 0.85,
  timeRangeDays = 30,
): Promise<{
  clusters: {
    id: string;
    reviews: {
      id: number;
      review: string | null;
      rating: number;
      djProfileId: number;
      userId: string;
      createdAt: Date;
    }[];
    avgSimilarity: number;
  }[];
}> {
  await requireAdmin();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRangeDays);

  const reviews = await prisma.djRating.findMany({
    where: {
      review: { not: null },
      createdAt: { gte: startDate },
    },
    select: {
      id: true,
      review: true,
      rating: true,
      djProfileId: true,
      userId: true,
      createdAt: true,
    },
    take: 500,
  });

  const clusters: any[] = [];
  const processedIds = new Set<number>();

  for (const review of reviews) {
    if (processedIds.has(review.id)) continue;

    const cluster = {
      id: `cluster-${review.id}`,
      reviews: [review],
      avgSimilarity: 1.0,
    };

    for (const otherReview of reviews) {
      if (otherReview.id === review.id || processedIds.has(otherReview.id))
        continue;

      if (!review.review || !otherReview.review) continue;

      const similarity = calculateSimilarity(review.review, otherReview.review);
      const jaccard = jaccardSimilarity(review.review, otherReview.review);
      const combinedSimilarity = (similarity + jaccard) / 2;

      if (combinedSimilarity >= minSimilarity) {
        cluster.reviews.push(otherReview);
        processedIds.add(otherReview.id);
      }
    }

    if (cluster.reviews.length > 1) {
      clusters.push(cluster);
      processedIds.add(review.id);
    }
  }

  return { clusters };
}