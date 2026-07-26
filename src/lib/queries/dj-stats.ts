import prisma from "@/lib/client";

export type DailyCount = { date: string; count: number };

export type BookingStatusCount = { status: string; count: number };

export type TopMediaItem = {
  id: number;
  title: string | null;
  type: "AUDIO" | "VIDEO" | "IMAGE";
  thumbnail: string | null;
  plays: number;
  views: number;
  score: number;
};

export type ProfileViewSource = { source: string; count: number };

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

function fillDateRange(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(toDateString(d));
  }
  return dates;
}

function groupByDate(
  records: { createdAt: Date }[],
  days: number,
): DailyCount[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    const key = toDateString(record.createdAt);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return fillDateRange(days).map((date) => ({
    date,
    count: counts.get(date) || 0,
  }));
}

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
  const [countsByType, sums] = await Promise.all([
    prisma.media.groupBy({
      by: ["type"],
      where: { djProfileId },
      _count: true,
    }),
    prisma.media.aggregate({
      where: { djProfileId },
      _sum: { playCount: true, viewCount: true },
    }),
  ]);

  const counts = { AUDIO: 0, VIDEO: 0, IMAGE: 0 };
  countsByType.forEach((item) => {
    counts[item.type as keyof typeof counts] = item._count;
  });

  return {
    mixes: counts.AUDIO,
    videos: counts.VIDEO,
    plays: sums._sum.playCount ?? 0,
    views: sums._sum.viewCount ?? 0,
  };
}

export async function getDjProfileViews(djProfileId: number): Promise<number> {
  return prisma.profileView.count({
    where: { djProfileId },
  });
}

export async function getDjProfileViewsOverTime(
  djProfileId: number,
  days: number,
): Promise<DailyCount[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const views = await prisma.profileView.findMany({
    where: { djProfileId, createdAt: { gte: since } },
    select: { createdAt: true },
  });

  return groupByDate(views, days);
}

export async function getDjFollowerGrowthOverTime(
  djProfileId: number,
  days: number,
): Promise<DailyCount[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const follows = await prisma.djFollow.findMany({
    where: { djProfileId, createdAt: { gte: since } },
    select: { createdAt: true },
  });

  return groupByDate(follows, days);
}

export async function getDjBookingsByStatus(
  djProfileId: number,
): Promise<BookingStatusCount[]> {
  const results = await prisma.bookingInquiry.groupBy({
    by: ["status"],
    where: { djProfileId },
    _count: { status: true },
  });

  return results.map((r) => ({
    status: r.status,
    count: r._count.status,
  }));
}

export async function getDjTopMedia(
  djProfileId: number,
  limit = 5,
): Promise<TopMediaItem[]> {
  const media = await prisma.media.findMany({
    where: { djProfileId, type: { in: ["AUDIO", "VIDEO"] } },
    orderBy: { playCount: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      type: true,
      thumbnail: true,
      playCount: true,
      viewCount: true,
    },
  });

  return media.map((m) => ({
    id: m.id,
    title: m.title,
    type: m.type,
    thumbnail: m.thumbnail,
    plays: m.playCount,
    views: m.viewCount,
    score: m.type === "AUDIO" ? m.playCount : m.viewCount,
  }));
}

export async function getDjProfileViewSources(
  djProfileId: number,
): Promise<ProfileViewSource[]> {
  const results = await prisma.profileView.groupBy({
    by: ["source"],
    where: { djProfileId },
    _count: { source: true },
  });

  return results
    .map((r) => ({
      source: r.source || "direct",
      count: r._count.source,
    }))
    .sort((a, b) => b.count - a.count);
}

// ── Phase 1: Response Rate & Booking Rate ────────────────────────────────────
// These replace the hardcoded values in seed data and profile defaults.
// Response Rate = % of booking inquiries that received a response (ACCEPTED or DECLINED)
// Booking Rate  = % of booking inquiries that were ACCEPTED

export async function getDjResponseRate(djProfileId: number): Promise<number> {
  const results = await prisma.bookingInquiry.groupBy({
    by: ["status"],
    where: { djProfileId },
    _count: { status: true },
  });

  const total = results.reduce((sum, r) => sum + r._count.status, 0);
  const responded = results
    .filter((r) => r.status === "ACCEPTED" || r.status === "DECLINED")
    .reduce((sum, r) => sum + r._count.status, 0);

  return total > 0 ? Math.round((responded / total) * 100) : 0;
}

export async function getDjBookingRate(djProfileId: number): Promise<number> {
  const results = await prisma.bookingInquiry.groupBy({
    by: ["status"],
    where: { djProfileId },
    _count: { status: true },
  });

  const total = results.reduce((sum, r) => sum + r._count.status, 0);
  const accepted =
    results.find((r) => r.status === "ACCEPTED")?._count.status ?? 0;

  return total > 0 ? Math.round((accepted / total) * 100) : 0;
}

// ── Phase 2: Top Cities (audience location from ProfileView) ─────────────────
// ProfileView already has `city` and `country` as String? fields.
// We group by city to find where the DJ's audience is located.

export type TopCity = { city: string; country: string; count: number };

export async function getDjTopCities(
  djProfileId: number,
  limit = 5,
): Promise<TopCity[]> {
  const results = await prisma.profileView.groupBy({
    by: ["city", "country"],
    where: {
      djProfileId,
      city: { not: null },
    },
    _count: { city: true },
    orderBy: { _count: { city: "desc" } },
    take: limit,
  });

  return results.map((r) => ({
    city: r.city || "Unknown",
    country: r.country || "Unknown",
    count: r._count.city,
  }));
}
