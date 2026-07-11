import { Skeleton } from "@/components/ui/skeleton";

export default function DjApplicationsLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="mb-2 space-y-2">
        <Skeleton className="h-7 w-40 rounded" />
        <Skeleton className="h-4 w-48 rounded" />
      </div>

      {/* Sections */}
      {Array.from({ length: 2 }).map((_, sectionIndex) => (
        <section key={sectionIndex}>
          <Skeleton className="mb-3 h-3 w-28 rounded" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <ApplicationRowSkeleton key={i} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ApplicationRowSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <Skeleton className="mt-0.5 h-9 w-9 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}
