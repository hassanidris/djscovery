import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizerNotificationsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48 rounded" />
        <Skeleton className="h-4 w-full max-w-md rounded" />
      </div>

      <div className="flex flex-col gap-1 overflow-hidden rounded-xl border border-white/10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center justify-between gap-4 px-5 py-4 ${
              i > 0 ? "border-t border-white/5" : ""
            }`}
          >
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-56 rounded" />
            </div>
            <Skeleton className="h-5 w-9 shrink-0 rounded-full" />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Skeleton className="h-3 w-20 rounded" />
        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 px-5 py-4 opacity-60">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-56 rounded" />
          </div>
          <Skeleton className="h-5 w-9 shrink-0 rounded-full" />
        </div>
      </div>

      <Skeleton className="h-10 w-36 rounded-lg" />
    </div>
  );
}
