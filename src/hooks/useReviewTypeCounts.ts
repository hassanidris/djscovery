import { useState, useEffect } from "react";

interface ReviewTypeCounts {
  direct: number | undefined;
  event: number | undefined;
  gig: number | undefined;
}

/**
 * Fetch the total count of direct, event-anchored, and gig reviews for a DJ.
 * These counts persist across tab switches so the UI can show stable
 * tab badges even when the active tab filters the reviews server-side.
 * Returns undefined while loading so consumers can fall back to other data.
 */
export function useReviewTypeCounts(slug: string): ReviewTypeCounts {
  const [counts, setCounts] = useState<ReviewTypeCounts>({
    direct: undefined,
    event: undefined,
    gig: undefined,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchCounts() {
      try {
        const [directRes, eventRes, gigRes] = await Promise.all([
          fetch(`/api/djs/${slug}/ratings?page=1&limit=1&eventId=direct`).then(
            (r) => r.json(),
          ),
          fetch(`/api/djs/${slug}/ratings?page=1&limit=1&eventId=event`).then(
            (r) => r.json(),
          ),
          fetch(`/api/djs/${slug}/ratings?page=1&limit=1&eventId=gig`).then(
            (r) => r.json(),
          ),
        ]);

        if (!cancelled) {
          setCounts({
            direct: directRes.totalCount ?? 0,
            event: eventRes.totalCount ?? 0,
            gig: gigRes.totalCount ?? 0,
          });
        }
      } catch {
        // Silently fail — counts are optional for UI
      }
    }

    fetchCounts();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return counts;
}
