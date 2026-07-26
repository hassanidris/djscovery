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
  const timer = createTimer("media");
  const { slug } = await params;
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "12", 10);
  const type = searchParams.get("type") || null; // Optional filter: AUDIO, VIDEO, IMAGE

  if (
    !Number.isInteger(page) ||
    !Number.isInteger(limit) ||
    page < 1 ||
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
  const cacheKey = `dj_media:${slug}:${page}:${limit}:${type || "all"}`;
  const cached = await cacheGet<{
    media: Array<{
      id: number;
      type: "AUDIO" | "VIDEO" | "IMAGE";
      url: string;
      title: string | null;
      duration: string | null;
      thumbnail: string | null;
      isSpotlight: boolean;
      sortOrder: number;
      playCount: number;
      viewCount: number;
    }>;
    totalCount: number;
    hasNextPage: boolean;
    typeCounts: {
      AUDIO: number;
      VIDEO: number;
      IMAGE: number;
    };
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
    return notFound();
  }

  // Build where clause
  const where: any = { djProfileId: djProfile.id };
  if (type && ["AUDIO", "VIDEO", "IMAGE"].includes(type)) {
    where.type = type;
  }

  // Fetch media with pagination
  timer.start("fetch_media");
  const [media, totalCount, countsByType] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        type: true,
        url: true,
        title: true,
        duration: true,
        thumbnail: true,
        isSpotlight: true,
        sortOrder: true,
        playCount: true,
        viewCount: true,
      },
    }),
    prisma.media.count({ where }),
    prisma.media.groupBy({
      by: ["type"],
      where: { djProfileId: djProfile.id },
      _count: true,
    }),
  ]);
  timer.end("fetch_media");

  const hasNextPage = page * limit < totalCount;

  // Calculate counts per type
  const typeCounts = {
    AUDIO: 0,
    VIDEO: 0,
    IMAGE: 0,
  };
  countsByType.forEach((item) => {
    typeCounts[item.type as keyof typeof typeCounts] = item._count;
  });

  const result = {
    media,
    totalCount,
    hasNextPage,
    typeCounts,
  };

  // Cache for 5 minutes
  timer.start("cache_set");
  await cacheSet(cacheKey, result, 300);
  timer.end("cache_set");

  timer.flush();
  return NextResponse.json(result);
}
