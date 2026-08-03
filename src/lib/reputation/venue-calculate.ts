import prisma from "@/lib/client";
import { PrismaClient } from "@prisma/client";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$use" | "$extends"
>;

const WEIGHTS = {
  profileQuality: 150,
  verification: 50,
  review: 550,
  reliability: 150,
  activity: 100,
};

function bayesianAverage(ratings: number[], priorCount: number, priorMean = 3) {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((a, b) => a + b, 0);
  return (sum + priorCount * priorMean) / (ratings.length + priorCount);
}

export async function calculateVenueReputationScore(
  venueId: number,
  client: PrismaClient | PrismaTransactionClient = prisma,
) {
  const venue = await client.venue.findUnique({
    where: { id: venueId },
    select: {
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      popularity: true,
      source: true,
      venueReviews: {
        select: {
          soundSystem: true,
          atmosphere: true,
          location: true,
          accessibility: true,
          rating: true,
          createdAt: true,
        },
      },
    },
  });

  if (!venue) throw new Error("Venue not found");

  // 1. Profile Quality (0-150) - based on venue data completeness
  const completionFields = [
    { weight: 30, check: () => !!venue.name?.trim() },
    { weight: 25, check: () => !!venue.address?.trim() },
    { weight: 20, check: () => !!venue.latitude && !!venue.longitude },
    { weight: 15, check: () => venue.popularity > 0 },
    { weight: 10, check: () => !!venue.source },
  ];
  const totalCompletionWeight = completionFields.reduce(
    (sum, f) => sum + f.weight,
    0,
  );
  const completedWeight = completionFields.reduce(
    (sum, f) => sum + (f.check() ? f.weight : 0),
    0,
  );
  const completionPercentage = Math.round(
    (completedWeight / totalCompletionWeight) * 100,
  );
  const profileQualityScore = Math.round(
    (completionPercentage / 100) * WEIGHTS.profileQuality,
  );

  // 2. Verification (0-50) - based on data source and popularity
  let verificationScore = 0;
  if (venue.source === "mapbox" || venue.source === "osm")
    verificationScore += 30;
  if (venue.popularity > 10) verificationScore += 20;

  // 3. Review Score (0-550) — weighted Bayesian average
  const soundSystemRatings = venue.venueReviews.map((r) => r.soundSystem);
  const atmosphereRatings = venue.venueReviews.map((r) => r.atmosphere);
  const locationRatings = venue.venueReviews.map((r) => r.location);
  const accessibilityRatings = venue.venueReviews.map((r) => r.accessibility);
  const overallRatings = venue.venueReviews.map((r) => r.rating);

  const soundSystemBayesian = bayesianAverage(soundSystemRatings, 2);
  const atmosphereBayesian = bayesianAverage(atmosphereRatings, 2);
  const locationBayesian = bayesianAverage(locationRatings, 2);
  const accessibilityBayesian = bayesianAverage(accessibilityRatings, 2);
  const overallBayesian = bayesianAverage(overallRatings, 2);

  let reviewScore = 0;
  if (overallRatings.length > 0) {
    // Weight each category equally
    const categoryAverage =
      (soundSystemBayesian +
        atmosphereBayesian +
        locationBayesian +
        accessibilityBayesian) /
      4;

    reviewScore = Math.round((categoryAverage / 5) * WEIGHTS.review);
  }

  // 4. Reliability (0-150) — based on consistency of reviews
  let reliabilityScore = 0;
  if (overallRatings.length > 0) {
    const stdDev = Math.sqrt(
      overallRatings.reduce(
        (sum, r) => sum + Math.pow(r - overallBayesian, 2),
        0,
      ) / overallRatings.length,
    );
    // Lower standard deviation = higher reliability
    reliabilityScore = Math.round(
      Math.max(0, (1 - stdDev / 2) * WEIGHTS.reliability),
    );
  }

  // 5. Activity (0-100) — based on recent reviews and popularity
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentReviews = venue.venueReviews.filter(
    (r) => r.createdAt >= thirtyDaysAgo,
  ).length;

  const activityScore = Math.min(
    WEIGHTS.activity,
    Math.min(recentReviews, 10) * 10 +
      (venue.popularity > 5 ? 20 : 0) +
      (overallRatings.length > 0 ? 10 : 0),
  );

  // Total
  const totalScore = Math.min(
    1000,
    profileQualityScore +
      verificationScore +
      reviewScore +
      reliabilityScore +
      activityScore,
  );

  // Confidence level (0-1) based on data volume
  const totalReviewCount = overallRatings.length;
  const confidenceLevel = Math.min(
    1,
    (totalReviewCount / 10) * 0.6 + (venue.popularity / 20) * 0.4,
  );

  return {
    totalScore,
    profileQualityScore,
    verificationScore,
    reviewScore,
    reliabilityScore,
    activityScore,
    confidenceLevel,
  };
}
