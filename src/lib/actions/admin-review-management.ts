"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { ActionResult, actionError, actionSuccess } from "./action-result";

export interface AdminReviewManagementInput {
  action: "delete" | "hide" | "show";
  ratingId: number;
  reason?: string;
}

export async function manageReview(
  input: AdminReviewManagementInput,
): Promise<ActionResult<{ success: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("Unauthorized");

  // Check if user is admin
  const userRecord = await prisma.user.findUnique({
    where: { id: user.id },
    select: { roles: true },
  });

  if (!userRecord || !userRecord.roles.some((r) => r.role === "ADMIN")) {
    return actionError("Admin access required");
  }

  const review = await prisma.djRating.findUnique({
    where: { id: input.ratingId },
  });

  if (!review) {
    return actionError("Review not found");
  }

  switch (input.action) {
    case "delete":
      await prisma.djRating.delete({
        where: { id: input.ratingId },
      });
      break;
    case "hide":
      // We could add a hidden field to the schema, but for now we'll use a soft delete approach
      // by setting the review to null but keeping the rating
      await prisma.djRating.update({
        where: { id: input.ratingId },
        data: { review: null },
      });
      break;
    case "show":
      // This would be for restoring hidden reviews
      // For now, this is a placeholder
      break;
    default:
      return actionError("Invalid action");
  }

  // Log the admin action
  try {
    await prisma.adminActionLog.create({
      data: {
        adminId: user.id,
        action: input.action,
        targetType: "REVIEW",
        targetId: input.ratingId.toString(),
        metadata: input.reason ? { reason: input.reason } : undefined,
      },
    });
  } catch (logError) {
    console.error("Failed to log admin action:", logError);
  }

  return actionSuccess({ success: true });
}

export async function getReportedReviews(
  page = 1,
  limit = 20,
): Promise<ActionResult<{ reviews: any[]; total: number }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("Unauthorized");

  // Check if user is admin
  const userRecord = await prisma.user.findUnique({
    where: { id: user.id },
    select: { roles: true },
  });

  if (!userRecord || !userRecord.roles.some((r) => r.role === "ADMIN")) {
    return actionError("Admin access required");
  }

  // Get reported reviews (this would need a reports table, for now we'll get all reviews)
  const [reviews, total] = await Promise.all([
    prisma.djRating.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: { name: true, email: true },
        },
        djProfile: {
          select: { stageName: true, userId: true },
        },
        event: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.djRating.count(),
  ]);

  return actionSuccess({
    reviews,
    total,
  });
}
