import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";
import { notFound } from "next/navigation";
import { cacheGet, cacheSet } from "@/lib/cache";

export const revalidate = 300; // Cache for 5 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Check cache first
  const cacheKey = `dj_mixes:${slug}`;
  const cached = await cacheGet<Array<{
    id: number;
    type: "AUDIO";
    url: string;
    title: string | null;
    duration: string | null;
    thumbnail: string | null;
    isSpotlight: boolean;
    sortOrder: number;
    playCount: number;
  }>>(cacheKey);

  if (cached) {
    return NextResponse.json(cached);
  }

  // Get DJ profile ID
  const djProfile = await prisma.djProfile.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });

  if (!djProfile || djProfile.status === "REJECTED") {
    return notFound();
  }

  // Fetch audio media (mixes)
  const mixes = await prisma.media.findMany({
    where: {
      djProfileId: djProfile.id,
      type: "AUDIO",
    },
    orderBy: { sortOrder: "asc" },
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
    },
  });

  // Cache for 5 minutes
  await cacheSet(cacheKey, mixes, 300);

  return NextResponse.json(mixes);
}
