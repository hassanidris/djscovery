import { Skeleton } from "@/components/ui/skeleton";

export default function DjAnalyticsLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40 rounded" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <Skeleton className="mt-2 h-9 w-40 rounded sm:mt-0" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <Skeleton className="mb-3 h-3 w-24 rounded" />
            <Skeleton className="h-8 w-20 rounded" />
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
          >
            <div className="flex items-center gap-2 p-4 pb-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-40 rounded" />
            </div>
            <Skeleton className="h-64 w-full rounded-none" />
          </div>
        ))}
      </div>

      {/* Top media */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-40 rounded" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
