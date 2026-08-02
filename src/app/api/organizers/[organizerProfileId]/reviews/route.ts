import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizerProfileId: string }> },
) {
  const { organizerProfileId: organizerProfileIdParam } = await params;
  const organizerProfileId = parseInt(organizerProfileIdParam, 10);
  if (Number.isNaN(organizerProfileId)) {
    return NextResponse.json(
      { error: "Invalid organizer profile ID" },
      { status: 400 },
    );
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (Number.isNaN(limit)) {
    return NextResponse.json(
      { error: "Invalid limit: must be a number" },
      { status: 400 },
    );
  }

  if (Number.isNaN(offset)) {
    return NextResponse.json(
      { error: "Invalid offset: must be a number" },
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
    const reviews = await prisma.organizerReview.findMany({
      where: { organizerProfileId },
      select: {
        id: true,
        communication: true,
        payment: true,
        professionalism: true,
        venueQuality: true,
        rating: true,
        review: true,
        gigId: true,
        djProfileId: true,
        organizerProfileId: true,
        createdAt: true,
        updatedAt: true,
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

    const stats = await prisma.organizerReview.aggregate({
      where: { organizerProfileId },
      _count: { rating: true },
      _avg: { rating: true },
    });

    const totalCount = stats._count.rating;
    const avgRating = stats._avg.rating ?? 0;

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
