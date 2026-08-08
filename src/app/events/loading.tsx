import { CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Banner — mirrors /events page */}
      <section className="bg-h_blackLight/30 border-b border-gray-800 px-4 py-10 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center md:px-8">
          <div className="flex items-center gap-4">
            <div className="bg-h_red/10 border-h_red/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
              <CalendarDays className="text-h_redLight h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-h_white text-2xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                DJ <span className="text-h_redLight/80">Events</span>
              </h1>
              <p className="text-sm leading-relaxed text-gray-400">
                Discover DJ events happening around the world.
              </p>
            </div>
          </div>
          <div className="h-7 w-28 animate-pulse rounded-full bg-white/5" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        {/* Tab bar */}
        <div className="mb-8 flex gap-1 border-b border-zinc-800">
          <Skeleton className="h-10 w-24 rounded-t" />
          <Skeleton className="h-10 w-20 rounded-t" />
        </div>

        {/* Event grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl bg-white/5">
              <Skeleton className="aspect-3/2 w-full rounded-none" />
              <div className="flex flex-col gap-2 p-4">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-full rounded" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <div className="mt-1 flex gap-3">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
