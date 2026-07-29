"use client";

import { useEffect, useRef, useState } from "react";
import type { ViewMode } from "@/types/dj-demo";
import type { BookingViewerContext } from "@/types/booking";

interface ViewerContextResult {
  viewMode: ViewMode;
  isFollowed: boolean;
  viewerContext: BookingViewerContext;
  isLoading: boolean;
}

const DEFAULT_CONTEXT: BookingViewerContext = {
  role: "guest",
  isAuthenticated: false,
};

/**
 * Fetches per-viewer state (follow status, booking role, dj-owner check)
 * for a DJ profile. This intentionally runs client-side so the parent
 * page can remain a static, ISR-cached shell with no auth/cookie reads.
 */
export function useViewerContext(slug?: string): ViewerContextResult {
  const [viewMode, setViewMode] = useState<ViewMode>("fan");
  const [isFollowed, setIsFollowed] = useState(false);
  const [viewerContext, setViewerContext] =
    useState<BookingViewerContext>(DEFAULT_CONTEXT);
  const [isLoading, setIsLoading] = useState(!!slug);
  const prevSlugRef = useRef(slug);

  useEffect(() => {
    if (!slug) return;

    // Only set loading to true if slug changed (not on initial mount)
    if (slug !== prevSlugRef.current) {
      setIsLoading(true);
    }
    prevSlugRef.current = slug;

    let cancelled = false;

    fetch(`/api/djs/${slug}/viewer-context`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setViewMode(data.viewMode ?? "fan");
        setIsFollowed(!!data.isFollowed);
        setViewerContext(data.viewerContext ?? DEFAULT_CONTEXT);
      })
      .catch((error) => {
        console.error("Failed to fetch viewer context:", error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { viewMode, isFollowed, viewerContext, isLoading };
}
