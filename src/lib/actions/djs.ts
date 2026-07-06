"use server";

import prisma from "@/lib/client";
import { PREMIUM_DEMO_DJS } from "@/data/djs";

export type FeaturedDj = {
  id: number;
  slug: string;
  stageName: string;
  avatar: string | null;
  bio: string | null;
  genres: { genre: { name: string } }[];
  city: { name: string } | null;
  country: { name: string } | null;
  reputationScore: number;
  _avg: { rating: number | null } | null;
  _count: { ratings: number; followers: number };
};

/**
 * Fetch featured DJs for homepage.
 * Hybrid approach: includes admin-featured DJs (featured=true) AND high-reputation DJs (reputationScore >= 800)
 * Falls back to demo data in non-production environments.
 */
export async function getFeaturedDJs(): Promise<FeaturedDj[]> {
  const isProduction = process.env.NEXT_PUBLIC_APP_ENV === "production";

  if (!isProduction) {
    // Use demo data for staging/development
    const demoDJs = [...PREMIUM_DEMO_DJS]
      .sort(
        (a, b) =>
          b.stats.rating - a.stats.rating ||
          b.stats.followers - a.stats.followers,
      )
      .slice(0, 3)
      .map((dj) => ({
        id: 0, // Demo data has no real ID
        slug: dj.slug,
        stageName: dj.stageName,
        avatar: dj.avatar.url,
        bio: dj.bio,
        genres: dj.genres.map((g) => ({ genre: { name: g } })),
        city: { name: dj.location.city },
        country: { name: dj.location.country },
        reputationScore: 0,
        _avg: { rating: dj.stats.rating },
        _count: { ratings: 0, followers: dj.stats.followers },
      }));
    return demoDJs;
  }

  const featuredDJs = await prisma.djProfile.findMany({
    where: {
      OR: [
        { featured: true }, // Admin-pinned
        { reputationScore: { gte: 800 } }, // Auto-featured for high reputation
      ],
      status: "APPROVED",
      hidden: false,
      deletedAt: null,
    },
    orderBy: { searchScore: "desc" },
    take: 3,
    select: {
      id: true,
      slug: true,
      stageName: true,
      avatar: true,
      bio: true,
      genres: { select: { genre: { select: { name: true } } } },
      city: { select: { name: true } },
      country: { select: { name: true } },
      reputationScore: true,
      _count: { select: { ratings: true, followers: true } },
    },
  });

  // Calculate average rating for each DJ
  const djsWithAvg = await Promise.all(
    featuredDJs.map(async (dj) => {
      const avg = await prisma.djRating.aggregate({
        where: { djProfileId: dj.id },
        _avg: { rating: true },
      });
      return { ...dj, _avg: avg._avg };
    }),
  );

  return djsWithAvg;
}
