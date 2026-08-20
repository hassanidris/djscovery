"use client";

import { useState, useMemo, useCallback } from "react";
import { EventCard, type EventCardItem } from "./EventCard";

const PAGE_SIZE = 12;

export function EventGrid({
  events,
  savedEventIds = [],
}: {
  events: EventCardItem[];
  savedEventIds?: number[];
}) {
  const savedSet = useMemo(() => new Set(savedEventIds), [savedEventIds]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [prevEvents, setPrevEvents] = useState(events);

  // Reset pagination when events array changes
  if (prevEvents !== events) {
    setPrevEvents(events);
    setVisibleCount(PAGE_SIZE);
  }

  const visible = useMemo(
    () => events.slice(0, visibleCount),
    [events, visibleCount],
  );
  const hasMore = visibleCount < events.length;

  const loadMore = useCallback(() => {
    setVisibleCount((c) => c + PAGE_SIZE);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((event) => (
          <EventCard
            key={event.slug}
            event={event}
            isSaved={event.eventId !== undefined && savedSet.has(event.eventId)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2 pb-4">
          <button
            onClick={loadMore}
            className="bg-h_blackLight/60 hover:ring-h_red cursor-pointer rounded-full px-8 py-2.5 text-sm text-gray-300 ring-1 ring-gray-700 transition-all hover:text-white"
          >
            Load more ({events.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
