import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { cacheGet, cacheSet } from "@/lib/cache";
import { getProfileStats } from "@/lib/actions/dj-analytics";

export const revalidate = 60; // Cache for 1 minute (more dynamic than public analytics)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get DJ profile
  const djProfile = await prisma.djProfile.findUnique({
    where: { slug },
    select: { id: true, userId: true, plan: true, status: true },
  });

  if (!djProfile || djProfile.status === "REJECTED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Verify ownership
  if (djProfile.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Verify premium plan
  if (djProfile.plan !== "PREMIUM") {
    return NextResponse.json(null);
  }

  // Check cache first (per-user cache key to prevent cross-user data leakage)
  const cacheKey = `dj_owner_analytics:${slug}:${user.id}`;
  const cached = await cacheGet<{
    profileViews: { value: number; growth: number };
    bookingRequests: { value: number; growth: number };
    newFollowers: { value: number; growth: number };
    bookingRate: number;
    topCities: Array<{ city: string; country: string; percentage: number }>;
    trafficSources: Array<{ source: string; count: number }>;
  }>(cacheKey);

  if (cached) {
    return NextResponse.json(cached);
  }

  // Fetch owner-only stats
  const stats = await getProfileStats(djProfile.id);

  if (!stats) {
    return NextResponse.json(null);
  }

  // Cache for 1 minute
  await cacheSet(cacheKey, stats, 60);

  return NextResponse.json(stats);
}
