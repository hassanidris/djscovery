"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { ActionResult, actionError, actionSuccess } from "./action-result";

export interface CreateReviewResponseInput {
  ratingId: number;
  response: string;
}

export async function createReviewResponse(
  input: CreateReviewResponseInput,
): Promise<ActionResult<{ id: number; response: string; respondedAt: Date }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("Unauthorized");

  // Validate response length
  if (input.response.length < 10) {
    return actionError("Response must be at least 10 characters");
  }
  if (input.response.length > 1000) {
    return actionError("Response must be less than 1000 characters");
  }

  // Get the review and check if the user owns the DJ profile
  const review = await prisma.djRating.findUnique({
    where: { id: input.ratingId },
    include: {
      djProfile: {
        select: { userId: true },
      },
    },
  });

  if (!review) {
    return actionError("Review not found");
  }

  if (review.djProfile.userId !== user.id) {
    return actionError("You can only respond to reviews for your own profile");
  }

  // Check if already responded
  if ((review as any).response) {
    return actionError("You have already responded to this review");
  }

  // Create the response
  const updated = await prisma.djRating.update({
    where: { id: input.ratingId },
    data: {
      response: input.response,
      respondedAt: new Date(),
    } as any,
    select: {
      id: true,
    },
  });

  // Create notification for the reviewer
  try {
    await prisma.notification.create({
      data: {
        type: "NEW_RATING" as any,
        recipientId: review.userId,
        data: {
          ratingId: review.id,
          djProfileId: review.djProfileId,
          response: input.response,
        },
      },
    });
  } catch (notifError) {
    console.error("Failed to create response notification:", notifError);
  }

  return actionSuccess({
    id: updated.id,
    response: input.response,
    respondedAt: new Date(),
  });
}

export async function updateReviewResponse(
  input: CreateReviewResponseInput,
): Promise<ActionResult<{ id: number; response: string; respondedAt: Date }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("Unauthorized");

  // Validate response length
  if (input.response.length < 10) {
    return actionError("Response must be at least 10 characters");
  }
  if (input.response.length > 1000) {
    return actionError("Response must be less than 1000 characters");
  }

  // Get the review and check if the user owns the DJ profile
  const review = await prisma.djRating.findUnique({
    where: { id: input.ratingId },
    include: {
      djProfile: {
        select: { userId: true },
      },
    },
  });

  if (!review) {
    return actionError("Review not found");
  }

  if (review.djProfile.userId !== user.id) {
    return actionError("You can only respond to reviews for your own profile");
  }

  // Update the response
  const updated = await prisma.djRating.update({
    where: { id: input.ratingId },
    data: {
      response: input.response,
      respondedAt: new Date(),
    } as any,
    select: {
      id: true,
    },
  });

  return actionSuccess({
    id: updated.id,
    response: input.response,
    respondedAt: new Date(),
  });
}

export async function deleteReviewResponse(
  ratingId: number,
): Promise<ActionResult<{ success: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("Unauthorized");

  // Get the review and check if the user owns the DJ profile
  const review = await prisma.djRating.findUnique({
    where: { id: ratingId },
    include: {
      djProfile: {
        select: { userId: true },
      },
    },
  });

  if (!review) {
    return actionError("Review not found");
  }

  if (review.djProfile.userId !== user.id) {
    return actionError("You can only delete responses for your own profile");
  }

  // Delete the response
  await prisma.djRating.update({
    where: { id: ratingId },
    data: {
      response: null,
      respondedAt: null,
    } as any,
  });

  return actionSuccess({ success: true });
}
