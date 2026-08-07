import Link from "next/link";
import { Suspense } from "react";
import { Music2, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/client";
import { getDemoEvents } from "@/data/events-demo";
import { getSavedEventIds } from "@/lib/actions/follows";
import { VALID_EVENT_CATEGORIES } from "@/lib/event-categories";
import type { EventCardItem } from "@/components/events/EventCard";
import { EventGrid } from "@/components/events/EventGrid";
import { EventFilters } from "@/components/events/EventFilters";

export const metadata = { title: "Events — DJcovery" };
export const revalidate = 60;

function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Tab config ────────────────────────────────────────────────────────────────

type Tab = "upcoming" | "past";

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const activeTab: Tab = sp.tab === "past" ? "past" : "upcoming";
  const categoryFilter = sp.category || "all";
  const isValidCategory =
    categoryFilter === "all" ||
    VALID_EVENT_CATEGORIES.includes(categoryFilter as any);
  if (!isValidCategory) {
    // fall back to "all" or return notFound()
  }
  const now = new Date();

  // ── DB events ──────────────────────────────────────────────────────────────
  const dbEvents = await prisma.event.findMany({
    where: {
      deletedAt: null,
      status: "PUBLISHED",
      ...(activeTab === "upcoming"
        ? { startDate: { gte: now } }
        : { startDate: { lt: now } }),
      ...(categoryFilter !== "all" ? { category: categoryFilter } : {}),
    },
    orderBy: { startDate: activeTab === "upcoming" ? "asc" : "desc" },
    take: 60,
    select: {
      id: true,
      slug: true,
      title: true,
      eventType: true,
      category: true,
      startDate: true,
      posterUrl: true,
      ownerDj: { select: { slug: true, stageName: true } },
      country: { select: { name: true } },
      city: { select: { name: true } },
    },
  });

  const toCard = (e: (typeof dbEvents)[number]): EventCardItem => ({
    eventId: e.id,
    slug: e.slug,
    title: e.title,
    eventType: e.eventType,
    category: e.category,
    startDate: e.startDate,
    posterUrl: e.posterUrl ?? null,
    location: [e.city?.name, e.country?.name].filter(Boolean).join(", "),
    djName: e.ownerDj.stageName,
    djSlug: e.ownerDj.slug,
  });

  const savedEventIds = await getSavedEventIds();
  let events: EventCardItem[] = dbEvents.map(toCard);

  // ── Staging: merge demo events ─────────────────────────────────────────────
  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging";
  if (isStaging) {
    const dbSlugs = new Set(dbEvents.map((e) => e.slug));
    const demoFiltered = getDemoEvents()
      .filter((e) => {
        if (dbSlugs.has(e.slug)) return false;
        if (activeTab === "upcoming" && e.daysOffset <= 0) return false;
        if (activeTab === "past" && e.daysOffset > 0) return false;
        if (categoryFilter !== "all" && e.category !== categoryFilter)
          return false;
        return true;
      })
      .map((e): EventCardItem => ({
        slug: e.slug,
        title: e.title,
        eventType: e.eventType,
        category: e.category,
        startDate: e.eventDate,
        posterUrl: e.posterUrl ?? null,
        location: [e.city, e.country].filter(Boolean).join(", "),
        djName: slugToName(e.djSlug),
        djSlug: e.djSlug,
        isDemo: true,
      }));

    events = [...events, ...demoFiltered];

    if (activeTab === "upcoming") {
      events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    } else {
      events.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Banner */}
      <section className="bg-h_blackLight/30 border-b border-gray-800 px-4 py-10 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center md:px-8">
          <div className="flex items-center gap-4">
            <div className="bg-h_red/10 border-h_red/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
              <CalendarDays className="text-h_redLight h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-h_white text-2xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                DJ <span className="text-h_redLight/80">Events</span>
              </h1>
              <p className="text-sm leading-relaxed text-gray-400">
                Discover DJ events happening around the world.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-h_red/10 text-h_redLight border-h_red/20 gap-1.5 border px-3 py-1">
              <CalendarDays className="h-3 w-3" /> {events.length} event
              {events.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        {/* Tabs and Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 border-b border-zinc-800">
            {(["upcoming", "past"] as const).map((tab) => (
              <Link
                key={tab}
                href={
                  tab === "upcoming"
                    ? `/events${categoryFilter !== "all" ? `?category=${categoryFilter}` : ""}`
                    : `/events?tab=past${categoryFilter !== "all" ? `&category=${categoryFilter}` : ""}`
                }
                className={`border-b-2 px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "border-white text-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab}
              </Link>
            ))}
          </div>
          <Suspense
            fallback={
              <div className="h-10 w-32 animate-pulse rounded bg-zinc-800" />
            }
          >
            <EventFilters />
          </Suspense>
        </div>

        {/* Empty state */}
        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-24 text-center">
            <Music2 className="mb-4 h-10 w-10 text-zinc-700" />
            <p className="font-semibold text-white">
              {activeTab === "upcoming"
                ? "No upcoming events"
                : "No past events"}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {activeTab === "upcoming"
                ? "Check back soon — events are added regularly."
                : "Past events will appear here once they've happened."}
            </p>
          </div>
        )}

        {/* Grid with load-more */}
        {events.length > 0 && (
          <EventGrid events={events} savedEventIds={savedEventIds} />
        )}
      </div>
    </div>
  );
}
