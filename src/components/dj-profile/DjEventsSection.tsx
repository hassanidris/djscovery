import { EventCard, type EventCardItem } from "@/components/events/EventCard";

interface Props {
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
  savedEventIds?: number[];
}

export function DjEventsSection({
  events,
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
      <h2 className="mb-6 text-2xl font-bold text-white">
        Featured Performances
      </h2>
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
