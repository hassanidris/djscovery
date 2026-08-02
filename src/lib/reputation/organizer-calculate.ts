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

function bayesianAverage(ratings: number[], priorCount: number, priorMean = 3) {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((a, b) => a + b, 0);
  return (sum + priorCount * priorMean) / (ratings.length + priorCount);
}

export async function calculateOrganizerReputationScore(
  organizerProfileId: number,
  client: PrismaClient | PrismaTransactionClient = prisma,
  user?: User,
) {
  const organizerProfile = await client.organizerProfile.findUnique({
    where: { id: organizerProfileId },
    include: {
      organizerReviews: true,
      socialLinks: true,
      gigs: {
        include: {
          applications: {
            where: { status: "ACCEPTED" },
          },
        },
      },
    },
  });

  if (!organizerProfile) throw new Error("Organizer profile not found");

  // 1. Profile Quality (0-150)
  const completionFields = [
    { weight: 25, check: () => !!organizerProfile.displayName?.trim() },
    { weight: 20, check: () => !!organizerProfile.logoUrl?.trim() },
    {
      weight: 20,
      check: () =>
        !!organizerProfile.bio && organizerProfile.bio.trim().length >= 50,
    },
    { weight: 15, check: () => !!organizerProfile.website?.trim() },
    { weight: 10, check: () => !!organizerProfile.coverImageUrl?.trim() },
    { weight: 10, check: () => organizerProfile.socialLinks.length > 0 },
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
      organizerProfile.userId,
    );
    if (error || !data.user) {
      throw new Error(
        `Supabase user lookup failed for organizer profile ${organizerProfileId}: ${error?.message ?? "user not found"}`,
      );
    }
    authUser = data.user;
  }

  let verificationScore = 0;
  if (authUser?.email_confirmed_at) verificationScore += 15;
  if (authUser?.identities?.some((i) => i.provider === "google"))
    verificationScore += 25;
  if (organizerProfile.status === "ACTIVE") verificationScore += 10;

  // 3. Review Score (0-550) — weighted Bayesian average
  const communicationRatings = organizerProfile.organizerReviews.map(
    (r) => r.communication,
  );
  const paymentRatings = organizerProfile.organizerReviews.map(
    (r) => r.payment,
  );
  const professionalismRatings = organizerProfile.organizerReviews.map(
    (r) => r.professionalism,
  );
  const venueQualityRatings = organizerProfile.organizerReviews.map(
    (r) => r.venueQuality,
  );
  const overallRatings = organizerProfile.organizerReviews.map((r) => r.rating);

  const communicationBayesian = bayesianAverage(communicationRatings, 3);
  const paymentBayesian = bayesianAverage(paymentRatings, 3);
  const professionalismBayesian = bayesianAverage(professionalismRatings, 3);
  const venueQualityBayesian = bayesianAverage(venueQualityRatings, 3);
  const overallBayesian = bayesianAverage(overallRatings, 3);

  let reviewScore = 0;
  if (overallRatings.length > 0) {
    // Weight each category equally
    const categoryAverage =
      (communicationBayesian +
        paymentBayesian +
        professionalismBayesian +
        venueQualityBayesian) /
      4;

    reviewScore = Math.round((categoryAverage / 5) * WEIGHTS.review);
  }

  // 4. Reliability (0-150) — based on gig completion and hire outcomes
  const totalGigs = organizerProfile.gigs.length;
  const completedGigs = organizerProfile.gigs.filter((gig) => {
    const acceptedApplications = gig.applications.filter(
      (app) => app.status === "ACCEPTED",
    );
    return acceptedApplications.length > 0;
  }).length;

  let reliabilityScore = 0;
  if (totalGigs > 0) {
    const completionRate = completedGigs / totalGigs;
    reliabilityScore = Math.round(completionRate * WEIGHTS.reliability);
  }

  // 5. Activity (0-100)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentGigs = organizerProfile.gigs.filter(
    (gig) => gig.createdAt >= thirtyDaysAgo,
  ).length;
  const hasUpdatedProfile = organizerProfile.updatedAt >= thirtyDaysAgo;
  const hasRecentLogin = authUser?.last_sign_in_at
    ? new Date(authUser.last_sign_in_at) >= thirtyDaysAgo
    : false;

  const activityScore = Math.min(
    WEIGHTS.activity,
    (hasUpdatedProfile ? 25 : 0) +
      Math.min(recentGigs, 5) * 15 +
      (hasRecentLogin ? 20 : 0) +
      (organizerProfile.organizerReviews.length > 0 ? 10 : 0),
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
    (totalReviewCount / 10) * 0.5 +
      (totalGigs / 5) * 0.3 +
      (authUser?.identities?.length ? 0.2 : 0),
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
