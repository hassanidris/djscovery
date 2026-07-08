import Link from "next/link";
import { EventCard, type EventCardItem } from "./EventCard";

interface Props {
  title: string;
  events: Array<{
    id: number;
    slug: string;
    title: string;
    eventType: string;
    category: string;
    startDate: Date;
    posterUrl: string | null;
    location: string;
    djName: string;
    djSlug: string;
    isDemo: boolean;
  }>;
  viewAllHref: string;
  savedEventIds?: number[];
}

export function EventsSection({
  title,
  events,
  viewAllHref,
  savedEventIds = [],
}: Props) {
  if (events.length === 0) {
    return null;
  }

  const eventCardItems: EventCardItem[] = events.map((event) => ({
    slug: event.slug,
    title: event.title,
    eventType: event.eventType,
    category: event.category,
    startDate: event.startDate,
    posterUrl: event.posterUrl,
    location: event.location,
    djName: event.djName,
    djSlug: event.djSlug,
    isDemo: event.isDemo,
    eventId: event.isDemo ? undefined : event.id,
  }));

  return (
    <section className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <Link
          href={viewAllHref}
          className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {eventCardItems.map((event) => (
          <EventCard
            key={event.slug}
            event={event}
            isSaved={event.eventId ? savedEventIds.includes(event.eventId) : false}
          />
        ))}
      </div>
    </section>
  );
}
