"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { ActionResult, actionError, actionSuccess } from "./action-result";

export interface ReviewExportData {
  reviews: Array<{
    id: number;
    rating: number;
    review: string | null;
    reviewType: string | null;
    reviewerName: string;
    reviewerEmail: string | null;
    eventTitle: string | null;
    eventDate: string | null;
    helpfulCount: number;
    response: string | null;
    respondedAt: string | null;
    createdAt: string;
  }>;
  summary: {
    totalReviews: number;
    averageRating: number;
    directCount: number;
    eventCount: number;
    helpfulCount: number;
  };
}

export async function exportDjReviews(
  djProfileId: number,
): Promise<ActionResult<ReviewExportData>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("Unauthorized");

  // Check if user owns this DJ profile
  const djProfile = await prisma.djProfile.findUnique({
    where: { id: djProfileId },
    select: { userId: true },
  });

  if (!djProfile) {
    return actionError("DJ profile not found");
  }

  if (djProfile.userId !== user.id) {
    return actionError("You can only export reviews for your own profile");
  }

  // Fetch all reviews with user and event data
  const reviews = await prisma.djRating.findMany({
    where: { djProfileId },
    include: {
      user: {
        select: { name: true, email: true },
      },
      event: {
        select: { title: true, startDate: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Transform data for export
  const exportData = reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    review: review.review,
    reviewType: review.reviewType,
    reviewerName: review.user.name || "Unknown",
    reviewerEmail: review.user.email,
    eventTitle: review.event?.title || null,
    eventDate: review.event?.startDate?.toISOString() || null,
    helpfulCount: (review as any).helpfulCount || 0,
    response: (review as any).response || null,
    respondedAt: (review as any).respondedAt?.toISOString() || null,
    createdAt: review.createdAt.toISOString(),
  }));

  // Calculate summary
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;
  const directCount = reviews.filter((r) => !r.eventId).length;
  const eventCount = reviews.filter((r) => r.eventId).length;
  const helpfulCount = reviews.reduce(
    (sum, r) => sum + ((r as any).helpfulCount || 0),
    0,
  );

  return actionSuccess({
    reviews: exportData,
    summary: {
      totalReviews,
      averageRating,
      directCount,
      eventCount,
      helpfulCount,
    },
  });
}

export function generateCSV(data: ReviewExportData): string {
  const headers = [
    "ID",
    "Rating",
    "Review",
    "Review Type",
    "Reviewer Name",
    "Reviewer Email",
    "Event Title",
    "Event Date",
    "Helpful Count",
    "DJ Response",
    "Response Date",
    "Created At",
  ];

  const rows = data.reviews.map((review) => [
    review.id,
    review.rating,
    `"${(review.review || "").replace(/"/g, '""')}"`,
    review.reviewType || "",
    `"${review.reviewerName.replace(/"/g, '""')}"`,
    review.reviewerEmail || "",
    `"${(review.eventTitle || "").replace(/"/g, '""')}"`,
    review.eventDate || "",
    review.helpfulCount,
    `"${(review.response || "").replace(/"/g, '""')}"`,
    review.respondedAt || "",
    review.createdAt,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
}

export function generateJSON(data: ReviewExportData): string {
  return JSON.stringify(data, null, 2);
}
