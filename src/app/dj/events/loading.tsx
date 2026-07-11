import { Skeleton } from "@/components/ui/skeleton";

export default function DjEventsLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32 rounded" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <Skeleton className="mt-2 h-9 w-32 rounded sm:mt-0" />
      </div>

      {/* Tabs */}
      <div className="flex w-fit gap-1 rounded-lg bg-white/5 p-0.75">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-28 rounded-md" />
        ))}
      </div>

      {/* Events grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <div className="relative h-40 overflow-hidden">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="absolute top-3 right-3">
          <Skeleton className="h-7 w-16 rounded" />
        </div>
        <div className="absolute right-3 bottom-3 left-3">
          <Skeleton className="h-5 w-3/4 rounded" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>

        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-4 w-48 rounded" />

        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex gap-3">
            <Skeleton className="h-3.5 w-14 rounded" />
            <Skeleton className="h-3.5 w-14 rounded" />
            <Skeleton className="h-3.5 w-14 rounded" />
          </div>
          <Skeleton className="h-3.5 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}
