// Skeleton placeholders for below-the-fold profile sections.
// Used as the `loading` prop for next/dynamic imports so the page
// shows a loading.tsx-style shimmer while the chunk downloads.

function EndorsementsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
      <div className="h-4 w-64 animate-pulse rounded bg-white/5" />
      <div className="space-y-4 pt-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border border-white/8 bg-white/5"
          />
        ))}
      </div>
    </div>
  );
}

function PressSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
      <div className="h-4 w-56 animate-pulse rounded bg-white/5" />
      <div className="grid gap-3 pt-2 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg border border-white/8 bg-white/5"
          />
        ))}
      </div>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-32 animate-pulse rounded bg-white/10" />
      <div className="h-4 w-56 animate-pulse rounded bg-white/5" />
      <div className="space-y-4 pt-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-lg bg-white/5 p-4"
          >
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-full animate-pulse rounded bg-white/5" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PackagesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-44 animate-pulse rounded bg-white/10" />
      <div className="h-4 w-60 animate-pulse rounded bg-white/5" />
      <div className="space-y-4 pt-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-lg border border-white/8 bg-white/5"
          />
        ))}
      </div>
    </div>
  );
}

function EventsSidebarSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-2.5"
        >
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-md bg-white/10" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="h-2.5 w-1/2 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamSidebarSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-lg border border-white/8 bg-white/5 p-3"
        />
      ))}
    </div>
  );
}

export {
  EndorsementsSkeleton,
  PressSkeleton,
  ReviewsSkeleton,
  PackagesSkeleton,
  EventsSidebarSkeleton,
  TeamSidebarSkeleton,
};
