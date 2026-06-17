import { Skeleton } from "@/components/ui/skeleton";
import {
  HomeFeaturedDJsSkeleton,
  HomeDJsTabsSkeleton,
  HomeEventsSectionSkeleton,
} from "@/components/ui/skeletons";

function HeroSkeleton() {
  return (
    <div className="relative flex min-h-[70vh] items-end overflow-hidden bg-black">
      <Skeleton className="absolute inset-0 rounded-none opacity-40" />
      <div className="relative z-10 w-full px-4 pb-16 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-12 w-72 rounded md:w-96" />
          <Skeleton className="h-12 w-56 rounded md:w-80" />
          <Skeleton className="mt-2 h-5 w-80 rounded md:w-120" />
          <div className="mt-4 flex gap-3">
            <Skeleton className="h-11 w-36 rounded-lg" />
            <Skeleton className="h-11 w-36 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomeLoading() {
  return (
    <div className="flex flex-col">
      <HeroSkeleton />
      <HomeFeaturedDJsSkeleton />
      <HomeDJsTabsSkeleton />
      <HomeEventsSectionSkeleton />
    </div>
  );
}
