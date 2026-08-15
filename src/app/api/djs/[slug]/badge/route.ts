import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";

export const dynamic = "force-dynamic";

interface BadgeParams {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    theme?: "light" | "dark";
    size?: "small" | "medium" | "large";
    showRating?: "true" | "false";
    showCount?: "true" | "false";
  }>;
}

export async function GET(
  request: NextRequest,
  { params, searchParams }: BadgeParams
) {
  const { slug } = await params;
  const {
    theme = "dark",
    size = "medium",
    showRating = "true",
    showCount = "true",
  } = await searchParams;

  try {
    const djProfile = await prisma.djProfile.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        stageName: true,
        avatar: true,
        _count: {
          select: { ratings: true },
        },
      },
    });

    if (!djProfile) {
      return NextResponse.json({ error: "DJ not found" }, { status: 404 });
    }

    const ratingAgg = await prisma.djRating.aggregate({
      where: { djProfileId: djProfile.id },
      _avg: { rating: true },
    });

    const avgRating = ratingAgg._avg.rating
      ? Math.round(ratingAgg._avg.rating * 10) / 10
      : 0;
    const reviewCount = djProfile._count.ratings;

    const badgeData = {
      dj: {
        slug: djProfile.slug,
        stageName: djProfile.stageName,
        avatar: djProfile.avatar,
      },
      stats: {
        avgRating,
        reviewCount,
      },
      config: {
        theme,
        size,
        showRating: showRating === "true",
        showCount: showCount === "true",
      },
      profileUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://djscovery.com"}/djs/${slug}`,
    };

    return NextResponse.json(badgeData);
  } catch (error) {
    console.error("Error fetching badge data:", error);
    return NextResponse.json(
      { error: "Failed to fetch badge data" },
      { status: 500 }
    );
  }
}
