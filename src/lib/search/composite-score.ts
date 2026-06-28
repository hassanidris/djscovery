import prisma from "@/lib/client";

export async function updateSearchScore(djProfileId: number) {
  const rep = await prisma.reputationScore.findUnique({
    where: { djProfileId },
  });
  const dj = await prisma.djProfile.findUnique({ where: { id: djProfileId } });

  if (!rep || !dj) return;

  const recencyBoost =
    dj.updatedAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 50 : 0;
  const verifiedBoost = dj.status === "APPROVED" ? 30 : 0;
  const featuredBoost = dj.featured ? 100 : 0;

  const searchScore = Math.min(
    1000,
    rep.totalScore * 0.6 +
      recencyBoost * 0.2 +
      verifiedBoost * 0.1 +
      featuredBoost * 0.1,
  );

  await prisma.djProfile.update({
    where: { id: djProfileId },
    data: { searchScore },
  });
}
