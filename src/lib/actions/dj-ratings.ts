"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { ActionResult, actionError, actionSuccess } from "./action-result";
import {
  validateFields,
  validateBusinessRules,
  upsertDjRating,
  findExistingRating,
  type ReviewType,
} from "@/lib/validation/dj-rating-validation";
import { runPostSubmitEffects } from "@/lib/ratings/post-submit-effects";

/**
 * Input for creating a DjRating.
 *
 * - Direct review:  eventId = null, reviewType = "DIRECT"
 * - Event review:   eventId = <number>, reviewType = "EVENT_ATTENDEE" | "EVENT_ORGANIZER"
 *
 * The reviewType is inferred from context when not explicitly provided:
 *   - eventId null      -> "DIRECT"
 *   - eventId present   -> "EVENT_ATTENDEE" (unless the caller passes "EVENT_ORGANIZER")
 */
export interface CreateDjRatingInput {
  djProfileId: number;
  rating: number;
  review: string;
  eventId?: number | null;
  reviewType?: ReviewType;
}

/**
 * Create or update a DjRating (direct or event-anchored).
 *
 * Business rules are enforced in `validateBusinessRules` — see
 * src/lib/validation/dj-rating-validation.ts for the full list.
 *
 * If a matching review already exists (same user + DJ + event context),
 * it is UPDATED (upsert semantics).
 *
 * NOTE: This is a server action intended for use from client components.
 * For API access, use the POST endpoint at /api/djs/[slug]/ratings.
 */
export async function createDjRating(
  input: CreateDjRatingInput,
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
    eventId: input.eventId,
    reviewType: input.reviewType,
  });
  if (!fieldResult.ok) {
    return actionError(fieldResult.error!);
  }

  const { trimmedReview, isEventReview } = fieldResult;

  // --- Business-rule validation (DB access) ---
  const ruleResult = await validateBusinessRules({
    userId: user.id,
    djProfileId: input.djProfileId,
    isEventReview: isEventReview!,
    eventId: isEventReview ? (input.eventId as number) : undefined,
    reviewType: input.reviewType,
  });
  if (!ruleResult.ok) {
    return actionError(ruleResult.error!);
  }

  const { resolvedReviewType, djProfile, eventSlug, eventTitle } = ruleResult;
  const isEvent = isEventReview!;

  // --- Upsert (race-condition safe) ---
  const { id: ratingId, created } = await upsertDjRating({
    userId: user.id,
    djProfileId: djProfile!.id,
    eventId: isEvent ? (input.eventId as number) : null,
    rating: input.rating,
    review: trimmedReview!,
    reviewType: resolvedReviewType!,
  });

  // --- Post-submit side effects ---
  try {
    await runPostSubmitEffects({
      ratingId,
      created,
      rating: input.rating,
      trimmedReview: trimmedReview!,
      isEventReview: isEvent,
      eventId: isEvent ? (input.eventId as number) : null,
      djProfileId: djProfile!.id,
      djProfileSlug: djProfile!.slug,
      djProfileUserId: djProfile!.userId,
      djStageName: djProfile!.stageName,
      reviewerId: user.id,
      eventSlug: eventSlug ?? null,
      eventTitle: eventTitle ?? null,
    });
  } catch (error) {
    // Log error but don't fail the review submission
    console.error("Post-submit effects failed for rating", ratingId, error);
    // The review is still created, so we return success
    // This is intentional - side effects should not block review submission
  }

  return actionSuccess({ id: ratingId, created });
}

/**
 * Check whether the current user has already reviewed a DJ.
 * For event-anchored reviews, pass eventId; for direct reviews, omit it.
 */
export async function hasUserReviewedDj(
  djProfileId: number,
  eventId?: number | null,
): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const existing = await findExistingRating(
    user.id,
    djProfileId,
    eventId != null && eventId > 0,
    eventId ?? undefined,
  );

  return Boolean(existing);
}
