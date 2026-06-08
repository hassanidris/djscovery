import { DjGridSkeleton, FilterPanelSkeleton } from "@/components/ui/skeletons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeadphones } from "@fortawesome/free-solid-svg-icons";

export default function DirectoryLoading() {
  return (
    <>
      {/* Hero Banner — mirrors actual page header to avoid layout shift */}
      <section className="bg-h_blackLight/30 border-b border-gray-800 py-10 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <div className="flex flex-col gap-2 max-w-7xl w-full mx-auto px-4 md:px-8">
          <h1 className="text-h_white font-bold text-3xl md:text-5xl">
            DJ{" "}
            <span className="text-h_red/80">
              Directory{" "}
              <FontAwesomeIcon
                icon={faHeadphones}
                className="w-8 h-8 md:w-10 md:h-10 inline"
              />
            </span>
          </h1>
          <p className="text-gray-400 text-sm tracking-wide">
            Browse and discover talented DJs from around the world.
          </p>
          <div className="h-3 w-20 bg-h_blackLight/60 rounded-full animate-pulse mt-1" />
        </div>
      </section>

      <div className="max-w-7xl w-full mx-auto px-4 md:px-8">
        <div className="flex flex-col xl:flex-row gap-6 py-6">
          {/* Filter skeleton */}
          <div className="xl:block xl:w-[20%] shrink-0">
            <FilterPanelSkeleton />
          </div>

          {/* DJ Grid skeleton */}
          <div className="w-full">
            <DjGridSkeleton count={9} />
          </div>
        </div>
      </div>
    </>
  );
}
