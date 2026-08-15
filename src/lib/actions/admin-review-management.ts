"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { ActionResult, actionError, actionSuccess } from "./action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Keep these for backward compatibility with existing functions
export interface AdminReviewManagementInput {
  action: "delete" | "hide" | "show";
  ratingId: number;
  reason?: string;
}

export interface AdminReviewManagementInput {
  action: "delete" | "hide" | "show";
  ratingId: number;
  reason?: string;
}

const ApproveReviewSchema = z.object({
  ratingId: z.number(),
  adminNote: z.string().optional(),
});

const HideReviewSchema = z.object({
  ratingId: z.number(),
  adminNote: z.string().optional(),
});

const FlagReviewSchema = z.object({
  ratingId: z.number(),
  adminNote: z.string().optional(),
});

const DeleteReviewSchema = z.object({
  ratingId: z.number(),
  adminNote: z.string().optional(),
});

export async function manageReview(
  input: AdminReviewManagementInput,
): Promise<ActionResult<{ success: boolean }>> {
  const { userId: adminId } = await requireAdmin();

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
      await prisma.djRating.update({
        where: { id: input.ratingId },
        data: { review: null },
      });
      break;
    case "show":
      break;
    default:
      return actionError("Invalid action");
  }

  try {
    await prisma.adminActionLog.create({
      data: {
        adminId,
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

export async function approveReview(formData: FormData): Promise<void> {
  const { userId: adminId } = await requireAdmin();

  const parsed = ApproveReviewSchema.safeParse({
    ratingId: Number(formData.get("ratingId")),
    adminNote: formData.get("adminNote") ?? undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Invalid input");
  }

  const { ratingId, adminNote } = parsed.data;

  try {
    await prisma.$transaction([
      prisma.djRating.update({
        where: { id: ratingId },
        data: {
          moderationStatus: "APPROVED",
          moderatedAt: new Date(),
          moderatedById: adminId,
          moderatorNote: adminNote ?? null,
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "APPROVE_REVIEW",
          targetType: "DjRating",
          targetId: String(ratingId),
          metadata: adminNote ? { adminNote } : undefined,
        },
      }),
    ]);

    revalidatePath("/admin/reviews");
    revalidatePath("/admin/reviews/[reviewId]");
  } catch (error) {
    console.error("Failed to approve review:", error);
    throw new Error("Failed to approve review");
  }
}

export async function hideReview(formData: FormData): Promise<void> {
  const { userId: adminId } = await requireAdmin();

  const parsed = HideReviewSchema.safeParse({
    ratingId: Number(formData.get("ratingId")),
    adminNote: formData.get("adminNote") ?? undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Invalid input");
  }

  const { ratingId, adminNote } = parsed.data;

  try {
    await prisma.$transaction([
      prisma.djRating.update({
        where: { id: ratingId },
        data: {
          moderationStatus: "HIDDEN",
          moderatedAt: new Date(),
          moderatedById: adminId,
          moderatorNote: adminNote ?? null,
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "HIDE_REVIEW",
          targetType: "DjRating",
          targetId: String(ratingId),
          metadata: adminNote ? { adminNote } : undefined,
        },
      }),
    ]);

    revalidatePath("/admin/reviews");
    revalidatePath("/admin/reviews/[reviewId]");
  } catch (error) {
    console.error("Failed to hide review:", error);
    throw new Error("Failed to hide review");
  }
}

export async function flagReview(formData: FormData): Promise<void> {
  const { userId: adminId } = await requireAdmin();

  const parsed = FlagReviewSchema.safeParse({
    ratingId: Number(formData.get("ratingId")),
    adminNote: formData.get("adminNote") ?? undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Invalid input");
  }

  const { ratingId, adminNote } = parsed.data;

  try {
    await prisma.$transaction([
      prisma.djRating.update({
        where: { id: ratingId },
        data: {
          moderationStatus: "FLAGGED",
          moderatedAt: new Date(),
          moderatedById: adminId,
          moderatorNote: adminNote ?? null,
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "FLAG_REVIEW",
          targetType: "DjRating",
          targetId: String(ratingId),
          metadata: adminNote ? { adminNote } : undefined,
        },
      }),
    ]);

    revalidatePath("/admin/reviews");
    revalidatePath("/admin/reviews/[reviewId]");
  } catch (error) {
    console.error("Failed to flag review:", error);
    throw new Error("Failed to flag review");
  }
}

export async function deleteReview(formData: FormData): Promise<void> {
  const { userId: adminId } = await requireAdmin();

  const parsed = DeleteReviewSchema.safeParse({
    ratingId: Number(formData.get("ratingId")),
    adminNote: formData.get("adminNote") ?? undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Invalid input");
  }

  const { ratingId, adminNote } = parsed.data;

  try {
    const review = await prisma.djRating.findUnique({
      where: { id: ratingId },
      select: { djProfileId: true, rating: true },
    });

    if (!review) {
      throw new Error("Review not found");
    }

    await prisma.$transaction([
      prisma.djRating.delete({
        where: { id: ratingId },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "DELETE_REVIEW",
          targetType: "DjRating",
          targetId: String(ratingId),
          metadata: adminNote
            ? {
                adminNote,
                djProfileId: review.djProfileId,
                rating: review.rating,
              }
            : undefined,
        },
      }),
    ]);

    revalidatePath("/admin/reviews");
    revalidatePath("/admin/reviews/[reviewId]");
    revalidatePath("/djs/[slug]/reviews");
  } catch (error) {
    console.error("Failed to delete review:", error);
    throw new Error("Failed to delete review");
  }
}

export type AdminReview = {
  id: number;
  rating: number;
  review: string | null;
  moderationStatus: string;
  moderatedAt: Date | null;
  moderatorNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
  };
  djProfile: {
    id: number;
    stageName: string;
    slug: string;
    avatar: string | null;
  };
  event: {
    id: number;
    title: string;
    slug: string;
  } | null;
  reviewType: string | null;
  helpfulCount: number;
  response: string | null;
  respondedAt: Date | null;
  moderator: {
    username: string;
  } | null;
};

export async function getAdminReviews({
  cursor,
  take = 20,
  status,
  reviewType,
  minRating,
  maxRating,
  startDate,
  endDate,
}: {
  cursor?: number;
  take?: number;
  status?: string;
  reviewType?: string;
  minRating?: number;
  maxRating?: number;
  startDate?: Date;
  endDate?: Date;
}): Promise<{ reviews: AdminReview[]; nextCursor: number | null }> {
  await requireAdmin();

  const whereClause: any = {};

  if (status) {
    whereClause.moderationStatus = status;
  }

  if (reviewType) {
    whereClause.reviewType = reviewType;
  }

  if (minRating !== undefined || maxRating !== undefined) {
    whereClause.rating = {};
    if (minRating !== undefined) whereClause.rating.gte = minRating;
    if (maxRating !== undefined) whereClause.rating.lte = maxRating;
  }

  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.gte = startDate;
    if (endDate) whereClause.createdAt.lte = endDate;
  }

  const reviews = await prisma.djRating.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    where: whereClause,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      review: true,
      moderationStatus: true,
      moderatedAt: true,
      moderatorNote: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
        },
      },
      djProfile: {
        select: {
          id: true,
          stageName: true,
          slug: true,
          avatar: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      reviewType: true,
      helpfulCount: true,
      response: true,
      respondedAt: true,
      moderator: {
        select: {
          username: true,
        },
      },
    },
  });

  const hasNextPage = reviews.length > take;
  if (hasNextPage) reviews.pop();

  return {
    reviews,
    nextCursor: hasNextPage ? reviews[reviews.length - 1].id : null,
  };
}

export async function getAdminReviewById(
  reviewId: number,
): Promise<ActionResult<AdminReview>> {
  await requireAdmin();

  const review = await prisma.djRating.findUnique({
    where: { id: reviewId },
    select: {
      id: true,
      rating: true,
      review: true,
      moderationStatus: true,
      moderatedAt: true,
      moderatorNote: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
        },
      },
      djProfile: {
        select: {
          id: true,
          stageName: true,
          slug: true,
          avatar: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      reviewType: true,
      helpfulCount: true,
      response: true,
      respondedAt: true,
      moderator: {
        select: {
          username: true,
        },
      },
    },
  });

  if (!review) {
    return actionError("Review not found");
  }

  return actionSuccess(review);
}

export async function bulkApproveReviews(formData: FormData): Promise<void> {
  const { userId: adminId } = await requireAdmin();

  const ratingIds = formData.getAll("ratingIds").map((id) => Number(id));

  if (ratingIds.length === 0) {
    throw new Error("No reviews selected");
  }

  try {
    await prisma.$transaction([
      prisma.djRating.updateMany({
        where: { id: { in: ratingIds } },
        data: {
          moderationStatus: "APPROVED",
          moderatedAt: new Date(),
          moderatedById: adminId,
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "BULK_APPROVE_REVIEWS",
          targetType: "DjRating",
          targetId: ratingIds.join(","),
          metadata: { count: ratingIds.length },
        },
      }),
    ]);

    revalidatePath("/admin/reviews");
    revalidatePath("/admin/reviews/moderation");
  } catch (error) {
    console.error("Failed to bulk approve reviews:", error);
    throw new Error("Failed to bulk approve reviews");
  }
}

export async function bulkHideReviews(formData: FormData): Promise<void> {
  const { userId: adminId } = await requireAdmin();

  const ratingIds = formData.getAll("ratingIds").map((id) => Number(id));
  const adminNote = formData.get("adminNote") as string | null;

  if (ratingIds.length === 0) {
    throw new Error("No reviews selected");
  }

  try {
    await prisma.$transaction([
      prisma.djRating.updateMany({
        where: { id: { in: ratingIds } },
        data: {
          moderationStatus: "HIDDEN",
          moderatedAt: new Date(),
          moderatedById: adminId,
          moderatorNote: adminNote ?? null,
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "BULK_HIDE_REVIEWS",
          targetType: "DjRating",
          targetId: ratingIds.join(","),
          metadata: adminNote
            ? { adminNote, count: ratingIds.length }
            : { count: ratingIds.length },
        },
      }),
    ]);

    revalidatePath("/admin/reviews");
    revalidatePath("/admin/reviews/moderation");
  } catch (error) {
    console.error("Failed to bulk hide reviews:", error);
    throw new Error("Failed to bulk hide reviews");
  }
}

export async function bulkFlagReviews(formData: FormData): Promise<void> {
  const { userId: adminId } = await requireAdmin();

  const ratingIds = formData.getAll("ratingIds").map((id) => Number(id));
  const adminNote = formData.get("adminNote") as string | null;

  if (ratingIds.length === 0) {
    throw new Error("No reviews selected");
  }

  try {
    await prisma.$transaction([
      prisma.djRating.updateMany({
        where: { id: { in: ratingIds } },
        data: {
          moderationStatus: "FLAGGED",
          moderatedAt: new Date(),
          moderatedById: adminId,
          moderatorNote: adminNote ?? null,
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "BULK_FLAG_REVIEWS",
          targetType: "DjRating",
          targetId: ratingIds.join(","),
          metadata: adminNote
            ? { adminNote, count: ratingIds.length }
            : { count: ratingIds.length },
        },
      }),
    ]);

    revalidatePath("/admin/reviews");
    revalidatePath("/admin/reviews/moderation");
  } catch (error) {
    console.error("Failed to bulk flag reviews:", error);
    throw new Error("Failed to bulk flag reviews");
  }
}

export async function bulkDeleteReviews(formData: FormData): Promise<void> {
  const { userId: adminId } = await requireAdmin();

  const ratingIds = formData.getAll("ratingIds").map((id) => Number(id));
  const adminNote = formData.get("adminNote") as string | null;

  if (ratingIds.length === 0) {
    throw new Error("No reviews selected");
  }

  try {
    const reviews = await prisma.djRating.findMany({
      where: { id: { in: ratingIds } },
      select: { djProfileId: true, rating: true },
    });

    await prisma.$transaction([
      prisma.djRating.deleteMany({
        where: { id: { in: ratingIds } },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "BULK_DELETE_REVIEWS",
          targetType: "DjRating",
          targetId: ratingIds.join(","),
          metadata: adminNote
            ? { adminNote, count: ratingIds.length, reviews }
            : { count: ratingIds.length },
        },
      }),
    ]);

    revalidatePath("/admin/reviews");
    revalidatePath("/admin/reviews/moderation");
    revalidatePath("/djs/[slug]/reviews");
  } catch (error) {
    console.error("Failed to bulk delete reviews:", error);
    throw new Error("Failed to bulk delete reviews");
  }
}

export async function getReportedReviews(
  page = 1,
  limit = 20,
): Promise<ActionResult<{ reviews: any[]; total: number }>> {
  await requireAdmin();

  const [reviews, total] = await Promise.all([
    prisma.djRating.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        moderationStatus: "FLAGGED",
      },
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
    prisma.djRating.count({
      where: { moderationStatus: "FLAGGED" },
    }),
  ]);

  return actionSuccess({
    reviews,
    total,
  });
}
