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
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-32 rounded" />
        <Skeleton className="mt-2 h-4 w-64 rounded" />
      </div>

      {/* Alerts row */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-48 rounded" />
        <Skeleton className="h-10 w-48 rounded" />
      </div>

      {/* Stats grid */}
      <div>
        <Skeleton className="mb-4 h-5 w-32 rounded" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded" />
          ))}
        </div>
      </div>

      {/* Content stats */}
      <div>
        <Skeleton className="mb-4 h-5 w-32 rounded" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded" />
          ))}
        </div>
      </div>

      {/* Operations stats */}
      <div>
        <Skeleton className="mb-4 h-5 w-32 rounded" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded" />
          ))}
        </div>
      </div>

      {/* Pending actions */}
      <div>
        <Skeleton className="mb-4 h-5 w-32 rounded" />
        <Skeleton className="h-24 rounded" />
      </div>

      {/* DJ Approval Queue */}
      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      {/* Recent Users */}
      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      {/* Recent Reports */}
      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      {/* Review Management */}
      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      {/* Recent Activity */}
      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      {/* Trending Metrics */}
      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      {/* Geographic Distribution */}
      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      {/* Genre Breakdown */}
      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>
    </div>
  );
}
