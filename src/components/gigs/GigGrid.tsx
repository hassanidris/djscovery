"use client";

import { useState, useEffect } from "react";
import type { DjGigListItem } from "@/lib/queries/gigs";
import { DjGigCard } from "./GigCard";

const PAGE_SIZE = 9;

type GigItem = DjGigListItem & { isDemo?: true };

export function GigGrid({ gigs }: { gigs: GigItem[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [gigs]);

  const visible = gigs.slice(0, visibleCount);
  const hasMore = visibleCount < gigs.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((gig) => (
          <DjGigCard key={gig.slug} gig={gig} isDemo={!!gig.isDemo} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2 pb-4">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="cursor-pointer rounded-full bg-h_blackLight/60 px-8 py-2.5 text-sm text-gray-300 ring-1 ring-gray-700 transition-all hover:text-white hover:ring-h_red"
          >
            Load more ({gigs.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
