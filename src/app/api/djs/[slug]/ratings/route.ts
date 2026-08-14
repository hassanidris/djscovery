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
    roles: string[];
  };
  event: {
    id: number;
    slug: string;
    title: string;
    startDate: Date;
  } | null;
  gig: {
    id: number;
    slug: string | null;
    title: string;
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
  const gigOnly = eventIdParam === "gig"; // all gig reviews (from DjGigReview)
  const eventId =
    !directOnly && !eventOnly && !gigOnly && eventIdParam
      ? Number(eventIdParam)
      : null;
  const filterByEvent =
    !directOnly &&
    !eventOnly &&
    !gigOnly &&
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

  if (eventIdParam && !directOnly && !eventOnly && !gigOnly && !filterByEvent) {
    return NextResponse.json(
      { error: "Invalid eventId parameter" },
      { status: 400 },
    );
  }

  // Build the where clause for DjRating based on filters
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
      : gigOnly
        ? "gig"
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

  // ── Gig-only mode: fetch from DjGigReview table ──────────────────────
  if (gigOnly) {
    timer.start("fetch_gig_reviews");
    const gigWhere = { djProfileId: djProfile.id };
    const [gigReviews, gigTotalCount, gigRatingAgg] = await Promise.all([
      prisma.djGigReview.findMany({
        where: gigWhere,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          organizer: {
            select: {
              username: true,
              image: true,
              name: true,
              roles: { select: { role: true } },
            },
          },
          gig: {
            select: {
              id: true,
              slug: true,
              title: true,
            },
          },
        },
      }),
      prisma.djGigReview.count({ where: gigWhere }),
      prisma.djGigReview.aggregate({
        where: gigWhere,
        _avg: { rating: true },
      }),
    ]);
    timer.end("fetch_gig_reviews");

    const gigHasNextPage = page * limit < gigTotalCount;
    const gigAvgRating = gigRatingAgg._avg.rating ?? 0;

    const gigResult: RatingsResponse = {
      ratings: gigReviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        review: r.review,
        reviewType: "GIG_ORGANIZER",
        createdAt: r.createdAt,
        user: {
          username: r.organizer.username,
          image: r.organizer.image,
          name: r.organizer.name,
          roles: r.organizer.roles.map((ur) => ur.role),
        },
        event: null,
        gig: r.gig
          ? {
              id: r.gig.id,
              slug: r.gig.slug,
              title: r.gig.title,
            }
          : null,
      })),
      totalCount: gigTotalCount,
      hasNextPage: gigHasNextPage,
      avgRating: gigAvgRating,
    };

    timer.start("cache_set");
    await cacheSet(cacheKey, gigResult, 300);
    timer.end("cache_set");

    timer.flush();
    return NextResponse.json(gigResult);
  }

  // ── DjRating mode (all, direct, event, specific event) ──────────────
  // When fetching "all", also fetch DjGigReview records and merge them
  const fetchGigReviewsToo = !directOnly && !eventOnly && !filterByEvent;

  // In "all" mode we merge two sources (DjRating + DjGigReview) sorted by
  // createdAt, so the correct page window must be sliced from the merged
  // list. Fetching page * limit from each source (no skip) guarantees that
  // the merged slice [(page-1)*limit, page*limit] contains neither skipped
  // nor repeated records. Non-"all" modes use standard skip/take pagination.
  const djRatingSkip = fetchGigReviewsToo ? 0 : (page - 1) * limit;
  const djRatingTake = fetchGigReviewsToo ? page * limit : limit;

  timer.start("fetch_ratings");
  const [
    ratings,
    totalCount,
    ratingAgg,
    gigReviews,
    gigTotalCount,
    gigRatingAgg,
  ] = await Promise.all([
    prisma.djRating.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: djRatingSkip,
      take: djRatingTake,
      include: {
        user: {
          select: {
            username: true,
            image: true,
            name: true,
            roles: { select: { role: true } },
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
    // Only fetch gig reviews when in "all" mode
    fetchGigReviewsToo
      ? prisma.djGigReview.findMany({
          where: { djProfileId: djProfile.id },
          orderBy: { createdAt: "desc" },
          take: page * limit,
          include: {
            organizer: {
              select: {
                username: true,
                image: true,
                name: true,
                roles: { select: { role: true } },
              },
            },
            gig: {
              select: {
                id: true,
                slug: true,
                title: true,
              },
            },
          },
        })
      : Promise.resolve([]),
    fetchGigReviewsToo
      ? prisma.djGigReview.count({ where: { djProfileId: djProfile.id } })
      : Promise.resolve(0),
    fetchGigReviewsToo
      ? prisma.djGigReview.aggregate({
          where: { djProfileId: djProfile.id },
          _avg: { rating: true },
        })
      : Promise.resolve({ _avg: { rating: null as number | null } }),
  ]);
  timer.end("fetch_ratings");

  // Map DjRating records to response shape
  const djRatingItems: RatingItem[] = ratings.map((r) => ({
    id: r.id,
    rating: r.rating,
    review: r.review,
    reviewType: r.reviewType,
    createdAt: r.createdAt,
    user: {
      username: r.user.username,
      image: r.user.image,
      name: r.user.name,
      roles: r.user.roles.map((ur) => ur.role),
    },
    event: r.event
      ? {
          id: r.event.id,
          slug: r.event.slug,
          title: r.event.title,
          startDate: r.event.startDate,
        }
      : null,
    gig: null,
  }));

  // Map DjGigReview records to the same response shape (only in "all" mode)
  const gigReviewItems: RatingItem[] = gigReviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    review: r.review,
    reviewType: "GIG_ORGANIZER",
    createdAt: r.createdAt,
    user: {
      username: r.organizer.username,
      image: r.organizer.image,
      name: r.organizer.name,
      roles: r.organizer.roles.map((ur) => ur.role),
    },
    event: null,
    gig: r.gig
      ? {
          id: r.gig.id,
          slug: r.gig.slug,
          title: r.gig.title,
        }
      : null,
  }));

  // Merge and sort by createdAt desc (only in "all" mode; otherwise gigReviews is empty)
  const allItems = [...djRatingItems, ...gigReviewItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Apply the page window to the merged list.
  // In "all" mode we fetched page * limit from each source, so we slice
  // [(page-1)*limit, page*limit] from the merged+sorted list.
  // In non-"all" modes gigReviews is empty and djRatingItems already
  // contains the correct page, so slice(0, limit) is a no-op.
  const paginatedItems = fetchGigReviewsToo
    ? allItems.slice((page - 1) * limit, page * limit)
    : allItems.slice(0, limit);

  const combinedTotalCount = totalCount + gigTotalCount;
  const djAvgRating = ratingAgg._avg.rating ?? 0;
  const gigAvgRating = gigRatingAgg._avg.rating ?? 0;
  const combinedAvgRating =
    combinedTotalCount > 0
      ? (djAvgRating * totalCount + gigAvgRating * gigTotalCount) /
        combinedTotalCount
      : 0;

  const hasNextPage = page * limit < combinedTotalCount;

  const result: RatingsResponse = {
    ratings: paginatedItems,
    totalCount: combinedTotalCount,
    hasNextPage,
    avgRating: combinedAvgRating,
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
