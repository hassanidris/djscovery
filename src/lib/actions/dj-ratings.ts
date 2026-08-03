"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { updateReputationScore } from "@/lib/reputation/update";
import { revalidatePath } from "next/cache";
import { ActionResult, actionError, actionSuccess } from "./action-result";
import { sendEmail } from "@/lib/email/send";
import type { DjReviewData } from "@/lib/email/types";
import { cacheDelete } from "@/lib/cache";
import {
  validateFields,
  validateBusinessRules,
  upsertDjRating,
  findExistingRating,
  type ReviewType,
} from "@/lib/validation/dj-rating-validation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://djscovery.com";

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

  return actionSuccess({ id: ratingId, created });
}

// ── Post-submit side effects ────────────────────────────────────────────────

interface PostSubmitEffectsInput {
  ratingId: number;
  created: boolean;
  rating: number;
  trimmedReview: string;
  isEventReview: boolean;
  eventId: number | null;
  djProfileId: number;
  djProfileSlug: string;
  djProfileUserId: string;
  djStageName: string;
  reviewerId: string;
  eventSlug: string | null;
  eventTitle: string | null;
}

/**
 * Shared post-submit side effects used by both the server action and API route:
 *   - Reputation score update
 *   - Cache invalidation
 *   - Notification creation
 *   - Email sending
 *   - Path revalidation
 */
export async function runPostSubmitEffects(input: PostSubmitEffectsInput) {
  const {
    rating,
    trimmedReview,
    isEventReview,
    eventId,
    djProfileId,
    djProfileSlug,
    djProfileUserId,
    djStageName,
    reviewerId,
    eventSlug,
    eventTitle,
  } = input;

  // --- Reputation ---
  await updateReputationScore(djProfileId, "EVENT_REVIEW_ADDED" as const).catch(
    (e) => console.error("Reputation update failed:", e),
  );

  // --- Cache invalidation ---
  for (const filterKey of ["all", "direct", `event:${eventId ?? ""}`]) {
    await cacheDelete(`dj_ratings:${djProfileSlug}:1:10:${filterKey}`).catch(
      () => {},
    );
  }

  // --- Notification ---
  try {
    await prisma.notification.create({
      data: {
        type: "NEW_RATING",
        recipientId: djProfileUserId,
        data: {
          rating,
          reviewerType: isEventReview ? "event" : "direct",
          ...(isEventReview && eventId ? { eventId, eventTitle } : {}),
        },
      },
    });
  } catch (notifError) {
    console.error("Failed to create rating notification:", notifError);
  }

  // --- Email ---
  try {
    const [djUser, reviewer] = await Promise.all([
      prisma.user.findUnique({
        where: { id: djProfileUserId },
        select: { email: true },
      }),
      prisma.user.findUnique({
        where: { id: reviewerId },
        select: { name: true },
      }),
    ]);

    if (djUser?.email) {
      const emailData: DjReviewData = {
        djName: djStageName,
        reviewerName: reviewer?.name || "Someone",
        rating,
        comment: trimmedReview,
        eventTitle: eventTitle ?? "",
        reviewUrl:
          isEventReview && eventSlug
            ? `${SITE_URL}/events/${eventSlug}`
            : `${SITE_URL}/djs/${djProfileSlug}`,
      };
      await sendEmail(djUser.email, "DJ_REVIEW", emailData);
    }
  } catch (emailError) {
    console.error("Failed to send review email:", emailError);
  }

  // --- Revalidate paths ---
  revalidatePath(`/djs/${djProfileSlug}`);
  if (isEventReview && eventSlug) {
    revalidatePath(`/events/${eventSlug}`);
  }
  revalidatePath("/fan/profile");
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
