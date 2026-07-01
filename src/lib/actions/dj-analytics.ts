"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";

export async function trackProfileView(
  djProfileId: number,
  source?: string,
): Promise<void> {
  // Do not track views for the profile owner
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const profile = await prisma.djProfile.findUnique({
      where: { id: djProfileId },
      select: { userId: true },
    });
    if (profile?.userId === user.id) return;
  }

  // Rate-limit to one view per IP+profile per hour (simplified: skip for now)
  await prisma.profileView.create({
    data: {
      djProfileId,
      viewerId: user?.id ?? null,
      source: source ?? null,
    },
  });

  // Bump denormalized counter
  await prisma.djProfile.update({
    where: { id: djProfileId },
    data: { monthlyViews: { increment: 1 } },
  });
}

export async function getProfileStats(djProfileId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.djProfile.findUnique({
    where: { id: djProfileId },
    select: { userId: true, plan: true },
  });
  if (!profile || profile.userId !== user.id) return null;
  if (profile.plan !== "PREMIUM") return null;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    currentViews,
    previousViews,
    currentBookings,
    previousBookings,
    currentFollowers,
    previousFollowers,
    topCities,
    trafficSources,
  ] = await Promise.all([
    prisma.profileView.count({
      where: { djProfileId, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.profileView.count({
      where: {
        djProfileId,
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),
    prisma.bookingInquiry.count({
      where: { djProfileId, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.bookingInquiry.count({
      where: {
        djProfileId,
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),
    prisma.djFollow.count({
      where: { djProfileId, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.djFollow.count({
      where: {
        djProfileId,
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),
    // Top cities from profile views
    prisma.$queryRaw<Array<{ city: string; count: number }>>`
      SELECT city, COUNT(*) as count
      FROM "ProfileView"
      WHERE "djProfileId" = ${djProfileId}
        AND "createdAt" >= ${thirtyDaysAgo}
        AND city IS NOT NULL
      GROUP BY city
      ORDER BY count DESC
      LIMIT 5
    `,
    // Traffic sources from profile views
    prisma.$queryRaw<Array<{ source: string; count: number }>>`
      SELECT source, COUNT(*) as count
      FROM "ProfileView"
      WHERE "djProfileId" = ${djProfileId}
        AND "createdAt" >= ${thirtyDaysAgo}
        AND source IS NOT NULL
      GROUP BY source
      ORDER BY count DESC
      LIMIT 4
    `,
  ]);

  const pct = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const totalViews = currentViews;
  const totalBookings = currentBookings;
  const totalFollowers = currentFollowers;
  const viewGrowth = pct(currentViews, previousViews);
  const bookingGrowth = pct(currentBookings, previousBookings);
  const followerGrowth = pct(currentFollowers, previousFollowers);

  // Booking rate: accepted inquiries / total inquiries in last 30 days
  const acceptedBookings = await prisma.bookingInquiry.count({
    where: {
      djProfileId,
      status: "ACCEPTED",
      createdAt: { gte: thirtyDaysAgo },
    },
  });
  const bookingRate =
    totalBookings > 0 ? Math.round((acceptedBookings / totalBookings) * 100) : 0;

  return {
    profileViews: { value: totalViews, growth: viewGrowth },
    bookingRequests: { value: totalBookings, growth: bookingGrowth },
    newFollowers: { value: totalFollowers, growth: followerGrowth },
    bookingRate,
    topCities: topCities.map((c) => ({
      city: c.city,
      percentage: Number(c.count),
    })),
    trafficSources: trafficSources.map((s) => ({
      source: s.source,
      percentage: Number(s.count),
    })),
  };
}
