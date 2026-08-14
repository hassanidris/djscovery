import { useState, useEffect, useRef } from "react";

// Event context attached to event-anchored reviews (null for direct reviews)
export type RatingEvent = {
  id: number;
  slug: string;
  title: string;
  startDate: Date;
};

export interface RatingItem {
  id: number;
  rating: number;
  review: string | null;
  reviewType: string | null; // "DIRECT" | "EVENT_ATTENDEE" | "EVENT_ORGANIZER" | "GIG_ORGANIZER" | null
  createdAt: Date;
  user: {
    username: string;
    image: string | null;
    name: string | null;
    roles: string[];
  };
  event: RatingEvent | null;
  gig: {
    id: number;
    slug: string | null;
    title: string;
  } | null;
}

interface PaginatedRatingsResponse {
  ratings: RatingItem[];
  totalCount: number;
  hasNextPage: boolean;
  avgRating: number;
}

/**
 * Filter mode for the ratings query.
 *   - undefined  -> all reviews (direct + event + gig)
 *   - "direct"   -> only direct reviews (eventId IS NULL)
 *   - "event"    -> only event-anchored reviews (eventId IS NOT NULL)
 *   - "gig"      -> only gig reviews (from DjGigReview table)
 *   - number     -> only event-anchored reviews for that event
 */
export type RatingFilter = undefined | "direct" | "event" | "gig" | number;

// Default page size. Matches the API route's default limit
// (src/app/api/djs/[slug]/ratings/route.ts).
export const DEFAULT_LIMIT = 10;

/**
 * Fetch paginated DjRatings for a DJ profile.
 *
 * @param slug     - DJ profile slug
 * @param filter   - Optional filter:
 *                     undefined  : all reviews (default, backward compatible)
 *                     "direct"   : only direct reviews
 *                     number     : only event-anchored reviews for that event ID
 *
 * Backward compatibility: calling `usePaginatedRatings(slug)` (no filter)
 * behaves exactly as before — returns all reviews.
 */
export function usePaginatedRatings(
  slug: string,
  filter: RatingFilter = undefined,
) {
  const [data, setData] = useState<RatingItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Keep a ref to the latest filter so fetchRatings can read it without being
  // re-created on every render (avoids stale closure issues in useEffect).
  const filterRef = useRef(filter);
  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  const fetchRatings = async (pageNum: number, append = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: String(DEFAULT_LIMIT),
      });

      // Add eventId filter when provided
      const currentFilter = filterRef.current;
      if (currentFilter === "direct") {
        queryParams.set("eventId", "direct");
      } else if (currentFilter === "event") {
        queryParams.set("eventId", "event");
      } else if (currentFilter === "gig") {
        queryParams.set("eventId", "gig");
      } else if (typeof currentFilter === "number") {
        queryParams.set("eventId", String(currentFilter));
      }

      const response = await fetch(`/api/djs/${slug}/ratings?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch ratings");
      }

      const result: PaginatedRatingsResponse = await response.json();

      if (append) {
        setData((prev) => [...prev, ...result.ratings]);
      } else {
        setData(result.ratings);
      }

      setTotalCount(result.totalCount);
      setHasNextPage(result.hasNextPage);
      setAvgRating(result.avgRating);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadNextPage = () => {
    if (hasNextPage && !isLoading) {
      fetchRatings(page + 1, true);
    }
  };

  const reset = () => {
    setData([]);
    setPage(1);
    fetchRatings(1, false);
  };

  // Refetch when slug OR filter changes
  useEffect(() => {
    queueMicrotask(() => fetchRatings(1, false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, filter]);

  return {
    ratings: data,
    totalCount,
    hasNextPage,
    avgRating,
    isLoading,
    error,
    loadNextPage,
    reset,
  };
}
