"use client";

import { useEffect, useRef, useState } from "react";

interface PerfRecord {
  route: string;
  durationMs: number;
  cached: boolean;
  timestamp: number;
}

const SLOW_THRESHOLD_MS = 1000;
const MAX_RECORDS = 50;

/**
 * Client-side performance monitoring hook.
 * Tracks API response times and reports slow requests.
 *
 * Usage:
 *   const { records, slowRequests } = useApiPerformance();
 *   // records: all tracked API calls
 *   // slowRequests: calls exceeding SLOW_THRESHOLD_MS
 */
export function useApiPerformance() {
  const [records, setRecords] = useState<PerfRecord[]>([]);
  const [slowRequests, setSlowRequests] = useState<PerfRecord[]>([]);
  const observerRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV !== "development") return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const url = entry.name;

          // Only track API calls
          if (!url.includes("/api/")) continue;

          const durationMs = entry.duration;
          const isCached =
            (entry as PerformanceResourceTiming).transferSize === 0;

          const record: PerfRecord = {
            route: url.replace(/^https?:\/\/[^/]+/, ""),
            durationMs: Math.round(durationMs),
            cached: isCached,
            timestamp: Date.now(),
          };

          setRecords((prev) => [record, ...prev].slice(0, MAX_RECORDS));

          if (durationMs > SLOW_THRESHOLD_MS) {
            setSlowRequests((prev) => [record, ...prev].slice(0, MAX_RECORDS));
            console.warn(
              `[perf] Slow API: ${record.route} took ${record.durationMs}ms`,
            );
          }
        }
      });

      observer.observe({ type: "resource", buffered: true });
      observerRef.current = observer;
    } catch {
      // PerformanceObserver not supported
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return { records, slowRequests };
}

/**
 * Reports page load metrics (TTFB, FCP, LCP).
 */
export function usePageLoadMetrics() {
  const [metrics, setMetrics] = useState<{
    ttfb?: number;
    fcp?: number;
    lcp?: number;
  }>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV !== "development") return;

    const navEntries = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      const ttfb = Math.round(navEntries[0].responseStart);
      queueMicrotask(() => {
        setMetrics((prev) => ({ ...prev, ttfb }));
      });
    }

    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          setMetrics((prev) => ({
            ...prev,
            fcp: Math.round(entry.startTime),
          }));
        }
      }
    });
    paintObserver.observe({ type: "paint", buffered: true });

    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        setMetrics((prev) => ({
          ...prev,
          lcp: Math.round(entries[entries.length - 1].startTime),
        }));
      }
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

    return () => {
      paintObserver.disconnect();
      lcpObserver.disconnect();
    };
  }, []);

  return metrics;
}
