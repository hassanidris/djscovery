export function GigSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <div className="h-5 w-16 animate-pulse rounded-full bg-white/10" />
            <div className="h-5 w-12 animate-pulse rounded-full bg-white/10" />
          </div>
          <div className="h-6 w-3/4 animate-pulse rounded bg-white/10" />
        </div>
        <div className="h-5 w-20 shrink-0 animate-pulse rounded bg-white/10" />
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
      </div>

      {/* Genres */}
      <div className="flex flex-wrap gap-1.5">
        <div className="h-6 w-16 animate-pulse rounded-full bg-white/8" />
        <div className="h-6 w-20 animate-pulse rounded-full bg-white/8" />
        <div className="h-6 w-14 animate-pulse rounded-full bg-white/8" />
      </div>

      {/* Organizer footer */}
      <div className="mt-auto flex items-center gap-2 border-t border-white/8 pt-3">
        <div className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

export function GigGridSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <GigSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
