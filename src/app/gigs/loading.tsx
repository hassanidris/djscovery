import { Briefcase } from "lucide-react";
import { GigGridSkeleton } from "@/components/gigs/GigSkeleton";

export default function GigsLoading() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Banner — mirrors /gigs page */}
      <section className="bg-h_blackLight/30 border-b border-gray-800 px-4 py-10 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center md:px-8">
          <div className="flex items-center gap-4">
            <div className="bg-h_red/10 border-h_red/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
              <Briefcase className="text-h_redLight h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-h_white text-2xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Open <span className="text-h_redLight/80">Gigs</span>
              </h1>
              <p className="text-sm leading-relaxed text-gray-400">
                Browse all available gig opportunities from organizers looking
                to hire DJs
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        {/* Filters placeholder */}
        <div className="mb-8 flex justify-end">
          <div className="h-10 w-32 animate-pulse rounded bg-zinc-800" />
        </div>

        {/* Gig grid skeleton */}
        <GigGridSkeleton />
      </div>
    </div>
  );
}
