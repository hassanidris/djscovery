import prisma from "@/lib/client";
import { calculateReputationScore } from "./calculate";
import { updateSearchScore } from "@/lib/search/composite-score";

export async function updateReputationScore(
  djProfileId: number,
  changeReason: string,
) {
  try {
    await prisma.$transaction(async (tx) => {
      // Serialize reputation recomputes for this DJ so concurrent calls cannot
      // use a stale newScores/previousTotal snapshot.
      await tx.$executeRawUnsafe(
        "SELECT pg_advisory_xact_lock(hashtextextended('reputation:' || $1::text, 0))",
        djProfileId,
      );

      // Compute and read while holding the lock.
      const newScores = await calculateReputationScore(djProfileId);

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
