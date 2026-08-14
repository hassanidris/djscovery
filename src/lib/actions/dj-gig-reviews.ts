"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { ActionResult, actionError, actionSuccess } from "./action-result";
import {
  validateFields,
  validateBusinessRules,
  upsertDjGigReview,
  findExistingDjGigReview,
} from "@/lib/validation/dj-gig-review-validation";
import { runDjGigReviewPostSubmitEffects } from "@/lib/gig-reviews/dj-gig-review-post-effects";
import { headers } from "next/headers";

/**
 * Input for creating a DjGigReview.
 *
 * - gigId: The gig being reviewed
 * - djProfileId: The DJ writing the review
 * - rating: 1-5 star rating
 * - review: Review text (30-2000 characters)
 */
export interface CreateDjGigReviewInput {
  gigId: number;
  djProfileId: number;
  rating: number;
  review: string;
}

/**
 * Create or update a DjGigReview (DJ review of a gig/organizer).
 *
 * Business rules are enforced in `validateBusinessRules` — see
 * src/lib/validation/dj-gig-review-validation.ts for the full list.
 *
 * If a matching review already exists (same DJ + gig), it is UPDATED
 * (upsert semantics).
 *
 * NOTE: This is a server action intended for use from client components.
 * For API access, use the POST endpoint at /api/gigs/[slug]/dj-reviews.
 */
export async function createDjGigReview(
  input: CreateDjGigReviewInput,
): Promise<ActionResult<{ id: number; created: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("Unauthorized");

  // --- Field validation (no DB access) ---
  const fieldResult = validateFields({
    rating: input.rating,
    review: input.review,
  });
  if (!fieldResult.ok) {
    return actionError(fieldResult.error!);
  }

  const { trimmedReview } = fieldResult;

  // --- Business-rule validation (DB access) ---
  const ruleResult = await validateBusinessRules({
    userId: user.id,
    gigId: input.gigId,
    djProfileId: input.djProfileId,
  });
  if (!ruleResult.ok) {
    return actionError(ruleResult.error!);
  }

  const { gig, djProfile } = ruleResult;

  // --- Get audit fields ---
  const h = await headers();
  const ipAddress = h.get("x-forwarded-for") || "unknown";
  const userAgent = h.get("user-agent") || "unknown";

  // --- Upsert (race-condition safe) ---
  const { id: reviewId, created } = await upsertDjGigReview({
    gigId: input.gigId,
    djProfileId: input.djProfileId,
    organizerId: gig!.organizerUserId,
    rating: input.rating,
    review: trimmedReview!,
    ipAddress,
    userAgent,
  });

  // --- Post-submit side effects ---
  await runDjGigReviewPostSubmitEffects({
    reviewId,
    created,
    rating: input.rating,
    trimmedReview: trimmedReview!,
    gigId: input.gigId,
    gigSlug: gig!.slug,
    gigTitle: gig!.title,
    organizerProfileId: gig!.organizerProfileId,
    organizerUserId: gig!.organizerUserId,
    djProfileId: input.djProfileId,
    djProfileSlug: djProfile!.slug,
    djStageName: djProfile!.stageName,
    reviewerId: user.id,
  });

  return actionSuccess({ id: reviewId, created });
}

/**
 * Check whether the current DJ has already reviewed a gig.
 */
export async function hasDjReviewedGig(
  gigId: number,
  djProfileId: number,
): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const existing = await findExistingDjGigReview(gigId, djProfileId);

  return Boolean(existing);
}

/**
 * Get the context needed for the DJ gig review page.
 * Returns null if the current user is not the DJ or if the gig
 * is not eligible for review.
 */
export async function getDjGigReviewContext(gigSlug: string, userId: string) {
  const gig = await prisma.gig.findUnique({
    where: { slug: gigSlug, deletedAt: null },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      eventDate: true,
      organizerProfile: {
        select: {
          id: true,
          userId: true,
          displayName: true,
        },
      },
      applications: {
        where: { status: "ACCEPTED" },
        select: {
          id: true,
          djProfile: {
            select: {
              id: true,
              stageName: true,
              slug: true,
              avatar: true,
              userId: true,
            },
          },
          hire: {
            select: {
              id: true,
              status: true,
              completedAt: true,
            },
          },
        },
      },
      djGigReviews: {
        select: {
          id: true,
          rating: true,
          review: true,
          createdAt: true,
        },
      },
    },
  });

  if (!gig) return null;

  // Find the application for the current user's DJ profile
  const userDjProfile = await prisma.djProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!userDjProfile) return null;

  const application = gig.applications.find(
    (app) => app.djProfile.id === userDjProfile.id,
  );

  if (!application) return null;

  const hire = application.hire;
  const completedAt = hire?.completedAt ?? gig.eventDate;
  const isCompleted =
    gig.status === "COMPLETED" && hire?.status === "COMPLETED";
  const alreadyReviewed = gig.djGigReviews.length > 0;
  const deadline = isCompleted
    ? new Date(new Date(completedAt).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;
  const reviewWindowOpen =
    isCompleted &&
    !alreadyReviewed &&
    deadline !== null &&
    Date.now() <= deadline.getTime();
  const daysRemaining = deadline
    ? Math.max(
        0,
        Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      )
    : null;

  return {
    gigId: gig.id,
    gigSlug: gig.slug,
    gigTitle: gig.title,
    organizerDisplayName: gig.organizerProfile.displayName,
    djProfileId: userDjProfile.id,
    djName: application.djProfile.stageName,
    djSlug: application.djProfile.slug,
    djAvatar: application.djProfile.avatar,
    isCompleted,
    alreadyReviewed,
    reviewWindowOpen,
    daysRemaining,
    existingReview:
      alreadyReviewed && gig.djGigReviews.length > 0
        ? gig.djGigReviews[0]
        : null,
  };
}
