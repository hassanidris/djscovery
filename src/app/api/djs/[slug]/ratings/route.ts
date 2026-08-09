import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";
import { cacheGet, cacheSet } from "@/lib/cache";
import { createTimer } from "@/lib/utils/performance";
import { createClient } from "@/lib/supabase/server";
import {
  validateFields,
  validateBusinessRules,
  upsertDjRating,
  type ReviewType,
} from "@/lib/validation/dj-rating-validation";
import { runPostSubmitEffects } from "@/lib/ratings/post-submit-effects";

export const revalidate = 300; // Cache for 5 minutes

// Shape of a single rating item in the API response
type RatingItem = {
  id: number;
  rating: number;
  review: string | null;
  reviewType: string | null;
  createdAt: Date;
  user: {
    username: string;
    image: string | null;
    name: string | null;
  };
  event: {
    id: number;
    slug: string;
    title: string;
    startDate: Date;
  } | null;
};

type RatingsResponse = {
  ratings: RatingItem[];
  totalCount: number;
  hasNextPage: boolean;
  avgRating: number;
};

// ============================================================
// GET — list ratings for a DJ, optionally filtered by event
// ============================================================
// Query params:
//   page    — page number (default 1)
//   limit   — items per page (default 10, max 50)
//   eventId — optional filter:
//               numeric  -> only event-anchored reviews for that event
//               "direct" -> only direct reviews (eventId IS NULL)
//               omitted  -> all reviews (direct + event)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const timer = createTimer("ratings");
  const { slug } = await params;
  const { searchParams } = new URL(request.url);

  const MAX_PAGE = 1000;

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");

  // Optional filter: eventId
  const eventIdParam = searchParams.get("eventId");
  const directOnly = eventIdParam === "direct";
  const eventOnly = eventIdParam === "event"; // all event-anchored reviews
  const eventId =
    !directOnly && !eventOnly && eventIdParam ? Number(eventIdParam) : null;
  const filterByEvent =
    !directOnly &&
    !eventOnly &&
    eventId !== null &&
    Number.isSafeInteger(eventId) &&
    eventId > 0;

  if (
    !Number.isSafeInteger(page) ||
    !Number.isSafeInteger(limit) ||
    page < 1 ||
    page > MAX_PAGE ||
    limit < 1 ||
    limit > 50
  ) {
    return NextResponse.json(
      { error: "Invalid pagination parameters" },
      { status: 400 },
    );
  }

  if (eventIdParam && !directOnly && !eventOnly && !filterByEvent) {
    return NextResponse.json(
      { error: "Invalid eventId parameter" },
      { status: 400 },
    );
  }

  // Build the where clause based on filters
  const where: {
    djProfileId: number;
    eventId?: number | null | { not: null };
  } = {
    djProfileId: 0, // placeholder, set below
  };
  if (directOnly) {
    where.eventId = null;
  } else if (eventOnly) {
    where.eventId = { not: null };
  } else if (filterByEvent && eventId !== null) {
    where.eventId = eventId;
  }

  // Cache key incorporates the filter so event-specific queries are cached
  // separately from the "all reviews" query.
  const filterKey = directOnly
    ? "direct"
    : eventOnly
      ? "event"
      : filterByEvent
        ? `event:${eventId}`
        : "all";
  const cacheKey = `dj_ratings:${slug}:${page}:${limit}:${filterKey}`;

  // Check cache first
  timer.start("cache_check");
  const cached = await cacheGet<RatingsResponse>(cacheKey);
  timer.end("cache_check");

  if (cached) {
    timer.flush();
    return NextResponse.json(cached);
  }

  // Get DJ profile ID
  timer.start("fetch_profile");
  const djProfile = await prisma.djProfile.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });
  timer.end("fetch_profile");

  if (!djProfile || djProfile.status === "REJECTED") {
    timer.flush();
    return NextResponse.json(
      { error: "DJ profile not found" },
      { status: 404 },
    );
  }

  // Finalize where clause with the real DJ profile id
  where.djProfileId = djProfile.id;

  // Fetch ratings with pagination and calculate average rating in parallel
  timer.start("fetch_ratings");
  const [ratings, totalCount, ratingAgg] = await Promise.all([
    prisma.djRating.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            username: true,
            image: true,
            name: true,
          },
        },
        event: {
          select: {
            id: true,
            slug: true,
            title: true,
            startDate: true,
          },
        },
      },
    }),
    prisma.djRating.count({ where }),
    prisma.djRating.aggregate({
      where,
      _avg: { rating: true },
    }),
  ]);
  timer.end("fetch_ratings");

  const hasNextPage = page * limit < totalCount;
  const avgRating = ratingAgg._avg.rating ?? 0;

  // Map to response shape
  const result: RatingsResponse = {
    ratings: ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      review: r.review,
      reviewType: r.reviewType,
      createdAt: r.createdAt,
      user: {
        username: r.user.username,
        image: r.user.image,
        name: r.user.name,
      },
      event: r.event
        ? {
            id: r.event.id,
            slug: r.event.slug,
            title: r.event.title,
            startDate: r.event.startDate,
          }
        : null,
    })),
    totalCount,
    hasNextPage,
    avgRating,
  };

  // Cache for 5 minutes
  timer.start("cache_set");
  await cacheSet(cacheKey, result, 300);
  timer.end("cache_set");

  timer.flush();
  return NextResponse.json(result);
}

// ============================================================
// POST — create or update a DjRating (direct or event-anchored)
// ============================================================
// Body:
//   rating      — number 1-5 (required)
//   review      — string, 30-2000 chars (required)
//   eventId     — number | null (optional; null/omitted = direct review)
//   reviewType  — "DIRECT" | "EVENT_ATTENDEE" | "EVENT_ORGANIZER" (optional; auto-detected)
//
// Returns: { id: number, created: boolean }
//
// Validation is delegated to the shared module at
// src/lib/validation/dj-rating-validation.ts to ensure consistency
// between the API route and the server action.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const timer = createTimer("ratings_post");
  const { slug } = await params;

  // --- Auth ---
  timer.start("auth");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  timer.end("auth");
  if (!user) {
    timer.flush();
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- Parse body ---
  let body: {
    rating?: unknown;
    review?: unknown;
    eventId?: unknown;
    reviewType?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    timer.flush();
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // --- Field validation (no DB access) ---
  const fieldResult = validateFields({
    rating: body.rating,
    review: body.review,
    eventId: body.eventId,
    reviewType: body.reviewType,
  });
  if (!fieldResult.ok) {
    return NextResponse.json({ error: fieldResult.error }, { status: 400 });
  }

  const { trimmedReview, isEventReview } = fieldResult;

  // --- Resolve DJ profile ID from slug ---
  timer.start("fetch_profile");
  const djProfile = await prisma.djProfile.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });
  timer.end("fetch_profile");
  if (!djProfile) {
    timer.flush();
    return NextResponse.json(
      { error: "DJ profile not found" },
      { status: 404 },
    );
  }
  if (djProfile.status === "REJECTED") {
    timer.flush();
    return NextResponse.json(
      { error: "DJ profile not available for reviews" },
      { status: 403 },
    );
  }

  // --- Business-rule validation (DB access) ---
  timer.start("validate_rules");
  const ruleResult = await validateBusinessRules({
    userId: user.id,
    djProfileId: djProfile.id,
    isEventReview: isEventReview!,
    eventId: isEventReview ? (body.eventId as number) : undefined,
    reviewType: body.reviewType as ReviewType | undefined,
  });
  timer.end("validate_rules");
  if (!ruleResult.ok) {
    timer.flush();
    // Map validation errors to 403 (forbidden) rather than 400 (bad request),
    // since they're business-rule violations, not malformed input.
    return NextResponse.json({ error: ruleResult.error }, { status: 403 });
  }

  const {
    resolvedReviewType,
    djProfile: validatedDj,
    eventSlug,
    eventTitle,
  } = ruleResult;

  // --- Upsert (race-condition safe) ---
  timer.start("upsert");
  const { id: ratingId, created } = await upsertDjRating({
    userId: user.id,
    djProfileId: validatedDj!.id,
    eventId: isEventReview ? (body.eventId as number) : null,
    rating: body.rating as number,
    review: trimmedReview!,
    reviewType: resolvedReviewType!,
  });
  timer.end("upsert");

  // --- Post-submit side effects (shared with server action) ---
  timer.start("post_effects");
  await runPostSubmitEffects({
    ratingId,
    created,
    rating: body.rating as number,
    trimmedReview: trimmedReview!,
    isEventReview: isEventReview!,
    eventId: isEventReview ? (body.eventId as number) : null,
    djProfileId: validatedDj!.id,
    djProfileSlug: validatedDj!.slug,
    djProfileUserId: validatedDj!.userId,
    djStageName: validatedDj!.stageName,
    reviewerId: user.id,
    eventSlug: eventSlug ?? null,
    eventTitle: eventTitle ?? null,
  });
  timer.end("post_effects");

  timer.flush();
  return NextResponse.json(
    { id: ratingId, created },
    { status: created ? 201 : 200 },
  );
}
