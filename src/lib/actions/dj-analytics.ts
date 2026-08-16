"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { cacheGet, cacheSet, cacheDelete } from "@/lib/cache";

const DJ_PROFILE_STATS_TTL = 300;

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
      source: source ?? "direct",
    },
  });

  // Bump denormalized counter
  await prisma.djProfile.update({
    where: { id: djProfileId },
    data: { monthlyViews: { increment: 1 } },
  });

  // Invalidate homepage trending DJs cache (monthlyViews change)
  await cacheDelete("trending_djs:homepage").catch(() => {});
  // Invalidate DJ profile stats cache (profile views change)
  await cacheDelete(`dj_profile_stats:${djProfileId}`).catch(() => {});
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

  const cacheKey = `dj_profile_stats:${djProfileId}`;
  const cached = await cacheGet<{
    profileViews: { value: number; growth: number };
    bookingRequests: { value: number; growth: number };
    newFollowers: { value: number; growth: number };
    bookingRate: number;
    topCities: any[];
    trafficSources: any[];
  }>(cacheKey);
  if (cached) return cached;

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
    totalBookings > 0
      ? Math.round((acceptedBookings / totalBookings) * 100)
      : 0;

  const result = {
    profileViews: { value: totalViews, growth: viewGrowth },
    bookingRequests: { value: totalBookings, growth: bookingGrowth },
    newFollowers: { value: totalFollowers, growth: followerGrowth },
    bookingRate,
    topCities: [],
    trafficSources: [],
  };

  await cacheSet(cacheKey, result, DJ_PROFILE_STATS_TTL);
  return result;
}
