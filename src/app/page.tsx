import { createClient } from "@/lib/supabase/server";
import Hero from "@/components/Hero";
import HomeDJsTabs from "@/components/home/HomeDJsTabs";
import type { DemoDJ } from "@/components/home/HomeDJsRow";
import { ALL_DEMO_DJS } from "@/data/djs";
import HomeEventsSection from "@/components/home/HomeEventsSection";
import HomeFeaturedDJs from "@/components/home/HomeFeaturedDJs";
import HomeGenresSection from "@/components/home/HomeGenresSection";
import HomeOpenGigsSection from "@/components/home/HomeOpenGigsSection";
import HomeCommunityHighlights from "@/components/home/HomeCommunityHighlights";
import HomeCtaBanner from "@/components/home/HomeCtaBanner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const toDemoDJ = (dj: (typeof ALL_DEMO_DJS)[number]): DemoDJ => ({
  id: dj.id,
  stageName: dj.stageName,
  avatar: dj.avatar.url,
  genres: dj.genres,
  city: dj.location.city,
  country: dj.location.country,
  rating: dj.stats.rating,
  followers: dj.stats.followers,
  slug: dj.slug,
  isPremium: dj.plan === "premium",
});

const NEW_DJS: DemoDJ[] = ALL_DEMO_DJS.slice(0, 8).map(toDemoDJ);
const TRENDING_DJS: DemoDJ[] = [...ALL_DEMO_DJS]
  .sort(
    (a, b) =>
      b.stats.rating - a.stats.rating || b.stats.followers - a.stats.followers,
  )
  .slice(0, 10)
  .map(toDemoDJ);

const Homepage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col">
      {/* Video hero */}
      <Hero />

      {/* Featured DJs */}
      <HomeFeaturedDJs />

      {/* DJ rows with tabs */}
      <HomeDJsTabs newDJs={NEW_DJS} trendingDJs={TRENDING_DJS} />

      {/* Upcoming Events */}
      <HomeEventsSection />

      {/* Open Gigs */}
      <HomeOpenGigsSection />

      {/* Community Highlights */}
      <HomeCommunityHighlights />

      {/* CTA Banner */}
      <HomeCtaBanner />

      {/* Browse by Genre */}
      <HomeGenresSection />

      {/* CTA section */}
      <div className="flex flex-col items-center justify-center gap-8 py-16 px-4 border-t border-white/5">
        {user ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-300 text-sm">
              Signed in as <span className="text-h_red">{user.email}</span>
            </p>
            <div className="flex gap-4">
              <Button
                asChild
                className="bg-h_red hover:bg-h_redDark text-white font-semibold h-auto py-3 px-6"
              >
                <Link href="/community">Community</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-h_red text-h_red hover:bg-h_red hover:text-white font-semibold h-auto py-3 px-6"
              >
                <Link href="/directory">Browse DJs</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-gray-400 text-lg">
              Join the world&apos;s first DJ community platform
            </p>
            <div className="flex gap-4">
              <Button
                asChild
                variant="outline"
                className="border-h_red text-h_red hover:bg-h_red hover:text-white font-semibold h-auto py-3 px-6"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button
                asChild
                className="bg-h_red hover:bg-h_redDark text-white font-semibold h-auto py-3 px-6"
              >
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
