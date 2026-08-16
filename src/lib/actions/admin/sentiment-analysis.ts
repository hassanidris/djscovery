"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { cacheGet, cacheSet } from "@/lib/cache";

const SENTIMENT_STATS_TTL = 180;
const SENTIMENT_TRENDS_TTL = 180;

export interface SentimentAnalysisResult {
  reviewId: number;
  sentiment: "positive" | "neutral" | "negative";
  confidence: number; // 0-1
  score: number; // -1 to 1
  indicators: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  reason: string;
}

const POSITIVE_WORDS = [
  "great",
  "awesome",
  "amazing",
  "excellent",
  "fantastic",
  "wonderful",
  "outstanding",
  "brilliant",
  "perfect",
  "love",
  "loved",
  "best",
  "incredible",
  "superb",
  "magnificent",
  "exceptional",
  "phenomenal",
  "remarkable",
  "stellar",
  "terrific",
  "enjoyed",
  "enjoy",
  "happy",
  "pleased",
  "satisfied",
  "impressed",
  "recommend",
  "highly",
  "definitely",
  "certainly",
  "absolutely",
  "professional",
  "talented",
  "skilled",
  "gifted",
  "energetic",
  "engaging",
  "fun",
  "exciting",
  "memorable",
  "unforgettable",
];

const NEGATIVE_WORDS = [
  "terrible",
  "awful",
  "horrible",
  "bad",
  "poor",
  "disappointing",
  "disappointed",
  "worst",
  "hate",
  "hated",
  "dislike",
  "unprofessional",
  "rude",
  "arrogant",
  "boring",
  "dull",
  "lackluster",
  "mediocre",
  "subpar",
  "underwhelming",
  "overrated",
  "waste",
  "wasted",
  "regret",
  "sorry",
  "sad",
  "angry",
  "frustrated",
  "annoyed",
  "upset",
  "avoid",
  "never",
  "again",
  "not",
  "didn't",
  "wouldn't",
  "shouldn't",
  "couldn't",
  "fail",
  "failed",
  "problem",
  "issue",
  "trouble",
  "difficult",
  "hard",
  "tough",
];

const NEUTRAL_WORDS = [
  "okay",
  "ok",
  "fine",
  "decent",
  "average",
  "normal",
  "standard",
  "typical",
  "regular",
  "ordinary",
  "acceptable",
  "adequate",
  "satisfactory",
  "reasonable",
  "fair",
  "moderate",
  "middle",
  "medium",
  "mixed",
  "some",
  "somewhat",
  "kinda",
  "kind of",
  "sort of",
  "pretty",
  "quite",
  "rather",
  "slightly",
  "a bit",
  "little",
];

function analyzeSentiment(text: string): {
  score: number;
  indicators: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
} {
  const words = text.toLowerCase().split(/\s+/);
  const indicators = {
    positive: [] as string[],
    negative: [] as string[],
    neutral: [] as string[],
  };

  let score = 0;

  for (const word of words) {
    const cleanWord = word.replace(/[^\w]/g, "");

    if (POSITIVE_WORDS.includes(cleanWord)) {
      score += 1;
      indicators.positive.push(cleanWord);
    } else if (NEGATIVE_WORDS.includes(cleanWord)) {
      score -= 1;
      indicators.negative.push(cleanWord);
    } else if (NEUTRAL_WORDS.includes(cleanWord)) {
      indicators.neutral.push(cleanWord);
    }
  }

  // Normalize score to -1 to 1 range
  const maxScore = Math.max(words.length, 1);
  score = score / maxScore;

  return { score, indicators };
}

export async function analyzeReviewSentiment(
  reviewId: number,
): Promise<SentimentAnalysisResult> {
  await requireAdmin();

  const review = await prisma.djRating.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    return {
      reviewId,
      sentiment: "neutral",
      confidence: 0,
      score: 0,
      indicators: { positive: [], negative: [], neutral: [] },
      reason: "Review not found",
    };
  }

  if (!review.review) {
    // If no text, base sentiment on rating
    const sentiment =
      review.rating >= 4
        ? "positive"
        : review.rating <= 2
          ? "negative"
          : "neutral";
    const score = (review.rating - 3) / 2; // Convert 1-5 to -1 to 1

    return {
      reviewId,
      sentiment,
      confidence: 0.5,
      score,
      indicators: { positive: [], negative: [], neutral: [] },
      reason: `Sentiment based on rating: ${review.rating} stars`,
    };
  }

  const { score, indicators } = analyzeSentiment(review.review);

  // Determine sentiment category
  let sentiment: SentimentAnalysisResult["sentiment"] = "neutral";
  if (score > 0.2) {
    sentiment = "positive";
  } else if (score < -0.2) {
    sentiment = "negative";
  }

  // Calculate confidence based on indicator count
  const totalIndicators =
    indicators.positive.length +
    indicators.negative.length +
    indicators.neutral.length;
  const confidence = Math.min(totalIndicators / 5, 1);

  const reason =
    totalIndicators > 0
      ? `Detected ${sentiment} sentiment with ${confidence.toFixed(2)} confidence. Positive indicators: ${indicators.positive.join(", ") || "none"}. Negative indicators: ${indicators.negative.join(", ") || "none"}.`
      : `Sentiment based on rating: ${review.rating} stars`;

  return {
    reviewId,
    sentiment,
    confidence,
    score,
    indicators,
    reason,
  };
}

export async function batchAnalyzeSentiment(
  reviewIds: number[],
): Promise<SentimentAnalysisResult[]> {
  await requireAdmin();

  const results: SentimentAnalysisResult[] = [];

  for (const reviewId of reviewIds) {
    const result = await analyzeReviewSentiment(reviewId);
    results.push(result);
  }

  return results;
}

export async function getSentimentStats(timeRangeDays = 30): Promise<{
  totalReviews: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  avgScore: number;
  sentimentByRating: Record<
    number,
    { positive: number; negative: number; neutral: number }
  >;
}> {
  await requireAdmin();

  const cacheKey = `admin_sentiment_stats:${timeRangeDays}`;
  const cached = await cacheGet<{
    totalReviews: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
    avgScore: number;
    sentimentByRating: Record<
      number,
      { positive: number; negative: number; neutral: number }
    >;
  }>(cacheKey);
  if (cached) return cached;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRangeDays);

  const reviews = await prisma.djRating.findMany({
    where: { createdAt: { gte: startDate } },
    select: { id: true, rating: true },
    take: 1000,
  });

  const sentimentResults = await batchAnalyzeSentiment(
    reviews.map((r) => r.id),
  );

  const positiveCount = sentimentResults.filter(
    (r) => r.sentiment === "positive",
  ).length;
  const negativeCount = sentimentResults.filter(
    (r) => r.sentiment === "negative",
  ).length;
  const neutralCount = sentimentResults.filter(
    (r) => r.sentiment === "neutral",
  ).length;

  const totalScore = sentimentResults.reduce((sum, r) => sum + r.score, 0);
  const avgScore =
    sentimentResults.length > 0 ? totalScore / sentimentResults.length : 0;

  // Sentiment by rating
  const sentimentByRating: Record<
    number,
    { positive: number; negative: number; neutral: number }
  > = {};

  for (let i = 0; i < reviews.length; i++) {
    const rating = reviews[i].rating;
    const sentiment = sentimentResults[i].sentiment;

    if (!sentimentByRating[rating]) {
      sentimentByRating[rating] = { positive: 0, negative: 0, neutral: 0 };
    }

    sentimentByRating[rating][sentiment]++;
  }

  const result = {
    totalReviews: reviews.length,
    positiveCount,
    negativeCount,
    neutralCount,
    avgScore,
    sentimentByRating,
  };

  await cacheSet(cacheKey, result, SENTIMENT_STATS_TTL);
  return result;
}

export async function getSentimentTrends(timeRangeDays = 30): Promise<{
  daily: {
    date: string;
    positive: number;
    negative: number;
    neutral: number;
    avgScore: number;
  }[];
}> {
  await requireAdmin();

  const cacheKey = `admin_sentiment_trends:${timeRangeDays}`;
  const cached = await cacheGet<{
    daily: {
      date: string;
      positive: number;
      negative: number;
      neutral: number;
      avgScore: number;
    }[];
  }>(cacheKey);
  if (cached) return cached;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRangeDays);

  const reviews = await prisma.djRating.findMany({
    where: { createdAt: { gte: startDate } },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "asc" },
    take: 1000,
  });

  const sentimentResults = await batchAnalyzeSentiment(
    reviews.map((r) => r.id),
  );

  // Group by day
  const dailyMap = new Map<
    string,
    { positive: number; negative: number; neutral: number; scores: number[] }
  >();

  for (let i = 0; i < reviews.length; i++) {
    const date = reviews[i].createdAt.toISOString().split("T")[0];
    const sentiment = sentimentResults[i].sentiment;
    const score = sentimentResults[i].score;

    if (!dailyMap.has(date)) {
      dailyMap.set(date, { positive: 0, negative: 0, neutral: 0, scores: [] });
    }

    const dayData = dailyMap.get(date)!;
    dayData[sentiment]++;
    dayData.scores.push(score);
  }

  const daily = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    positive: data.positive,
    negative: data.negative,
    neutral: data.neutral,
    avgScore:
      data.scores.length > 0
        ? data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length
        : 0,
  }));

  const result = { daily };
  await cacheSet(cacheKey, result, SENTIMENT_TRENDS_TTL);
  return result;
}
