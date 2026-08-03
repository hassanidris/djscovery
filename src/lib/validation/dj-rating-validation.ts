/**
 * Shared validation logic for DjRating creation.
 *
 * Used by both:
 *   - Server action: src/lib/actions/dj-ratings.ts
 *   - API route:     src/app/api/djs/[slug]/ratings/route.ts
 *
 * This ensures consistent validation across all entry points and avoids
 * the duplication that would otherwise drift out of sync.
 */

import prisma from "@/lib/client";

export const MIN_REVIEW_LENGTH = 30;
export const MAX_REVIEW_LENGTH = 2000;
export const REVIEW_WINDOW_DAYS = 30;

export const VALID_REVIEW_TYPES = [
  "DIRECT",
  "EVENT_ATTENDEE",
  "EVENT_ORGANIZER",
] as const;

export type ReviewType = (typeof VALID_REVIEW_TYPES)[number];

/** Result of validating raw input fields */
export interface FieldValidationResult {
  ok: boolean;
  error?: string;
  /** The trimmed review text (only set if ok) */
  trimmedReview?: string;
  /** Whether this is an event-anchored review (only set if ok) */
  isEventReview?: boolean;
}

/**
 * Validate the basic input fields (rating, review text, eventId, reviewType).
 * Does NOT touch the database — use `validateBusinessRules` for that.
 */
export function validateFields(input: {
  rating: unknown;
  review: unknown;
  eventId?: unknown;
  reviewType?: unknown;
}): FieldValidationResult {
  // --- Rating ---
  const { rating } = input;
  if (
    typeof rating !== "number" ||
    !Number.isSafeInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return { ok: false, error: "Rating must be an integer between 1 and 5" };
  }

  // --- Review text ---
  if (typeof input.review !== "string") {
    return { ok: false, error: "Review must be a string" };
  }
  const trimmedReview = input.review.trim();
  if (trimmedReview.length < MIN_REVIEW_LENGTH) {
    return {
      ok: false,
      error: `Review must be at least ${MIN_REVIEW_LENGTH} characters`,
    };
  }
  if (trimmedReview.length > MAX_REVIEW_LENGTH) {
    return {
      ok: false,
      error: `Review must be at most ${MAX_REVIEW_LENGTH} characters`,
    };
  }

  // --- eventId ---
  const isEventReview =
    input.eventId != null &&
    typeof input.eventId === "number" &&
    Number.isSafeInteger(input.eventId) &&
    input.eventId > 0;

  // --- reviewType (if provided) ---
  // Only allow DIRECT and EVENT_ATTENDEE from client; EVENT_ORGANIZER is auto-detected
  if (
    input.reviewType != null &&
    !["DIRECT", "EVENT_ATTENDEE"].includes(input.reviewType as ReviewType)
  ) {
    return { ok: false, error: "Invalid reviewType" };
  }

  // --- reviewType / eventId consistency ---
  // DIRECT must not have an eventId; EVENT_ATTENDEE must have an eventId.
  if (input.reviewType === "DIRECT" && isEventReview) {
    return {
      ok: false,
      error: "Direct reviews cannot be anchored to an event",
    };
  }
  if (input.reviewType === "EVENT_ATTENDEE" && !isEventReview) {
    return {
      ok: false,
      error: "Event reviews require an eventId",
    };
  }

  return { ok: true, trimmedReview, isEventReview };
}

/** Context needed for business-rule validation */
export interface BusinessRuleContext {
  userId: string;
  djProfileId: number;
  isEventReview: boolean;
  eventId?: number;
  reviewType?: ReviewType;
}

/** Result of business-rule validation */
export interface BusinessRuleResult {
  ok: boolean;
  error?: string;
  /** The resolved review type (auto-detected if not provided) */
  resolvedReviewType?: ReviewType;
  /** DJ profile data (slug, stageName, userId) — needed by callers */
  djProfile?: {
    id: number;
    slug: string;
    stageName: string;
    userId: string;
  };
  /** Event context (only for event-anchored reviews) */
  eventSlug?: string;
  eventTitle?: string;
}

/**
 * Validate all business rules that require database lookups:
 *   - DJ profile exists and is not REJECTED
 *   - User is not reviewing their own profile
 *   - For event reviews:
 *       * Event exists and is COMPLETED
 *       * User attended the event
 *       * DJ performed at the event
 *       * Review window not expired
 *       * reviewType auto-detection (organizer vs attendee)
 */
export async function validateBusinessRules(
  ctx: BusinessRuleContext,
): Promise<BusinessRuleResult> {
  // --- DJ profile ---
  const djProfile = await prisma.djProfile.findUnique({
    where: { id: ctx.djProfileId },
    select: {
      id: true,
      slug: true,
      status: true,
      userId: true,
      stageName: true,
    },
  });

  if (!djProfile) {
    return { ok: false, error: "DJ profile not found" };
  }
  if (djProfile.status === "REJECTED") {
    return { ok: false, error: "DJ profile not available for reviews" };
  }

  // --- Self-review prevention ---
  if (djProfile.userId === ctx.userId) {
    return { ok: false, error: "You cannot review your own DJ profile" };
  }

  let resolvedReviewType: ReviewType;
  let eventSlug: string | undefined;
  let eventTitle: string | undefined;

  if (ctx.isEventReview && ctx.eventId) {
    const eventId = ctx.eventId;

    // --- Event exists ---
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        startDate: true,
        ownerDjId: true,
      },
    });
    if (!event) {
      return { ok: false, error: "Event not found" };
    }
    if (event.status !== "COMPLETED") {
      return { ok: false, error: "Event must be completed before reviewing" };
    }

    // --- Attendance ---
    const attendance = await prisma.eventAttendance.findUnique({
      where: { eventId_userId: { eventId, userId: ctx.userId } },
    });
    if (!attendance || attendance.status !== "ATTENDED") {
      return {
        ok: false,
        error: "You must have attended this event to review",
      };
    }

    // --- DJ performed at event ---
    const participant = await prisma.eventDj.findUnique({
      where: {
        eventId_djProfileId: { eventId, djProfileId: djProfile.id },
      },
    });
    const didPerform = event.ownerDjId === djProfile.id || Boolean(participant);
    if (!didPerform) {
      return { ok: false, error: "DJ did not perform at this event" };
    }

    // --- Review window ---
    const daysSince =
      (Date.now() - new Date(event.startDate).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSince > REVIEW_WINDOW_DAYS) {
      return {
        ok: false,
        error: `Review window expired (${REVIEW_WINDOW_DAYS} days)`,
      };
    }

    eventSlug = event.slug;
    eventTitle = event.title;

    // --- Resolve reviewType ---
    // Do not accept client-supplied EVENT_ORGANIZER - must verify organizer status
    if (ctx.reviewType === "EVENT_ATTENDEE") {
      resolvedReviewType = "EVENT_ATTENDEE";
    } else {
      // Auto-detect: organizer if user has an accepted gig for this DJ
      const organizerProfile = await prisma.organizerProfile.findUnique({
        where: { userId: ctx.userId },
      });
      if (organizerProfile) {
        const gigWithDj = await prisma.gig.findFirst({
          where: {
            organizerProfileId: organizerProfile.id,
            applications: {
              some: { djProfileId: djProfile.id, status: "ACCEPTED" },
            },
          },
        });
        resolvedReviewType = gigWithDj ? "EVENT_ORGANIZER" : "EVENT_ATTENDEE";
      } else {
        resolvedReviewType = "EVENT_ATTENDEE";
      }
    }
  } else {
    resolvedReviewType = "DIRECT";
  }

  return {
    ok: true,
    resolvedReviewType,
    djProfile: {
      id: djProfile.id,
      slug: djProfile.slug,
      stageName: djProfile.stageName,
      userId: djProfile.userId,
    },
    eventSlug,
    eventTitle,
  };
}

/**
 * Find an existing DjRating for upsert semantics.
 * Uses findFirst because the unique constraints are partial indexes
 * (created via raw SQL), not Prisma @@unique, so Prisma doesn't expose
 * compound unique names for them.
 */
export async function findExistingRating(
  userId: string,
  djProfileId: number,
  isEventReview: boolean,
  eventId?: number,
): Promise<{ id: number } | null> {
  return prisma.djRating.findFirst({
    where: {
      userId,
      djProfileId,
      ...(isEventReview && eventId ? { eventId } : { eventId: null }),
    },
    select: { id: true },
  });
}

/**
 * Upsert a DjRating with race-condition protection.
 *
 * The check-then-act pattern (findExistingRating → create/update) can race
 * if two concurrent requests submit a review for the same user+DJ+event.
 * This function wraps the upsert in a retry: if the create fails with a
 * unique constraint violation (P2002), it retries as an update.
 *
 * Returns { id, created } where `created` is true if a new row was inserted.
 */
export async function upsertDjRating(input: {
  userId: string;
  djProfileId: number;
  eventId: number | null;
  rating: number;
  review: string;
  reviewType: ReviewType;
}): Promise<{ id: number; created: boolean }> {
  const isEventReview = input.eventId != null;

  // First, check for existing
  const existing = await findExistingRating(
    input.userId,
    input.djProfileId,
    isEventReview,
    input.eventId ?? undefined,
  );

  if (existing) {
    const updated = await prisma.djRating.update({
      where: { id: existing.id },
      data: {
        rating: input.rating,
        review: input.review,
        reviewType: input.reviewType,
      },
      select: { id: true },
    });
    return { id: updated.id, created: false };
  }

  // Try to create; if unique constraint violation (race condition), retry as update
  try {
    const created = await prisma.djRating.create({
      data: {
        userId: input.userId,
        djProfileId: input.djProfileId,
        eventId: input.eventId,
        rating: input.rating,
        review: input.review,
        reviewType: input.reviewType,
      },
      select: { id: true },
    });
    return { id: created.id, created: true };
  } catch (error: any) {
    // P2002 = unique constraint violation
    if (error?.code === "P2002") {
      // Retry: find the now-existing row and update it
      const raced = await findExistingRating(
        input.userId,
        input.djProfileId,
        isEventReview,
        input.eventId ?? undefined,
      );
      if (raced) {
        const updated = await prisma.djRating.update({
          where: { id: raced.id },
          data: {
            rating: input.rating,
            review: input.review,
            reviewType: input.reviewType,
          },
          select: { id: true },
        });
        return { id: updated.id, created: false };
      }
    }
    throw error;
  }
}
