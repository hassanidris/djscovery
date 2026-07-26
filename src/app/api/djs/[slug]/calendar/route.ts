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
  const cacheKey = `dj_calendar:${slug}`;
  const cached = await cacheGet<{
    availabilityMonth: string | null;
    availabilityDays: any | null;
  }>(cacheKey);

  if (cached) {
    return NextResponse.json(cached);
  }

  // Get DJ profile ID
  const djProfile = await prisma.djProfile.findUnique({
    where: { slug },
    select: { 
      id: true, 
      status: true,
      availabilityMonth: true,
      availabilityDays: true,
    },
  });

  if (!djProfile || djProfile.status === "REJECTED") {
    return notFound();
  }

  const calendarData = {
    availabilityMonth: djProfile.availabilityMonth,
    availabilityDays: djProfile.availabilityDays,
  };

  // Cache for 5 minutes
  await cacheSet(cacheKey, calendarData, 300);

  return NextResponse.json(calendarData);
}
