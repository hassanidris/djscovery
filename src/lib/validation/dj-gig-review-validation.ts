/**
 * Shared validation logic for DjGigReview creation.
 *
 * Used by both:
 *   - Server action: src/lib/actions/dj-gig-reviews.ts
 *   - API route:     src/app/api/gigs/[slug]/dj-reviews/route.ts
 *
 * This ensures consistent validation across all entry points and avoids
 * the duplication that would otherwise drift out of sync.
 */

import prisma from "@/lib/client";

export const MIN_REVIEW_LENGTH = 30;
export const MAX_REVIEW_LENGTH = 2000;
export const REVIEW_WINDOW_DAYS = 30;

/** Result of validating raw input fields */
export interface FieldValidationResult {
  ok: boolean;
  error?: string;
  /** The trimmed review text (only set if ok) */
  trimmedReview?: string;
}

/**
 * Validate the basic input fields (rating, review text).
 * Does NOT touch the database — use `validateBusinessRules` for that.
 */
export function validateFields(input: {
  rating: unknown;
  review: unknown;
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

  return { ok: true, trimmedReview };
}

/** Context needed for business-rule validation */
export interface BusinessRuleContext {
  userId: string;
  gigId: number;
  djProfileId: number;
}

/** Result of business-rule validation */
export interface BusinessRuleResult {
  ok: boolean;
  error?: string;
  /** Gig context */
  gig?: {
    id: number;
    slug: string;
    title: string;
    organizerProfileId: number;
    organizerUserId: string;
  };
  /** DJ profile data */
  djProfile?: {
    id: number;
    slug: string;
    stageName: string;
    userId: string;
  };
  /** Hire context */
  hire?: {
    id: number;
    status: string;
    completedAt: Date | null;
  };
}

/**
 * Validate all business rules that require database lookups:
 *   - DJ profile exists and is not REJECTED
 *   - User is the DJ (not reviewing someone else's gig)
 *   - Gig exists
 *   - DJ has an ACCEPTED application for this gig
 *   - Hire status is COMPLETED
 *   - Review window not expired (30 days from completion)
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

  // --- User is the DJ ---
  if (djProfile.userId !== ctx.userId) {
    return { ok: false, error: "You can only review gigs you worked on" };
  }

  // --- Gig exists ---
  const gig = await prisma.gig.findUnique({
    where: { id: ctx.gigId, deletedAt: null },
    select: {
      id: true,
      slug: true,
      title: true,
      organizerProfileId: true,
      eventDate: true,
    },
  });
  if (!gig) {
    return { ok: false, error: "Gig not found" };
  }

  // --- DJ has accepted application for this gig ---
  const application = await prisma.gigApplication.findUnique({
    where: {
      gigId_djProfileId: {
        gigId: ctx.gigId,
        djProfileId: ctx.djProfileId,
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!application) {
    return { ok: false, error: "No application found for this gig" };
  }
  if (application.status !== "ACCEPTED") {
    return { ok: false, error: "Application was not accepted" };
  }

  // --- Hire status is COMPLETED ---
  const hire = await prisma.hire.findUnique({
    where: { applicationId: application.id },
    select: {
      id: true,
      status: true,
      completedAt: true,
    },
  });

  if (!hire) {
    return { ok: false, error: "Hire record not found" };
  }
  if (hire.status !== "COMPLETED") {
    return { ok: false, error: "Gig must be completed before reviewing" };
  }

  // --- Review window ---
  const completedAt = hire.completedAt || gig.eventDate;
  const daysSinceCompletion =
    (Date.now() - new Date(completedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCompletion > REVIEW_WINDOW_DAYS) {
    return {
      ok: false,
      error: `Review window expired (${REVIEW_WINDOW_DAYS} days)`,
    };
  }

  // --- Get organizer user ID ---
  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { id: gig.organizerProfileId },
    select: { userId: true },
  });
  if (!organizerProfile?.userId) {
    return {
      ok: false,
      error: "Organizer profile not found",
    };
  }

  return {
    ok: true,
    gig: {
      id: gig.id,
      slug: gig.slug,
      title: gig.title,
      organizerProfileId: gig.organizerProfileId,
      organizerUserId: organizerProfile.userId,
    },
    djProfile: {
      id: djProfile.id,
      slug: djProfile.slug,
      stageName: djProfile.stageName,
      userId: djProfile.userId,
    },
    hire: {
      id: hire.id,
      status: hire.status,
      completedAt: hire.completedAt,
    },
  };
}

/**
 * Find an existing DjGigReview for upsert semantics.
 * Uses findFirst to be consistent with existing patterns and avoid
 * potential issues with compound unique constraint naming.
 */
export async function findExistingDjGigReview(
  gigId: number,
  djProfileId: number,
) {
  return await prisma.djGigReview.findFirst({
    where: {
      gigId,
      djProfileId,
    },
  });
}

/**
 * Upsert a DjGigReview with race condition protection.
 * Handles concurrent submissions by catching P2002 (unique constraint violation)
 * and retrying as an update.
 */
export async function upsertDjGigReview(input: {
  gigId: number;
  djProfileId: number;
  organizerId: string;
  rating: number;
  review: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ id: number; created: boolean }> {
  const {
    gigId,
    djProfileId,
    organizerId,
    rating,
    review,
    ipAddress,
    userAgent,
  } = input;

  try {
    // Try insert first
    const created = await prisma.djGigReview.create({
      data: {
        gigId,
        djProfileId,
        organizerId,
        rating,
        review,
        ipAddress,
        userAgent,
      },
    });
    return { id: created.id, created: true };
  } catch (error) {
    // Handle P2002 unique constraint violation (duplicate review)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      // Retry as update using findFirst pattern
      const existing = await findExistingDjGigReview(gigId, djProfileId);
      if (existing) {
        const updated = await prisma.djGigReview.update({
          where: { id: existing.id },
          data: {
            rating,
            review,
            ipAddress,
            userAgent,
          },
        });
        return { id: updated.id, created: false };
      }
    }
    // Re-throw unrelated database errors
    throw error;
  }
}
