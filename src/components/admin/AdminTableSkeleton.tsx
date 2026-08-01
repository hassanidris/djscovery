import { Skeleton } from "@/components/ui/skeleton";

export default function AdminTableSkeleton({
  cols = 6,
  rows = 8,
  includeHeader = true,
}: {
  cols?: number;
  rows?: number;
  includeHeader?: boolean;
}) {
  return (
    <div className="space-y-6">
      {includeHeader && (
        <>
          <div className="space-y-2">
            <Skeleton className="h-8 w-40 bg-white/5" />
            <Skeleton className="h-4 w-64 bg-white/5" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-9 w-56 bg-white/5" />
            <Skeleton className="h-9 w-40 bg-white/5" />
            <Skeleton className="h-9 w-40 bg-white/5" />
          </div>
        </>
      )}

      <div className="overflow-hidden rounded-xl border border-white/8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/2">
                {Array.from({ length: cols }).map((_, i) => (
                  <th key={i} className="px-4 py-3 text-left">
                    <Skeleton className="h-4 w-20 bg-white/5" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {Array.from({ length: rows }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: cols }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton
                        className="h-4 bg-white/5"
                        style={{ width: `${60 + ((i * cols + j) % 5) * 12}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
