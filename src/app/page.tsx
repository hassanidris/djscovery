import { Suspense } from "react";
import { getNavUser } from "@/lib/auth/getNavUser";
import Hero from "@/components/Hero";
import HomeFeaturedDJs from "@/components/home/HomeFeaturedDJs";
import HomeDJsTabsAsync from "@/components/home/HomeDJsTabsAsync";
import HomeEventsSection from "@/components/home/HomeEventsSection";
import HomeOpenGigsSection from "@/components/home/HomeOpenGigsSection";
import HomeGenresSection from "@/components/home/HomeGenresSection";
import HomeCtaBanner from "@/components/home/HomeCtaBanner";
import {
  HomeDJsTabsSkeleton,
  HomeEventsSectionSkeleton,
  HomeGigsSectionSkeleton,
} from "@/components/ui/skeletons";

const Homepage = async () => {
  const navData = await getNavUser();
  const isDj = navData.navRole === "dj" || navData.navRole === "admin";

  return (
    <div className="flex flex-col">
      {/* Video hero */}
      <Hero />

      {/* Featured DJs */}
      <HomeFeaturedDJs />

      {/* DJ rows with tabs — streams independently */}
      <Suspense fallback={<HomeDJsTabsSkeleton />}>
        <HomeDJsTabsAsync />
      </Suspense>

      {/* Upcoming Events — streams independently */}
      <Suspense fallback={<HomeEventsSectionSkeleton />}>
        <HomeEventsSection userCountryName={null} />
      </Suspense>

      {/* Open Gigs — visible to DJs only, streams independently */}
      {isDj && (
        <Suspense fallback={<HomeGigsSectionSkeleton />}>
          <HomeOpenGigsSection
            isDj={isDj}
            countryId={null}
            countryName={null}
          />
        </Suspense>
      )}

      {/* CTA Banner */}
      <HomeCtaBanner />

      {/* Browse by Genre */}
      <HomeGenresSection />
    </div>
  );
};

export default Homepage;
