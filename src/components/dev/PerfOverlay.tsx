"use client";

import {
  useApiPerformance,
  usePageLoadMetrics,
} from "@/hooks/useApiPerformance";

/**
 * Development-only performance overlay.
 * Shows API response times and page load metrics in a fixed panel.
 * Only renders in development mode.
 */
export function PerfOverlay() {
  const { records, slowRequests } = useApiPerformance();
  const metrics = usePageLoadMetrics();

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed right-4 bottom-4 z-9999 max-h-80 w-96 overflow-y-auto rounded-lg border border-white/10 bg-black/90 p-3 font-mono text-xs text-white/80 shadow-2xl backdrop-blur">
      <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
        <span className="font-bold text-white">Performance Monitor</span>
        {slowRequests.length > 0 && (
          <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-red-400">
            {slowRequests.length} slow
          </span>
        )}
      </div>

      {/* Page load metrics */}
      <div className="mb-3 flex gap-3 text-[10px]">
        {metrics.ttfb !== undefined && (
          <span
            className={metrics.ttfb > 800 ? "text-red-400" : "text-green-400"}
          >
            TTFB: {metrics.ttfb}ms
          </span>
        )}
        {metrics.fcp !== undefined && (
          <span
            className={metrics.fcp > 1800 ? "text-red-400" : "text-green-400"}
          >
            FCP: {metrics.fcp}ms
          </span>
        )}
        {metrics.lcp !== undefined && (
          <span
            className={metrics.lcp > 2500 ? "text-red-400" : "text-green-400"}
          >
            LCP: {metrics.lcp}ms
          </span>
        )}
      </div>

      {/* Recent API calls */}
      <div className="space-y-1">
        {records.length === 0 ? (
          <div className="text-white/40">Waiting for API calls...</div>
        ) : (
          records.slice(0, 15).map((r, i) => (
            <div
              key={`${r.timestamp}-${i}`}
              className="flex items-center justify-between gap-2"
            >
              <span className="truncate text-[10px]" title={r.route}>
                {r.cached ? "cached " : ""}
                {r.route}
              </span>
              <span
                className={
                  r.durationMs > 1000
                    ? "shrink-0 text-red-400"
                    : r.durationMs > 500
                      ? "shrink-0 text-yellow-400"
                      : "shrink-0 text-green-400"
                }
              >
                {r.durationMs}ms
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
