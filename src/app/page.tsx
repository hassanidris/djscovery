import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getNavUser } from "@/lib/auth/getNavUser";
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

const DEMO_NEW_DJS: DemoDJ[] = ALL_DEMO_DJS.slice(0, 8).map(toDemoDJ);
const DEMO_TRENDING_DJS: DemoDJ[] = [...ALL_DEMO_DJS]
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

  const navData = await getNavUser();
  const isDj = navData.navRole === "dj" || navData.navRole === "admin";

  let djCountryId: number | null = null;
  let djCountryName: string | null = null;
  if (isDj && user) {
    try {
      const djProfile = await prisma.djProfile.findUnique({
        where: { userId: user.id, deletedAt: null },
        select: { countryId: true, country: { select: { name: true } } },
      });
      djCountryId = djProfile?.countryId ?? null;
      djCountryName = djProfile?.country?.name ?? null;
    } catch {
      // ignore
    }
  }

  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging";

  let dbNewDJs: DemoDJ[] = [];
  let dbTrendingDJs: DemoDJ[] = [];

  try {
    const [recentProfiles, trendingCandidates] = await Promise.all([
      prisma.djProfile.findMany({
        where: { deletedAt: null, status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          user: { include: { _count: { select: { followers: true } } } },
          country: { select: { name: true } },
          city: { select: { name: true } },
          genres: { include: { genre: { select: { name: true } } } },
          ratings: { select: { rating: true } },
        },
      }),
      prisma.djProfile.findMany({
        where: { deletedAt: null, status: "APPROVED" },
        include: {
          user: { include: { _count: { select: { followers: true } } } },
          country: { select: { name: true } },
          city: { select: { name: true } },
          genres: { include: { genre: { select: { name: true } } } },
          ratings: { select: { rating: true } },
        },
      }),
    ]);

    const toHomeDJ = (p: (typeof recentProfiles)[number]): DemoDJ => ({
      id: String(p.id),
      stageName: p.stageName,
      avatar: p.avatar ?? "/noAvatar.png",
      genres: p.genres.map((g) => g.genre.name),
      city: p.city?.name ?? "",
      country: p.country?.name ?? "",
      rating:
        p.ratings.length > 0
          ? Math.round(
              (p.ratings.reduce((sum, r) => sum + r.rating, 0) /
                p.ratings.length) *
                10,
            ) / 10
          : 0,
      followers: p.user._count.followers,
      slug: p.slug,
      isPremium: p.plan === "PREMIUM",
    });

    dbNewDJs = recentProfiles.map(toHomeDJ);
    dbTrendingDJs = trendingCandidates
      .map(toHomeDJ)
      .sort((a, b) => b.rating - a.rating || b.followers - a.followers)
      .slice(0, 10);
  } catch {
    // DB unavailable — fall through to demo data
  }

  const dbSlugs = new Set(dbNewDJs.map((d) => d.slug));
  const newDJs = isStaging
    ? [...dbNewDJs, ...DEMO_NEW_DJS.filter((d) => !dbSlugs.has(d.slug))].slice(
        0,
        8,
      )
    : dbNewDJs.length > 0
      ? dbNewDJs
      : DEMO_NEW_DJS;

  const trendingSlugs = new Set(dbTrendingDJs.map((d) => d.slug));
  const trendingSource = isStaging
    ? [
        ...dbTrendingDJs,
        ...DEMO_TRENDING_DJS.filter((d) => !trendingSlugs.has(d.slug)),
      ]
    : dbTrendingDJs.length > 0
      ? dbTrendingDJs
      : DEMO_TRENDING_DJS;

  const trendingDJs = [...trendingSource]
    .sort((a, b) => b.rating - a.rating || b.followers - a.followers)
    .slice(0, 10);

  return (
    <div className="flex flex-col">
      {/* Video hero */}
      <Hero />

      {/* Featured DJs */}
      <HomeFeaturedDJs />

      {/* DJ rows with tabs */}
      <HomeDJsTabs newDJs={newDJs} trendingDJs={trendingDJs} />

      {/* Upcoming Events */}
      <HomeEventsSection />

      {/* Open Gigs — visible to DJs only, filtered by DJ's country */}
      <HomeOpenGigsSection
        isDj={isDj}
        countryId={djCountryId}
        countryName={djCountryName}
      />

      {/* Community Highlights */}
      <HomeCommunityHighlights />

      {/* CTA Banner */}
      <HomeCtaBanner />

      {/* Browse by Genre */}
      <HomeGenresSection />

      {/* CTA section */}
      <div className="flex flex-col items-center justify-center gap-8 border-t border-white/5 px-4 py-16">
        {user ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-gray-300">
              Signed in as <span className="text-h_red">{user.email}</span>
            </p>
            <div className="flex gap-4">
              <Button
                asChild
                className="bg-h_red hover:bg-h_redDark h-auto px-6 py-3 font-semibold text-white"
              >
                <Link href="/community">Community</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-h_red text-h_red hover:bg-h_red h-auto px-6 py-3 font-semibold hover:text-white"
              >
                <Link href="/directory">Browse DJs</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-lg text-gray-400">
              Join the world&apos;s first DJ community platform
            </p>
            <div className="flex gap-4">
              <Button
                asChild
                variant="outline"
                className="border-h_red text-h_red hover:bg-h_red h-auto px-6 py-3 font-semibold hover:text-white"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button
                asChild
                className="bg-h_red hover:bg-h_redDark h-auto px-6 py-3 font-semibold text-white"
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
