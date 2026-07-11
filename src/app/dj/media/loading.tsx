import { Skeleton } from "@/components/ui/skeleton";

export default function DjMediaLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32 rounded" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <Skeleton className="mt-2 h-9 w-28 rounded sm:mt-0" />
      </div>

      {/* Tabs */}
      <div className="flex w-fit gap-1 rounded-lg bg-white/5 p-0.75">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-28 rounded-md" />
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5"
          >
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
