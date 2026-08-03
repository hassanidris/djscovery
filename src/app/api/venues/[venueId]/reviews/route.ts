import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> },
) {
  const { venueId: venueIdParam } = await params;
  const venueId = parseInt(venueIdParam, 10);
  if (Number.isNaN(venueId)) {
    return NextResponse.json({ error: "Invalid venue ID" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (!Number.isFinite(limit)) {
    return NextResponse.json(
      { error: "Limit must be a valid number" },
      { status: 400 },
    );
  }

  if (!Number.isFinite(offset)) {
    return NextResponse.json(
      { error: "Offset must be a valid number" },
      { status: 400 },
    );
  }

  if (limit < 1 || limit > 50) {
    return NextResponse.json(
      { error: "Limit must be between 1 and 50" },
      { status: 400 },
    );
  }

  if (offset < 0) {
    return NextResponse.json(
      { error: "Offset must be non-negative" },
      { status: 400 },
    );
  }

  try {
    const reviews = await prisma.venueReview.findMany({
      where: { venueId },
      include: {
        user: {
          select: {
            username: true,
            image: true,
          },
        },
        event: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const totalCount = await prisma.venueReview.count({
      where: { venueId },
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
    console.error("Error fetching venue reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}
