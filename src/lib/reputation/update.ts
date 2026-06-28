import prisma from "@/lib/client";
import { calculateReputationScore } from "./calculate";
import { updateSearchScore } from "@/lib/search/composite-score";

export async function updateReputationScore(
  djProfileId: number,
  changeReason: string,
) {
  const newScores = await calculateReputationScore(djProfileId);

  const existing = await prisma.reputationScore.findUnique({
    where: { djProfileId },
  });

  const previousTotal = existing?.totalScore ?? 0;

  await prisma.$transaction(async (tx) => {
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

  await updateSearchScore(djProfileId);
}
