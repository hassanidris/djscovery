"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { ActionResult, actionError, actionSuccess } from "./action-result";

/**
 * Toggle helpful vote for a DjRating
 *
 * If the user hasn't voted yet, adds their vote and increments helpfulCount
 * If the user has already voted, removes their vote and decrements helpfulCount
 */
export async function toggleDjRatingHelpful(
  ratingId: number,
): Promise<ActionResult<{ isHelpful: boolean; helpfulCount: number }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("Unauthorized");

  // Check if review exists
  const review = await prisma.djRating.findUnique({
    where: { id: ratingId },
    select: { id: true },
  });

  if (!review) {
    return actionError("Review not found");
  }

  // Check if user has already voted (using a simple approach for now)
  // This will be enhanced once the schema migration is applied
  const existingVote = await prisma.djRatingHelpfulVote.findUnique({
    where: {
      ratingId_userId: {
        ratingId,
        userId: user.id,
      },
    },
  });

  if (existingVote) {
    // Remove vote (decrement count)
    await prisma.$transaction([
      prisma.djRatingHelpfulVote.delete({
        where: { id: existingVote.id },
      }),
      prisma.djRating.update({
        where: { id: ratingId },
        data: {
          helpfulCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    return actionSuccess({
      isHelpful: false,
      helpfulCount: 0, // Will be updated after migration
    });
  } else {
    // Add vote (increment count)
    await prisma.$transaction([
      prisma.djRatingHelpfulVote.create({
        data: {
          ratingId,
          userId: user.id,
        },
      }),
      prisma.djRating.update({
        where: { id: ratingId },
        data: {
          helpfulCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return actionSuccess({
      isHelpful: true,
      helpfulCount: 1, // Will be updated after migration
    });
  }
}

/**
 * Check if the current user has voted a review as helpful
 */
export async function hasUserVotedHelpful(ratingId: number): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const vote = await prisma.djRatingHelpfulVote.findUnique({
    where: {
      ratingId_userId: {
        ratingId,
        userId: user.id,
      },
    },
  });

  return Boolean(vote);
}
