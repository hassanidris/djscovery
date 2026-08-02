import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizerProfileId: string }> },
) {
  const { organizerProfileId: organizerProfileIdParam } = await params;
  const organizerProfileId = parseInt(organizerProfileIdParam, 10);
  if (Number.isNaN(organizerProfileId)) {
    return NextResponse.json({ error: "Invalid organizer profile ID" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (limit < 1 || limit > 50) {
    return NextResponse.json({ error: "Limit must be between 1 and 50" }, { status: 400 });
  }

  if (offset < 0) {
    return NextResponse.json({ error: "Offset must be non-negative" }, { status: 400 });
  }

  try {
    const reviews = await prisma.organizerReview.findMany({
      where: { organizerProfileId },
      include: {
        djProfile: {
          select: {
            slug: true,
            stageName: true,
            avatar: true,
            status: true,
            city: { select: { name: true } },
            country: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const totalCount = await prisma.organizerReview.count({
      where: { organizerProfileId },
    });

    const avgRating =
      totalCount > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      reviews,
      avgRating,
      totalCount,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching organizer reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}