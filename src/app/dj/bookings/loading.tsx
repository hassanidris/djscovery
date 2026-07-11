import { Skeleton } from "@/components/ui/skeleton";

export default function DjBookingsLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="mb-2 space-y-2">
        <Skeleton className="h-7 w-40 rounded" />
        <Skeleton className="h-4 w-3/4 max-w-xl rounded" />
      </div>

      {/* Tabs */}
      <div className="flex w-fit gap-1 rounded-lg bg-white/5 p-0.75">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-28 rounded-md" />
        ))}
      </div>

      {/* Booking inquiry cards */}
      <div className="space-y-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <BookingInquirySkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function BookingInquirySkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-5 w-16 rounded" />
          </div>
          <Skeleton className="h-14 w-56 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
        </div>
        <Skeleton className="h-3 w-28 rounded" />
      </div>

      {/* Conversation */}
      <div className="mt-5 space-y-3">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-16 w-3/4 rounded-lg" />
      </div>

      {/* Respond section */}
      <div className="mt-5 rounded-xl border border-white/10 bg-white/3 p-4">
        <Skeleton className="mb-3 h-4 w-32 rounded" />
        <Skeleton className="mb-3 h-20 w-full rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded" />
          <Skeleton className="h-9 w-20 rounded" />
        </div>
      </div>

      {/* Message section */}
      <div className="mt-4 rounded-xl border border-white/10 bg-white/3 p-4">
        <Skeleton className="mb-3 h-4 w-28 rounded" />
        <Skeleton className="mb-3 h-20 w-full rounded-lg" />
        <div className="flex justify-end">
          <Skeleton className="h-9 w-28 rounded" />
        </div>
      </div>
    </div>
  );
}
