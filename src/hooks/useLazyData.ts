import { useState, useEffect, useRef, useCallback } from "react";

export function useLazyData<T>(
  slug: string,
  endpoint: string,
  enabled: boolean = true,
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    if (hasLoaded || !slug || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/djs/${slug}/${endpoint}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
      }

      const result: T = await response.json();
      setData(result);
      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [slug, endpoint, hasLoaded, enabled]);

  useEffect(() => {
    const target = targetRef.current;
    if (!enabled) return;

    // No target attached by the consumer: fall back to an immediate fetch.
    if (!target) {
      fetchData();
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchData();
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observerRef.current.observe(target);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [fetchData, enabled]);

  return {
    data,
    isLoading,
    error,
    hasLoaded,
    targetRef,
  };
}
