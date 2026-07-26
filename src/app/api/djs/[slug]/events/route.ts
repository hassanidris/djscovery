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
  const timer = createTimer("events");
  const { slug } = await params;

  // Check cache first
  timer.start("cache_check");
  const cacheKey = `dj_events:${slug}`;
  const cached = await cacheGet<
    Array<{
      id: number;
      slug: string;
      title: string;
      date: string;
      venue: string;
      city: string;
      country: string;
      isPast: boolean;
      eventType: string;
      category: string;
      status: string;
      role: string | null;
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
    return notFound();
  }

  // Fetch events where DJ is either owner or participant
  timer.start("fetch_events");
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { ownerDjId: djProfile.id },
        {
          participants: {
            some: {
              djProfileId: djProfile.id,
            },
          },
        },
      ],
      deletedAt: null,
    },
    include: {
      participants: {
        where: {
          djProfileId: djProfile.id,
        },
        select: {
          role: true,
        },
      },
      city: { select: { name: true } },
      country: { select: { name: true } },
    },
    orderBy: { startDate: "desc" },
  });
  timer.end("fetch_events");

  // Transform to the EventItem shape expected by DjEventsModule /
  // ProfileEventsSidebar (date as ISO string, city/country as names, isPast).
  const now = Date.now();
  const transformedEvents = events.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    date: event.startDate.toISOString(),
    venue: event.venue ?? "",
    city: event.city?.name ?? "",
    country: event.country?.name ?? "",
    isPast: event.startDate.getTime() < now,
    eventType: event.eventType,
    category: event.category,
    status: event.status,
    role: event.participants[0]?.role || null,
  }));

  // Cache for 5 minutes
  timer.start("cache_set");
  await cacheSet(cacheKey, transformedEvents, 300);
  timer.end("cache_set");

  timer.flush();
  return NextResponse.json(transformedEvents);
}
