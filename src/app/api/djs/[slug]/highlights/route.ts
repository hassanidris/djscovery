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
  const cacheKey = `dj_highlights:${slug}`;
  const cached = await cacheGet<Array<{
    id: number;
    year: string;
    title: string;
    description: string | null;
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

  // Fetch career highlights
  const highlights = await prisma.djCareerHighlight.findMany({
    where: { djProfileId: djProfile.id },
    orderBy: { year: "desc" },
  });

  // Cache for 5 minutes
  await cacheSet(cacheKey, highlights, 300);

  return NextResponse.json(highlights);
}
