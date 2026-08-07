import { DjGridSkeleton, FilterPanelSkeleton } from "@/components/ui/skeletons";
import { AudioLines, Headphones } from "lucide-react";

export default function DirectoryLoading() {
  return (
    <>
      {/* Hero Banner — mirrors new directory page design */}
      <section className="bg-h_blackLight/30 border-b border-gray-800 px-4 py-10 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center md:px-8">
          {/* Left — icon box + title + subtitle */}
          <div className="flex items-center gap-4">
            <div className="bg-h_red/10 border-h_red/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
              <AudioLines className="text-h_red/80 h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-h_white text-3xl font-bold md:text-5xl">
                DJ <span className="text-h_red/80/80">Directory</span>
              </h1>
              <p className="text-sm tracking-wide text-gray-400">
                Browse and discover talented DJs from around the world.
              </p>
            </div>
          </div>
          {/* Right — badge skeleton */}
          <div className="bg-h_blackLight/60 h-7 w-28 animate-pulse rounded-full" />
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-6 py-6 xl:flex-row">
          {/* Filter skeleton */}
          <div className="shrink-0 xl:block xl:w-[20%]">
            <FilterPanelSkeleton />
          </div>

          {/* DJ Grid skeleton */}
          <div className="w-full">
            <DjGridSkeleton count={12} />
          </div>
        </div>
      </div>
    </>
  );
}
