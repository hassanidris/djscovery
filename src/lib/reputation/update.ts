import prisma from "@/lib/client";
import { createClient } from "@supabase/supabase-js";
import { calculateReputationScore } from "./calculate";
import { updateSearchScore } from "@/lib/search/composite-score";

export async function updateReputationScore(
  djProfileId: number,
  changeReason:
    | "EVENT_REVIEW_ADDED"
    | "GIG_REVIEW_ADDED"
    | "GIG_COMPLETED"
    | "HIRE_CANCELLED"
    | "NO_SHOW_REPORTED"
    | "PROFILE_UPDATED"
    | "ORGANIZER_REVIEW_ADDED",
) {
  // Preload auth data outside the transaction so the advisory lock and DB
  // connection are not held during the Supabase admin lookup.
  let user;
  try {
    const djProfile = await prisma.djProfile.findUnique({
      where: { id: djProfileId },
      select: { userId: true },
    });
    if (!djProfile) throw new Error(`DJ profile not found: ${djProfileId}`);

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
    user = data.user;
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : "Failed to preload auth data for reputation update.";
    console.error(message);
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Serialize reputation recomputes for this DJ so concurrent calls cannot
      // use a stale newScores/previousTotal snapshot.
      await tx.$executeRawUnsafe(
        "SELECT pg_advisory_xact_lock(hashtextextended('reputation:' || $1::text, 0))",
        djProfileId,
      );

      // Compute and read while holding the lock, using the preloaded user.
      const newScores = await calculateReputationScore(djProfileId, tx, user);

      const existing = await tx.reputationScore.findUnique({
        where: { djProfileId },
      });

      const previousTotal = existing?.totalScore ?? 0;

      const reputationScore = await tx.reputationScore.upsert({
        where: { djProfileId },
        create: {
          djProfileId,
          ...newScores,
          trendDirection: "STABLE",
        },
        update: {
          ...newScores,
          trendDirection:
            newScores.totalScore > previousTotal + 20
              ? "RISING"
              : newScores.totalScore < previousTotal - 20
                ? "FALLING"
                : "STABLE",
        },
      });

      await tx.djProfile.update({
        where: { id: djProfileId },
        data: { reputationScore: newScores.totalScore },
      });

      await tx.reputationHistory.create({
        data: {
          reputationScoreId: reputationScore.id,
          previousTotal,
          newTotal: newScores.totalScore,
          changeReason,
        },
      });
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to update reputation score.";
    console.error(message);
    return;
  }

  await updateSearchScore(djProfileId);
}
