import Link from "next/link";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/client";
import { getDemoEvents } from "@/data/events-demo";
import { EventCard, type EventCardItem } from "@/components/events/EventCard";

type Props = {
  userCountryName?: string | null;
};

function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function HomeEventsSection({ userCountryName }: Props) {
  const now = new Date();
  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging";

  let dbEvents: EventCardItem[] = [];

  try {
    const rows = await prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        eventType: "PUBLIC",
        startDate: { gte: now },
      },
      orderBy: { startDate: "asc" },
      take: 20,
      select: {
        slug: true,
        title: true,
        eventType: true,
        category: true,
        startDate: true,
        posterUrl: true,
        venue: true,
        city: { select: { name: true } },
        country: { select: { name: true } },
        ownerDj: { select: { stageName: true, slug: true } },
      },
    });

    dbEvents = rows.map((e) => ({
      slug: e.slug,
      title: e.title,
      eventType: e.eventType,
      category: e.category ?? "OTHER",
      startDate: e.startDate,
      posterUrl: e.posterUrl ?? null,
      location: [e.venue, e.city?.name, e.country?.name]
        .filter(Boolean)
        .join(", "),
      djName: e.ownerDj.stageName,
      djSlug: e.ownerDj.slug,
    }));
  } catch {
    // DB unavailable — fall through to demo
  }

  let events: EventCardItem[] = [...dbEvents];

  if (isStaging) {
    const dbSlugs = new Set(dbEvents.map((e) => e.slug));
    const demoUpcoming = getDemoEvents()
      .filter((e) => e.daysOffset > 0 && !dbSlugs.has(e.slug))
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

    events = [...events, ...demoUpcoming];
  }

  // Sort: user's country first, then by date
  if (userCountryName) {
    events.sort((a, b) => {
      const aLocal = a.location
        .toLowerCase()
        .includes(userCountryName.toLowerCase());
      const bLocal = b.location
        .toLowerCase()
        .includes(userCountryName.toLowerCase());
      if (aLocal && !bLocal) return -1;
      if (!aLocal && bLocal) return 1;
      return a.startDate.getTime() - b.startDate.getTime();
    });
  } else {
    events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  const displayed = events.slice(0, 6);

  if (displayed.length === 0) return null;

  return (
    <section className="border-t border-white/5 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
              Upcoming Events
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-400">
              Don&apos;t miss what&apos;s happening near you
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-h_red hover:text-h_red hover:bg-white/5"
          >
            <Link href="/events">View all →</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
