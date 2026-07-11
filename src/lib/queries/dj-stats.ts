import prisma from "@/lib/client";

export async function getDjFollowerCount(djProfileId: number): Promise<number> {
  return prisma.djFollow.count({
    where: { djProfileId },
  });
}

export async function getDjBookingCount(djProfileId: number): Promise<number> {
  return prisma.bookingInquiry.count({
    where: {
      djProfileId,
      status: { in: ["PENDING", "ACCEPTED"] },
    },
  });
}

export async function getDjMediaStats(djProfileId: number): Promise<{
  mixes: number;
  videos: number;
  plays: number;
  views: number;
}> {
  const media = await prisma.media.findMany({
    where: { djProfileId },
    select: { type: true, playCount: true, viewCount: true },
  });

  const mixes = media.filter((m) => m.type === "AUDIO").length;
  const videos = media.filter((m) => m.type === "VIDEO").length;
  const plays = media.reduce((sum, m) => sum + m.playCount, 0);
  const views = media.reduce((sum, m) => sum + m.viewCount, 0);

  return { mixes, videos, plays, views };
}

export async function getDjProfileViews(djProfileId: number): Promise<number> {
  return prisma.profileView.count({
    where: { djProfileId },
  });
}
