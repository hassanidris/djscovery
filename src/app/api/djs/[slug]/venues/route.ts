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
  const timer = createTimer("venues");
  const { slug } = await params;

  // Check cache first
  timer.start("cache_check");
  const cacheKey = `dj_venues:${slug}`;
  const cached = await cacheGet<
    Array<{
      id: number;
      venueName: string;
      eventDate: string;
      description: string;
      countryId: number;
      cityId: number;
      countryName: string;
      cityName: string;
      latitude: number | null;
      longitude: number | null;
    }>
  >(cacheKey);
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

  // Fetch venues with city and country relations
  timer.start("fetch_venues");
  const venues = await prisma.djVenue.findMany({
    where: { djProfileId: djProfile.id },
    include: {
      city: { select: { name: true } },
      country: { select: { name: true } },
    },
    orderBy: { eventDate: "desc" },
  });
  timer.end("fetch_venues");

  // Transform to expected format with geocoding status
  const transformedVenues = venues.map((v) => ({
    id: v.id,
    venueName: v.venueName,
    eventDate: v.eventDate,
    description: v.description,
    countryId: v.countryId,
    cityId: v.cityId,
    countryName: v.country.name,
    cityName: v.city.name,
    latitude: v.latitude,
    longitude: v.longitude,
    geocodingStatus: v.latitude && v.longitude ? "SUCCESS" : "PENDING",
  }));

  // Cache for 5 minutes
  timer.start("cache_set");
  await cacheSet(cacheKey, transformedVenues, 300);
  timer.end("cache_set");

  timer.flush();
  return NextResponse.json(transformedVenues);
}
