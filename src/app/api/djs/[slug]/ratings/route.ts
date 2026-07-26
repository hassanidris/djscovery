import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";
import { notFound } from "next/navigation";
import { cacheGet, cacheSet } from "@/lib/cache";
import { createTimer } from "@/lib/utils/performance";

export const revalidate = 300; // Cache for 5 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const timer = createTimer("ratings");
  const { slug } = await params;
  const { searchParams } = new URL(request.url);

  const MAX_PAGE = 1000;

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");

  if (
    !Number.isSafeInteger(page) ||
    !Number.isSafeInteger(limit) ||
    page < 1 ||
    page > MAX_PAGE ||
    limit < 1 ||
    limit > 50
  ) {
    return NextResponse.json(
      { error: "Invalid pagination parameters" },
      { status: 400 },
    );
  }

  // Check cache first
  timer.start("cache_check");
  const cacheKey = `dj_ratings:${slug}:${page}:${limit}`;
  const cached = await cacheGet<{
    ratings: Array<{
      id: number;
      rating: number;
      review: string | null;
      createdAt: Date;
      user: {
        username: string;
        image: string | null;
        name: string | null;
      };
    }>;
    totalCount: number;
    hasNextPage: boolean;
    avgRating: number;
  }>(cacheKey);
  timer.end("cache_check");

  if (cached) {
    timer.flush();
    return NextResponse.json(cached);
  }

  // Get DJ profile ID
  timer.start("fetch_profile");
  const djProfile = await prisma.djProfile.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });
  timer.end("fetch_profile");

  if (!djProfile || djProfile.status === "REJECTED") {
    timer.flush();
    return NextResponse.json(
      { error: "DJ profile not found" },
      { status: 404 },
    );
  }

  // Fetch ratings with pagination and calculate average rating in parallel
  timer.start("fetch_ratings");
  const [ratings, totalCount, ratingAgg] = await Promise.all([
    prisma.djRating.findMany({
      where: { djProfileId: djProfile.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            username: true,
            image: true,
            name: true,
          },
        },
      },
    }),
    prisma.djRating.count({
      where: { djProfileId: djProfile.id },
    }),
    prisma.djRating.aggregate({
      where: { djProfileId: djProfile.id },
      _avg: { rating: true },
    }),
  ]);
  timer.end("fetch_ratings");

  const hasNextPage = page * limit < totalCount;
  const avgRating = ratingAgg._avg.rating ?? 0;

  const result = {
    ratings,
    totalCount,
    hasNextPage,
    avgRating,
  };

  // Cache for 5 minutes
  timer.start("cache_set");
  await cacheSet(cacheKey, result, 300);
  timer.end("cache_set");

  timer.flush();
  return NextResponse.json(result);
}
