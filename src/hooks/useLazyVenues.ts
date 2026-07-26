import { useState, useEffect, useRef, useCallback } from "react";

interface Venue {
  id: number;
  venueName: string;
  eventDate: string;
  description: string;
  countryId: number;
  cityId: number;
  countryName: string;
  cityName: string;
  latitude: number | null;
  longitude: number | null;
  geocodingStatus: "SUCCESS" | "PENDING";
}

export function useLazyVenues(slug: string) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const fetchVenues = useCallback(async () => {
    if (hasLoaded || !slug) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/djs/${slug}/venues`);

      if (!response.ok) {
        throw new Error("Failed to fetch venues");
      }

      const data: Venue[] = await response.json();
      setVenues(data);
      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [slug, hasLoaded]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchVenues();
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observerRef.current.observe(target);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [fetchVenues]);

  return {
    venues,
    isLoading,
    error,
    hasLoaded,
    targetRef,
  };
}
