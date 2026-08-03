import prisma from "@/lib/client";
import { calculateVenueReputationScore } from "./venue-calculate";

export async function updateVenueReputationScore(
  venueId: number,
  changeReason: string,
) {
  try {
    await prisma.$transaction(async (tx) => {
      // Serialize reputation recomputes for this venue
      await tx.$executeRawUnsafe(
        "SELECT pg_advisory_xact_lock(hashtextextended('venue-reputation:' || $1::text, 0))",
        venueId,
      );

      // Compute and read while holding the lock
      const newScores = await calculateVenueReputationScore(venueId, tx);

      const existing = await tx.venueReputationScore.findUnique({
        where: { venueId },
      });

      const previousTotal = existing?.totalScore ?? 0;

      const reputationScore = await tx.venueReputationScore.upsert({
        where: { venueId },
        create: {
          venueId,
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

      await tx.venueReputationHistory.create({
        data: {
          venueReputationScoreId: reputationScore.id,
          previousTotal,
          newTotal: newScores.totalScore,
          changeReason: changeReason as any,
        },
      });
    });
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : "Failed to update venue reputation score.";
    console.error(message);
    return;
  }
}
