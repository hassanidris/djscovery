import prisma from "@/lib/client";
import { PrismaClient } from "@prisma/client";
import { createClient, User } from "@supabase/supabase-js";

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

const REVIEW_TYPE_WEIGHTS = {
  gigReview: 3,
  eventReview: 2,
  djRating: 1,
};

function bayesianAverage(ratings: number[], priorCount: number, priorMean = 3) {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((a, b) => a + b, 0);
  return (sum + priorCount * priorMean) / (ratings.length + priorCount);
}

export async function calculateReputationScore(
  djProfileId: number,
  client: PrismaClient | PrismaTransactionClient = prisma,
  user?: User,
) {
  const djProfile = await client.djProfile.findUnique({
    where: { id: djProfileId },
    include: {
      gigReviews: true,
      eventReviews: true,
      ratings: true,
      genres: { include: { genre: true } },
      socialLinks: true,
      media: true,
    },
  });

  if (!djProfile) throw new Error("DJ profile not found");

  // 1. Profile Quality (0-150)
  const completionFields = [
    { weight: 20, check: () => !!djProfile.stageName?.trim() },
    { weight: 15, check: () => !!djProfile.avatar?.trim() },
    {
      weight: 15,
      check: () => !!djProfile.bio && djProfile.bio.trim().length >= 50,
    },
    { weight: 15, check: () => djProfile.genres.length > 0 },
    {
      weight: 15,
      check: () => !!(djProfile.bookingEmail || djProfile.bookingPhone),
    },
    { weight: 10, check: () => djProfile.socialLinks.length > 0 },
    { weight: 5, check: () => !!djProfile.coverImage?.trim() },
    { weight: 5, check: () => djProfile.media.length > 0 },
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

  // 2. Verification (0-50)
  let authUser = user;
  if (!authUser) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data, error } = await supabase.auth.admin.getUserById(
      djProfile.userId,
    );
    if (error || !data.user) {
      throw new Error(
        `Supabase user lookup failed for DJ profile ${djProfileId}: ${error?.message ?? "user not found"}`,
      );
    }
    authUser = data.user;
  }

  let verificationScore = 0;
  if (authUser?.email_confirmed_at) verificationScore += 15;
  if (authUser?.identities?.some((i) => i.provider === "google"))
    verificationScore += 25;
  if (djProfile.status === "APPROVED") verificationScore += 10;

  // 3. Review Score (0-550) — weighted Bayesian average
  const gigRatings = djProfile.gigReviews.map((r) => r.rating);
  const eventRatings = djProfile.eventReviews.map((r) => r.rating);
  const fanRatings = djProfile.ratings.map((r) => r.rating);

  const gigBayesian = bayesianAverage(gigRatings, 3);
  const eventBayesian = bayesianAverage(eventRatings, 2);
  const fanBayesian = bayesianAverage(fanRatings, 5);

  const activeWeights =
    (gigRatings.length > 0 ? REVIEW_TYPE_WEIGHTS.gigReview : 0) +
    (eventRatings.length > 0 ? REVIEW_TYPE_WEIGHTS.eventReview : 0) +
    (fanRatings.length > 0 ? REVIEW_TYPE_WEIGHTS.djRating : 0);

  let reviewScore = 0;
  if (activeWeights > 0) {
    const weightedSum =
      gigBayesian *
        (gigRatings.length > 0 ? REVIEW_TYPE_WEIGHTS.gigReview : 0) +
      eventBayesian *
        (eventRatings.length > 0 ? REVIEW_TYPE_WEIGHTS.eventReview : 0) +
      fanBayesian * (fanRatings.length > 0 ? REVIEW_TYPE_WEIGHTS.djRating : 0);

    reviewScore = Math.round(
      (weightedSum / activeWeights / 5) * WEIGHTS.review,
    );
  }

  // 4. Reliability (0-150) — based on Hire lifecycle outcomes
  const hires = await client.hire.findMany({
    where: { application: { djProfileId } },
  });
  const finalizedHires = hires.filter(
    (h) =>
      h.status === "COMPLETED" ||
      h.status === "CANCELLED_BY_DJ" ||
      h.status === "NO_SHOW",
  );
  const completed = finalizedHires.filter(
    (h) => h.status === "COMPLETED",
  ).length;
  const cancelledByDj = finalizedHires.filter(
    (h) => h.status === "CANCELLED_BY_DJ",
  ).length;
  const noShows = finalizedHires.filter((h) => h.status === "NO_SHOW").length;
  const totalHires = finalizedHires.length;

  let reliabilityScore = 0;
  if (totalHires > 0) {
    const rate = completed / totalHires;
    const penalty = (cancelledByDj * 0.5 + noShows * 1.0) / totalHires;
    reliabilityScore = Math.round(
      Math.max(0, rate - penalty) * WEIGHTS.reliability,
    );
  }

  // Old application-based proxy (removed):
  /*
  const totalApplications = await prisma.gigApplication.count({
    where: { djProfileId },
  });
  const acceptedApps = await prisma.gigApplication.count({
    where: { djProfileId, status: "ACCEPTED" },
  });
  const rejectedApps = await prisma.gigApplication.count({
    where: { djProfileId, status: "REJECTED" },
  });
  const withdrawnApps = await prisma.gigApplication.count({
    where: { djProfileId, status: "WITHDRAWN" },
  });

  if (totalApplications > 0) {
    const completionRate = acceptedApps / totalApplications;
    const penalty =
      (rejectedApps * 0.3 + withdrawnApps * 0.2) / totalApplications;
    reliabilityScore = Math.round(
      Math.max(0, completionRate - penalty) * WEIGHTS.reliability,
    );
  }
  */

  // 5. Activity (0-100)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentApplications = await client.gigApplication.count({
    where: { djProfileId, createdAt: { gte: thirtyDaysAgo } },
  });
  const hasUpdatedProfile = djProfile.updatedAt > thirtyDaysAgo;
  const hasRecentLogin = authUser?.last_sign_in_at
    ? new Date(authUser.last_sign_in_at) > thirtyDaysAgo
    : false;

  const activityScore = Math.min(
    WEIGHTS.activity,
    (hasUpdatedProfile ? 20 : 0) +
      Math.min(recentApplications, 5) * 10 +
      (hasRecentLogin ? 20 : 0) +
      (djProfile.ratings.length > 0 ? 10 : 0), // engagement with reviews
  );

  // 6. New Talent Boost (0-50)
  const totalReviewCount =
    gigRatings.length + eventRatings.length + fanRatings.length;
  let newTalentBoost = 0;
  if (totalReviewCount < 3) {
    newTalentBoost = Math.round(50 * (1 - totalReviewCount / 3));
  }

  // Total
  const totalScore = Math.min(
    1000,
    profileQualityScore +
      verificationScore +
      reviewScore +
      reliabilityScore +
      activityScore +
      newTalentBoost,
  );

  // Confidence level (0-1) based on data volume
  const confidenceLevel = Math.min(
    1,
    (totalReviewCount / 10) * 0.5 +
      (totalHires / 5) * 0.3 +
      (authUser?.identities?.length ? 0.2 : 0),
  );

  return {
    totalScore,
    profileQualityScore,
    verificationScore,
    reviewScore,
    reliabilityScore,
    activityScore,
    newTalentBoost,
    confidenceLevel,
  };
}
