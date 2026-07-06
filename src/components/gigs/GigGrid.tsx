"use client";

import { useState } from "react";
import type { DjGigListItem } from "@/lib/queries/gigs";
import { DjGigCard } from "./GigCard";

const PAGE_SIZE = 9;

type GigItem = DjGigListItem & { isDemo?: true };

export function GigGrid({ gigs }: { gigs: GigItem[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [prevGigs, setPrevGigs] = useState(gigs);

  if (prevGigs !== gigs) {
    setPrevGigs(gigs);
    setVisibleCount(PAGE_SIZE);
  }

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
            className="bg-h_blackLight/60 hover:ring-h_red cursor-pointer rounded-full px-8 py-2.5 text-sm text-gray-300 ring-1 ring-gray-700 transition-all hover:text-white"
          >
            Load more ({gigs.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
