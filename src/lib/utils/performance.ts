/**
 * Performance monitoring utilities for API routes.
 * Logs query timings in development and reports to console in production.
 */

type TimerName = string;

const isDev = process.env.NODE_ENV === "development";
const isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging";

interface TimingRecord {
  name: TimerName;
  durationMs: number;
  timestamp: number;
}

const SLOW_QUERY_THRESHOLD_MS = 500;

/**
 * Creates a timer for measuring API route performance.
 * Usage:
 *   const timer = createTimer("dj_events");
 *   timer.start("fetch_profile");
 *   await fetchProfile();
 *   timer.end("fetch_profile");
 *   timer.start("fetch_events");
 *   await fetchEvents();
 *   timer.end("fetch_events");
 *   timer.flush(); // logs all timings
 */
export function createTimer(route: string) {
  const timings: Map<TimerName, number> = new Map();
  const records: TimingRecord[] = [];
  const startTime = performance.now();

  function start(name: TimerName) {
    timings.set(name, performance.now());
  }

  function end(name: TimerName) {
    const startedAt = timings.get(name);
    if (startedAt === undefined) return;

    const durationMs = performance.now() - startedAt;
    records.push({ name, durationMs, timestamp: Date.now() });

    if (isDev && durationMs > SLOW_QUERY_THRESHOLD_MS) {
      console.warn(
        `[perf] SLOW: ${route}.${name} took ${durationMs.toFixed(1)}ms`,
      );
    }

    timings.delete(name);
  }

  function flush() {
    const totalMs = performance.now() - startTime;

    if (isDev || isStaging) {
      const parts = records
        .map((r) => `${r.name}=${r.durationMs.toFixed(0)}ms`)
        .join(", ");
      console.log(`[perf] ${route}: ${parts} | total=${totalMs.toFixed(0)}ms`);
    }

    return {
      route,
      totalMs,
      records,
      timestamp: Date.now(),
    };
  }

  return { start, end, flush };
}

/**
 * Wraps an async function with timing measurement.
 */
export async function measure<T>(
  name: string,
  fn: () => Promise<T>,
  route = "unknown",
): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const durationMs = performance.now() - start;
    if (isDev && durationMs > SLOW_QUERY_THRESHOLD_MS) {
      console.warn(
        `[perf] SLOW: ${route}.${name} took ${durationMs.toFixed(1)}ms`,
      );
    }
    if (isDev || isStaging) {
      console.log(`[perf] ${route}.${name}: ${durationMs.toFixed(0)}ms`);
    }
  }
}
