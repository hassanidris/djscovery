import prisma from "@/lib/client";

export interface SuspiciousReview {
  reviewId: number;
  djProfileId: number;
  userId: string;
  rating: number;
  review: string | null;
  createdAt: Date;
  suspiciousFactors: {
    factors: string[];
    severity: "low" | "medium" | "high";
    score: number;
  };
}

export interface ModerationQueueItem {
  id: number;
  reviewId: number;
  djProfileId: number;
  userId: string;
  rating: number;
  review: string | null;
  createdAt: Date;
  suspiciousFactors: {
    factors: string[];
    severity: "low" | "medium" | "high";
    score: number;
  };
  priority: number;
}

// Suspicious review detection factors
const SUSPICIOUS_FACTORS = {
  // Rating patterns
  EXTREME_RATING: "extreme_rating", // 1-star with long review or 5-star with no review
  PERFECT_SCORE_SPAM: "perfect_score_spam", // Multiple 5-star reviews from same user
  RATING_OUTLIER: "rating_outlier", // Significantly different from DJ's average

  // Content patterns
  REPEAT_CONTENT: "repeat_content", // Same review text across multiple DJs
  SHORT_GENERIC: "short_generic", // Very short, generic reviews
  EXCESSIVE_CAPS: "excessive_caps", // Too many capital letters
  EXCESSIVE_PUNCTUATION: "excessive_punctuation", // Too many exclamation marks

  // Timing patterns
  RAPID_SUBMISSION: "rapid_submission", // Multiple reviews in short time window
  BURST_PATTERN: "burst_pattern", // Cluster of reviews from same user

  // User patterns
  NEW_ACCOUNT: "new_account", // Review from very new user account
  SINGLE_REVIEW_USER: "single_review_user", // User has only one review total
  LOW_ACTIVITY_USER: "low_activity_user", // User with minimal platform activity

  // DJ patterns
  LOW_RATING_DJ: "low_rating_dj", // User consistently rates low
  HIGH_RATING_DJ: "high_rating_dj", // User consistently rates high
};

// Detection thresholds
const THRESHOLDS = {
  MIN_REVIEW_LENGTH: 10,
  MAX_CAPS_RATIO: 0.5,
  MAX_PUNCTUATION_RATIO: 0.3,
  RAPID_SUBMISSION_WINDOW: 3600000, // 1 hour in ms
  NEW_ACCOUNT_DAYS: 7,
  LOW_ACTIVITY_THRESHOLD: 3,
  RATING_OUTLIER_THRESHOLD: 2.0, // Standard deviations
};

export async function detectSuspiciousReviews(
  limit = 50,
  timeRangeDays = 30,
): Promise<SuspiciousReview[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRangeDays);

  const recentReviews = await prisma.djRating.findMany({
    where: { createdAt: { gte: startDate } },
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
      djProfile: {
        select: {
          id: true,
          stageName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const suspiciousReviews: SuspiciousReview[] = [];

  for (const review of recentReviews) {
    const factors = await analyzeReviewSuspiciousFactors(review, recentReviews);

    if (factors.factors.length > 0) {
      suspiciousReviews.push({
        reviewId: review.id,
        djProfileId: review.djProfileId,
        userId: review.userId,
        rating: review.rating,
        review: review.review,
        createdAt: review.createdAt,
        suspiciousFactors: factors,
      });
    }
  }

  // Sort by severity and score
  suspiciousReviews.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    if (
      severityOrder[a.suspiciousFactors.severity] !==
      severityOrder[b.suspiciousFactors.severity]
    ) {
      return (
        severityOrder[a.suspiciousFactors.severity] -
        severityOrder[b.suspiciousFactors.severity]
      );
    }
    return b.suspiciousFactors.score - a.suspiciousFactors.score;
  });

  return suspiciousReviews.slice(0, limit);
}

async function analyzeReviewSuspiciousFactors(
  review: any,
  recentReviews: any[],
): Promise<{
  factors: string[];
  severity: "low" | "medium" | "high";
  score: number;
}> {
  const factors: string[] = [];
  let score = 0;

  // Check rating patterns
  if (review.rating === 1 && review.review && review.review.length > 200) {
    factors.push(SUSPICIOUS_FACTORS.EXTREME_RATING);
    score += 3;
  } else if (review.rating === 5 && !review.review) {
    factors.push(SUSPICIOUS_FACTORS.PERFECT_SCORE_SPAM);
    score += 2;
  }

  // Check content patterns
  if (review.review) {
    const reviewText = review.review;

    // Check for excessive caps
    const capsRatio =
      (reviewText.match(/[A-Z]/g) || []).length / reviewText.length;
    if (capsRatio > THRESHOLDS.MAX_CAPS_RATIO) {
      factors.push(SUSPICIOUS_FACTORS.EXCESSIVE_CAPS);
      score += 2;
    }

    // Check for excessive punctuation
    const punctuationRatio =
      (reviewText.match(/[!?]/g) || []).length / reviewText.length;
    if (punctuationRatio > THRESHOLDS.MAX_PUNCTUATION_RATIO) {
      factors.push(SUSPICIOUS_FACTORS.EXCESSIVE_PUNCTUATION);
      score += 1;
    }

    // Check for short generic reviews
    if (reviewText.length < THRESHOLDS.MIN_REVIEW_LENGTH) {
      factors.push(SUSPICIOUS_FACTORS.SHORT_GENERIC);
      score += 1;
    }

    // Check for repeat content
    const sameTextReviews = recentReviews.filter(
      (r) => r.review === reviewText && r.id !== review.id,
    );
    if (sameTextReviews.length > 0) {
      factors.push(SUSPICIOUS_FACTORS.REPEAT_CONTENT);
      score += 4;
    }
  }

  // Check timing patterns
  const userReviews = recentReviews.filter((r) => r.userId === review.userId);
  if (userReviews.length > 1) {
    const timeDiffs = [];
    for (let i = 1; i < userReviews.length; i++) {
      const diff =
        userReviews[i - 1].createdAt.getTime() -
        userReviews[i].createdAt.getTime();
      timeDiffs.push(diff);
    }

    const rapidSubmissions = timeDiffs.filter(
      (diff) => diff < THRESHOLDS.RAPID_SUBMISSION_WINDOW,
    );
    if (rapidSubmissions.length > 0) {
      factors.push(SUSPICIOUS_FACTORS.RAPID_SUBMISSION);
      score += 3;
    }

    if (rapidSubmissions.length >= 3) {
      factors.push(SUSPICIOUS_FACTORS.BURST_PATTERN);
      score += 2;
    }
  }

  // Check user patterns
  const user = review.user;
  const accountAge = Date.now() - new Date(user.createdAt).getTime();
  const accountAgeDays = accountAge / (1000 * 60 * 60 * 24);

  if (accountAgeDays < THRESHOLDS.NEW_ACCOUNT_DAYS) {
    factors.push(SUSPICIOUS_FACTORS.NEW_ACCOUNT);
    score += 2;
  }

  if (user._count.djRatings === 1) {
    factors.push(SUSPICIOUS_FACTORS.SINGLE_REVIEW_USER);
    score += 1;
  }

  if (user._count.djRatings < THRESHOLDS.LOW_ACTIVITY_THRESHOLD) {
    factors.push(SUSPICIOUS_FACTORS.LOW_ACTIVITY_USER);
    score += 1;
  }

  // Check rating patterns relative to DJ's average
  const djReviews = recentReviews.filter(
    (r) => r.djProfileId === review.djProfileId,
  );
  if (djReviews.length >= 5) {
    const avgRating =
      djReviews.reduce((sum, r) => sum + r.rating, 0) / djReviews.length;
    const stdDev = Math.sqrt(
      djReviews.reduce((sum, r) => sum + Math.pow(r.rating - avgRating, 2), 0) /
        djReviews.length,
    );

    if (
      Math.abs(review.rating - avgRating) >
      THRESHOLDS.RATING_OUTLIER_THRESHOLD * stdDev
    ) {
      factors.push(SUSPICIOUS_FACTORS.RATING_OUTLIER);
      score += 2;
    }
  }

  // Determine severity
  let severity: "low" | "medium" | "high" = "low";
  if (score >= 8) severity = "high";
  else if (score >= 4) severity = "medium";

  return { factors, severity, score };
}

export async function getModerationQueue(
  limit = 20,
): Promise<ModerationQueueItem[]> {
  const suspiciousReviews = await detectSuspiciousReviews(limit, 30);

  // Convert to moderation queue items with priority
  const queueItems: ModerationQueueItem[] = suspiciousReviews.map(
    (review, index) => ({
      id: index,
      reviewId: review.reviewId,
      djProfileId: review.djProfileId,
      userId: review.userId,
      rating: review.rating,
      review: review.review,
      createdAt: review.createdAt,
      suspiciousFactors: review.suspiciousFactors,
      priority: calculatePriority(review.suspiciousFactors),
    }),
  );

  // Sort by priority (higher priority first)
  queueItems.sort((a, b) => b.priority - a.priority);

  return queueItems;
}

function calculatePriority(suspiciousFactors: {
  factors: string[];
  severity: "low" | "medium" | "high";
  score: number;
}): number {
  const severityWeight = { low: 1, medium: 2, high: 3 };
  const factorWeight = suspiciousFactors.factors.length * 2;

  return (
    severityWeight[suspiciousFactors.severity] * 10 +
    suspiciousFactors.score +
    factorWeight
  );
}

export async function getModerationStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalReviews, pendingModeration, flaggedReviews, resolvedToday] =
    await Promise.all([
      prisma.djRating.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.djRating.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          moderationStatus: "PENDING",
        },
      }),
      prisma.djRating.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          moderationStatus: "FLAGGED",
        },
      }),
      prisma.adminActionLog.count({
        where: {
          createdAt: { gte: new Date(now.setHours(0, 0, 0, 0)) },
          action: {
            in: [
              "APPROVE_REVIEW",
              "HIDE_REVIEW",
              "DELETE_REVIEW",
              "FLAG_REVIEW",
            ],
          },
        },
      }),
    ]);

  const suspiciousReviews = await detectSuspiciousReviews(100, 30);

  return {
    totalReviews,
    pendingModeration,
    flaggedReviews,
    suspiciousReviews: suspiciousReviews.length,
    resolvedToday,
    avgResolutionTime: 0,
  };
}
