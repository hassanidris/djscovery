import Link from "next/link";
import { Music2 } from "lucide-react";
import prisma from "@/lib/client";
import { getDemoEvents } from "@/data/events-demo";
import { EventCard } from "@/components/events/EventCard";
import type { EventCardItem } from "@/components/events/EventCard";

export const metadata = { title: "Events — DJscovery" };
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
  const now = new Date();

  // ── DB events ──────────────────────────────────────────────────────────────
  const dbEvents = await prisma.event.findMany({
    where: {
      deletedAt: null,
      status: "PUBLISHED",
      ...(activeTab === "upcoming"
        ? { startDate: { gte: now } }
        : { startDate: { lt: now } }),
    },
    orderBy: { startDate: activeTab === "upcoming" ? "asc" : "desc" },
    take: 60,
    select: {
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
        return true;
      })
      .map(
        (e): EventCardItem => ({
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
        }),
      );

    events = [...events, ...demoFiltered];

    if (activeTab === "upcoming") {
      events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    } else {
      events.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Events</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Discover DJ events happening around the world.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-1 border-b border-zinc-800">
          {(["upcoming", "past"] as const).map((tab) => (
            <Link
              key={tab}
              href={tab === "upcoming" ? "/events" : "/events?tab=past"}
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

        {/* Grid */}
        {events.length > 0 && (
          <>
            <p className="text-muted-foreground mb-4 text-xs">
              {events.length} event{events.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {events.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
