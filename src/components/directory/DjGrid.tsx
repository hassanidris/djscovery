"use client";

import { useState } from "react";
import { DjUser } from "@/lib/data";
import DjCard from "./DjCard";

const PAGE_SIZE = 9;

type DjGridProps = {
  djs: DjUser[];
};

const DjGrid = ({ djs }: DjGridProps) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (djs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p className="text-lg">No DJs found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  const visible = djs.slice(0, visibleCount);
  const hasMore = visibleCount < djs.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {visible.map((dj) => (
          <DjCard key={dj.id} {...dj} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2 pb-4">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="px-8 py-2.5 rounded-full bg-h_blackLight/60 ring-1 ring-gray-700 text-gray-300 text-sm hover:ring-h_red hover:text-white transition-all cursor-pointer"
          >
            Load more ({djs.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default DjGrid;
