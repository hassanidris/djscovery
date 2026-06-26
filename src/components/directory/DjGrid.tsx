"use client";

import { useState, useEffect } from "react";
import { DjUser } from "@/lib/data";
import DjCard from "./DjCard";

const PAGE_SIZE = 9;

type DjGridProps = {
  djs: DjUser[];
  followedDjIds?: number[];
};

const DjGrid = ({ djs, followedDjIds = [] }: DjGridProps) => {
  const followedSet = new Set(followedDjIds);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [djs]);

  if (djs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p className="text-lg">No DJs found</p>
        <p className="mt-1 text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  const visible = djs.slice(0, visibleCount);
  const hasMore = visibleCount < djs.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((dj) => (
          <DjCard
            key={dj.id}
            {...dj}
            isFollowed={
              dj.djProfileId !== undefined && followedSet.has(dj.djProfileId)
            }
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2 pb-4">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="bg-h_blackLight/60 hover:ring-h_red cursor-pointer rounded-full px-8 py-2.5 text-sm text-gray-300 ring-1 ring-gray-700 transition-all hover:text-white"
          >
            Load more ({djs.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default DjGrid;
