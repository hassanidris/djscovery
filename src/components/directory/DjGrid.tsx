"use client";

import { useState, useMemo, useCallback } from "react";
import { DjUser } from "@/lib/data";
import { useFollowedDjIds } from "@/hooks/useFollowedDjIds";
import DjCard from "./DjCard";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const PAGE_SIZE = 12;

type DjGridProps = {
  djs: DjUser[];
};

const DjGrid = ({ djs }: DjGridProps) => {
  // Fetched client-side so the parent /directory page stays a static,
  // ISR-cached shell with no auth/cookie reads.
  const followedDjIds = useFollowedDjIds();
  const followedSet = useMemo(() => new Set(followedDjIds), [followedDjIds]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [prevDjs, setPrevDjs] = useState(djs);

  // Reset pagination when djs array changes
  if (prevDjs !== djs) {
    setPrevDjs(djs);
    setVisibleCount(PAGE_SIZE);
  }

  const visible = useMemo(
    () => djs.slice(0, visibleCount),
    [djs, visibleCount],
  );
  const hasMore = visibleCount < djs.length;

  const loadMore = useCallback(() => {
    setVisibleCount((c) => c + PAGE_SIZE);
  }, []);

  if (djs.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20"
        style={{ padding: "var(--space-20)" }}
      >
        <div
          className="bg-h_blackLight/30 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10"
          style={{
            backgroundColor: "var(--charcoal-light)",
            padding: "var(--space-4)",
          }}
        >
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        <h3
          className="mt-6 text-xl font-semibold text-white"
          style={{ marginTop: "var(--space-6)" }}
        >
          No DJs found
        </h3>
        <p
          className="mt-2 max-w-md text-center text-sm text-gray-400"
          style={{ marginTop: "var(--space-2)" }}
        >
          Try adjusting your filters or browse all DJs to discover talent
        </p>
        <Button
          variant="outline"
          className="mt-6 border-white/20 hover:bg-white/5"
          asChild
          style={{ marginTop: "var(--space-6)" }}
        >
          <Link href="/directory">View All DJs</Link>
        </Button>
      </div>
    );
  }

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
            onClick={loadMore}
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
