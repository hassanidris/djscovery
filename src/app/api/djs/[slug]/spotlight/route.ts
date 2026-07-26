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
  const timer = createTimer("spotlight");
  const { slug } = await params;

  // Check cache first
  timer.start("cache_check");
  const cacheKey = `dj_spotlight:${slug}`;
  const cached = await cacheGet<{
    featuredMix: {
      id: number;
      url: string;
      title: string | null;
      duration: string | null;
      thumbnail: string | null;
      playCount: number;
    } | null;
    featuredVideo: {
      id: number;
      url: string;
      title: string | null;
      duration: string | null;
      thumbnail: string | null;
      viewCount: number;
    } | null;
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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch spotlight media (max 1 audio and 1 video)
  timer.start("fetch_spotlight");
  const [featuredMix, featuredVideo] = await Promise.all([
    prisma.media.findFirst({
      where: {
        djProfileId: djProfile.id,
        type: "AUDIO",
        isSpotlight: true,
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        url: true,
        title: true,
        duration: true,
        thumbnail: true,
        playCount: true,
      },
    }),
    prisma.media.findFirst({
      where: {
        djProfileId: djProfile.id,
        type: "VIDEO",
        isSpotlight: true,
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        url: true,
        title: true,
        duration: true,
        thumbnail: true,
        viewCount: true,
      },
    }),
  ]);
  timer.end("fetch_spotlight");

  const spotlightData = {
    featuredMix: featuredMix
      ? {
          ...featuredMix,
          audioUrl: featuredMix.url,
          plays: featuredMix.playCount,
        }
      : null,
    featuredVideo: featuredVideo
      ? {
          ...featuredVideo,
          videoUrl: featuredVideo.url,
          views: featuredVideo.viewCount,
        }
      : null,
  };

  // Cache for 5 minutes
  timer.start("cache_set");
  await cacheSet(cacheKey, spotlightData, 300);
  timer.end("cache_set");

  timer.flush();
  return NextResponse.json(spotlightData);
}
