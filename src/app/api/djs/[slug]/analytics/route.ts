import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";
import {
  getDjResponseRate,
  getDjBookingRate,
  getDjTopCities,
} from "@/lib/queries/dj-stats";
import { notFound } from "next/navigation";
import { cacheGet, cacheSet } from "@/lib/cache";
import { createTimer } from "@/lib/utils/performance";

export const revalidate = 300; // Cache for 5 minutes (Next.js HTTP cache)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const timer = createTimer("analytics");
  const { slug } = await params;

  // Check cache first
  timer.start("cache_check");
  const cacheKey = `dj_analytics:${slug}`;
  const cached = await cacheGet<{
    avgRating: number;
    publicEventsCount: number;
    responseRate: number;
    bookingRate: number;
    topCities: Array<{ city: string; country: string; count: number }>;
  }>(cacheKey);
  timer.end("cache_check");

  if (cached) {
    timer.flush();
    return NextResponse.json(cached);
  }

  // First, get the DJ profile ID from slug
  timer.start("fetch_profile");
  const djProfile = await prisma.djProfile.findUnique({
    where: { slug },
    select: { id: true, status: true, hidden: true },
  });
  timer.end("fetch_profile");

  if (!djProfile || djProfile.status === "REJECTED") {
    return notFound();
  }

  // Fetch all analytics in parallel
  timer.start("fetch_analytics");
  const [ratingAgg, publicEventsCount, responseRate, bookingRate, topCities] =
    await Promise.all([
      // Average rating over ALL ratings
      prisma.djRating.aggregate({
        where: { djProfileId: djProfile.id },
        _avg: { rating: true },
      }),
      // Public events count
      prisma.event.count({
        where: {
          ownerDjId: djProfile.id,
          status: { in: ["PUBLISHED", "COMPLETED"] },
          deletedAt: null,
        },
      }),
      // Response rate
      getDjResponseRate(djProfile.id),
      // Booking rate
      getDjBookingRate(djProfile.id),
      // Top cities (audience location)
      getDjTopCities(djProfile.id, 5),
    ]);
  timer.end("fetch_analytics");

  const avgRating = ratingAgg._avg.rating ?? 0;

  const result = {
    avgRating,
    publicEventsCount,
    responseRate,
    bookingRate,
    topCities,
  };

  // Cache the result for 5 minutes
  timer.start("cache_set");
  await cacheSet(cacheKey, result, 300);
  timer.end("cache_set");

  timer.flush();
  return NextResponse.json(result);
}
