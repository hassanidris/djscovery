import { Suspense } from "react";
import { getNavUser } from "@/lib/auth/getNavUser";
import { createClient } from "@/lib/supabase/server";
import { getSavedEventIds } from "@/lib/actions/follows";
import { getTrendingEvents, getNewEvents } from "@/lib/queries/events";
import Hero from "@/components/Hero";
import HomeFeaturedDJs from "@/components/home/HomeFeaturedDJs";
import HomeTrendingDJs from "@/components/home/HomeTrendingDJs";
import HomeDJsTabsAsync from "@/components/home/HomeDJsTabsAsync";
import { EventsSection } from "@/components/events/EventsSection";
import HomeOpenGigsSection from "@/components/home/HomeOpenGigsSection";
import HomeGenresSection from "@/components/home/HomeGenresSection";
import HomeCtaBanner from "@/components/home/HomeCtaBanner";
import HomeFaqSection from "@/components/home/HomeFaqSection";
import {
  HomeDJsTabsSkeleton,
  HomeGigsSectionSkeleton,
} from "@/components/ui/skeletons";

const Homepage = async () => {
  const navData = await getNavUser();
  const isDj = navData.navRole === "dj" || navData.navRole === "admin";

  // Get user ID for saved events
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch events data
  const [trendingEvents, newEvents, savedEventIds] = await Promise.all([
    getTrendingEvents(6),
    getNewEvents(6),
    user ? getSavedEventIds() : [],
  ]);

  return (
    <div className="flex flex-col">
      {/* Video hero */}
      <Hero />

      {/* Featured DJs */}
      <HomeFeaturedDJs />

      {/* Trending DJs */}
      <HomeTrendingDJs />

      {/* DJ rows with tabs — streams independently */}
      <Suspense fallback={<HomeDJsTabsSkeleton />}>
        <HomeDJsTabsAsync />
      </Suspense>

      {/* Trending Events */}
      <EventsSection
        title="Trending Events"
        events={trendingEvents}
        viewAllHref="/events"
        savedEventIds={savedEventIds}
      />

      {/* New Events */}
      <EventsSection
        title="New Events"
        events={newEvents}
        viewAllHref="/events"
        savedEventIds={savedEventIds}
      />

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

      {/* FAQ — remove objections before final CTA */}
      <HomeFaqSection />

      {/* CTA Banner */}
      <HomeCtaBanner />

      {/* Browse by Genre */}
      <HomeGenresSection />
    </div>
  );
};

export default Homepage;
