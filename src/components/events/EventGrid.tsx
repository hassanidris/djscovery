"use client";

import { useState, useEffect } from "react";
import { EventCard, type EventCardItem } from "./EventCard";

const PAGE_SIZE = 9;

export function EventGrid({ events }: { events: EventCardItem[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [events]);

  const visible = events.slice(0, visibleCount);
  const hasMore = visibleCount < events.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((event) => (
          <EventCard key={event.slug} event={event} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2 pb-4">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="cursor-pointer rounded-full bg-h_blackLight/60 px-8 py-2.5 text-sm text-gray-300 ring-1 ring-gray-700 transition-all hover:text-white hover:ring-h_red"
          >
            Load more ({events.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
