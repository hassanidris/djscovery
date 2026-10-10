import { Skeleton } from "@/components/ui/skeleton";

function DjLayoutHeaderSkeleton() {
  return (
    <div className="mb-8 flex items-center gap-4">
      <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        <Skeleton className="h-4 w-28 rounded" />
      </div>
    </div>
  );
}

function DjNavSkeleton() {
  return (
    <div className="w-full shrink-0 md:w-48 lg:w-56">
      <div className="flex flex-col gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function DjLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <DjLayoutHeaderSkeleton />

        {/* Sidebar + main content */}
        <div className="flex flex-col gap-6 md:flex-row md:gap-12">
          <DjNavSkeleton />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
