import { Skeleton } from "@/components/ui/skeleton";

export default function DjSettingsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40 rounded" />
        <Skeleton className="h-4 w-72 rounded" />
      </div>

      <div className="flex w-full flex-wrap gap-1 bg-white/5 p-0.75">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-md" />
        ))}
      </div>

      <div className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-5">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-9 w-32 rounded" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-24 w-full rounded" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32 rounded" />
        </div>
      </div>
    </div>
  );
}
