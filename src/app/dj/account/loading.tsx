import { Skeleton } from "@/components/ui/skeleton";

export default function DjAccountLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40 rounded" />
        <Skeleton className="h-4 w-80 rounded" />
      </div>

      {Array.from({ length: 4 }).map((_, sectionIndex) => (
        <div key={sectionIndex} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-3 w-56 rounded" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-10 flex-1 rounded" />
            <Skeleton className="h-10 w-32 rounded" />
          </div>
          {sectionIndex === 3 && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-3 w-56 rounded" />
                </div>
                <Skeleton className="h-9 w-32 rounded" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
