import prisma from "@/lib/client";
import { ALL_DEMO_DJS } from "@/data/djs";
import HomeDJsTabs from "@/components/home/HomeDJsTabs";
import type { DemoDJ } from "@/components/home/HomeDJsRow";

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

export default async function HomeDJsTabsAsync() {
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
          user: true,
          country: { select: { name: true } },
          city: { select: { name: true } },
          genres: { include: { genre: { select: { name: true } } } },
          ratings: { select: { rating: true } },
          _count: { select: { followers: true } },
        },
      }),
      prisma.djProfile.findMany({
        where: { deletedAt: null, status: "APPROVED" },
        include: {
          user: true,
          country: { select: { name: true } },
          city: { select: { name: true } },
          genres: { include: { genre: { select: { name: true } } } },
          ratings: { select: { rating: true } },
          _count: { select: { followers: true } },
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
      followers: p._count.followers,
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

  return <HomeDJsTabs newDJs={newDJs} trendingDJs={trendingDJs} />;
}
