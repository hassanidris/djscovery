import { useState, useEffect } from "react";

interface AnalyticsData {
  avgRating: number;
  publicEventsCount: number;
  responseRate: number;
  bookingRate: number;
  topCities: Array<{ city: string; country: string; count: number }>;
}

/**
 * Fetches DJ analytics (avgRating, publicEventsCount, responseRate, bookingRate, topCities)
 * from the /api/djs/[slug]/analytics endpoint. Cached for 5 minutes server-side.
 *
 * Usage:
 *   const { analytics, isLoading } = useDjAnalytics(slug);
 */
export function useDjAnalytics(slug: string) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/djs/${slug}/analytics`);
        if (res.ok) {
          const data: AnalyticsData = await res.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, [slug]);

  return { analytics, isLoading };
}
