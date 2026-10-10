import { Skeleton } from "@/components/ui/skeleton";

function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/8 bg-white/3 p-5">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-32 rounded" />
        <Skeleton className="mt-2 h-4 w-64 rounded" />
      </div>

      <div className="flex gap-3">
        <Skeleton className="h-10 w-48 rounded" />
        <Skeleton className="h-10 w-48 rounded" />
      </div>

      <div>
        <Skeleton className="mb-4 h-5 w-32 rounded" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded" />
          ))}
        </div>
      </div>

      <div>
        <Skeleton className="mb-4 h-5 w-32 rounded" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded" />
          ))}
        </div>
      </div>

      <div>
        <Skeleton className="mb-4 h-5 w-32 rounded" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded" />
          ))}
        </div>
      </div>

      <div>
        <Skeleton className="mb-4 h-5 w-32 rounded" />
        <Skeleton className="h-24 rounded" />
      </div>

      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>
    </div>
  );
}
