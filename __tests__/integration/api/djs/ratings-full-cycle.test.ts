import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { GET, POST } from "@/app/api/djs/[slug]/ratings/route";

// ── Mocks ─────────────────────────────────────────────────────────────────

vi.mock("@/lib/client", () => ({
  default: {
    djProfile: {
      findUnique: vi.fn(),
    },
    djRating: {
      findMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
      create: vi.fn(),
    },
    djGigReview: {
      findMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/validation/dj-rating-validation", () => ({
  validateFields: vi.fn(),
  validateBusinessRules: vi.fn(),
  upsertDjRating: vi.fn(),
  VALID_REVIEW_TYPES: ["DIRECT", "EVENT_ATTENDEE", "EVENT_ORGANIZER"],
}));

vi.mock("@/lib/ratings/post-submit-effects", () => ({
  runPostSubmitEffects: vi.fn(),
}));

vi.mock("@/lib/cache", () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/utils/performance", () => ({
  createTimer: () => ({
    start: vi.fn(),
    end: vi.fn(),
    flush: vi.fn(),
  }),
}));

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import {
  validateFields,
  validateBusinessRules,
  upsertDjRating,
} from "@/lib/validation/dj-rating-validation";
import { runPostSubmitEffects } from "@/lib/ratings/post-submit-effects";

// ── Helpers ───────────────────────────────────────────────────────────────

function mockAuthedUser(userId = "user-123") {
  (createClient as any).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } } }),
    },
  });
}

function mockUnauthenticated() {
  (createClient as any).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  });
}

function makeGetRequest(queryString: string) {
  return new NextRequest(
    `http://localhost:3000/api/djs/test-dj/ratings?${queryString}`,
  );
}

function makePostRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/djs/test-dj/ratings", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

const params = Promise.resolve({ slug: "test-dj" });

// ── Test data fixtures ────────────────────────────────────────────────────

const DJ_PROFILE = { id: 1, status: "APPROVED" };

const FAN_USER = {
  id: "fan-user-id",
  username: "fan_user",
  name: "Fan User",
  image: "/rated-1.webp",
  roles: [{ role: "FAN" }],
};

const ORGANIZER_USER = {
  id: "organizer-user-id",
  username: "organizer_user",
  name: "Organizer User",
  image: "/rated-2.webp",
  roles: [{ role: "ORGANIZER" }],
};

const DJ_USER = {
  id: "dj-user-id",
  username: "dj_user",
  name: "DJ User",
  image: "/rated-3.webp",
  roles: [{ role: "DJ" }],
};

const MULTI_ROLE_USER = {
  id: "multi-role-user-id",
  username: "multi_role_user",
  name: "Multi Role User",
  image: "/rated-4.webp",
  roles: [{ role: "FAN" }, { role: "ORGANIZER" }],
};

const EVENT = {
  id: 10,
  slug: "summer-beats",
  title: "Summer Beats Festival",
  startDate: new Date("2024-06-15T00:00:00.000Z"),
};

const GIG = {
  id: 20,
  slug: "wedding-gig",
  title: "Wedding Reception",
};

// Sample DjRating records for each review type
const DIRECT_REVIEW_FROM_FAN = {
  id: 101,
  rating: 5,
  review: "Absolutely incredible set! The transitions were seamless.",
  reviewType: "DIRECT",
  createdAt: new Date("2024-07-01T00:00:00.000Z"),
  user: FAN_USER,
  event: null,
};

const DIRECT_REVIEW_FROM_ORGANIZER = {
  id: 102,
  rating: 4,
  review: "Professional from start to finish. Great communication.",
  reviewType: "DIRECT",
  createdAt: new Date("2024-07-02T00:00:00.000Z"),
  user: ORGANIZER_USER,
  event: null,
};

const DIRECT_REVIEW_FROM_DJ = {
  id: 103,
  rating: 5,
  review: "One of the best DJs we've worked with this year.",
  reviewType: "DIRECT",
  createdAt: new Date("2024-07-03T00:00:00.000Z"),
  user: DJ_USER,
  event: null,
};

const EVENT_ATTENDEE_REVIEW = {
  id: 201,
  rating: 5,
  review:
    "Saw this DJ live at the event and the performance was unforgettable.",
  reviewType: "EVENT_ATTENDEE",
  createdAt: new Date("2024-07-04T00:00:00.000Z"),
  user: FAN_USER,
  event: EVENT,
};

const EVENT_ORGANIZER_REVIEW = {
  id: 202,
  rating: 4,
  review: "As the event organizer, I was impressed by the punctuality.",
  reviewType: "EVENT_ORGANIZER",
  createdAt: new Date("2024-07-05T00:00:00.000Z"),
  user: ORGANIZER_USER,
  event: EVENT,
};

const EVENT_ATTENDEE_FROM_MULTI_ROLE = {
  id: 203,
  rating: 5,
  review: "Best event I've been to this year. The music was on point.",
  reviewType: "EVENT_ATTENDEE",
  createdAt: new Date("2024-07-06T00:00:00.000Z"),
  user: MULTI_ROLE_USER,
  event: EVENT,
};

// DjGigReview records (from the DjGigReview table)
const GIG_REVIEW_FROM_ORGANIZER = {
  id: 301,
  rating: 5,
  review:
    "Excellent gig! Everything was well-organized and payment was prompt.",
  createdAt: new Date("2024-07-07T00:00:00.000Z"),
  organizer: ORGANIZER_USER,
  gig: GIG,
};

const GIG_REVIEW_FROM_MULTI_ROLE = {
  id: 302,
  rating: 4,
  review: "Good overall experience. Clear instructions and fair compensation.",
  createdAt: new Date("2024-07-08T00:00:00.000Z"),
  organizer: MULTI_ROLE_USER,
  gig: GIG,
};

// ── Tests ─────────────────────────────────────────────────────────────────

describe("Review Types Full Cycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.djProfile.findUnique as any).mockResolvedValue(DJ_PROFILE);
  });

  // ════════════════════════════════════════════════════════════════════════
  // 1. GET — All reviews (merged DjRating + DjGigReview)
  // ════════════════════════════════════════════════════════════════════════
  describe("GET all reviews (merged)", () => {
    it("returns merged DjRating + DjGigReview records sorted by date desc", async () => {
      const allDjRatings = [
        DIRECT_REVIEW_FROM_FAN,
        DIRECT_REVIEW_FROM_ORGANIZER,
        EVENT_ATTENDEE_REVIEW,
        EVENT_ORGANIZER_REVIEW,
      ];
      const allGigReviews = [GIG_REVIEW_FROM_ORGANIZER];

      (prisma.djRating.findMany as any).mockResolvedValue(allDjRatings);
      (prisma.djRating.count as any).mockResolvedValue(4);
      (prisma.djRating.aggregate as any).mockResolvedValue({
        _avg: { rating: 4.5 },
      });
      (prisma.djGigReview.findMany as any).mockResolvedValue(allGigReviews);
      (prisma.djGigReview.count as any).mockResolvedValue(1);
      (prisma.djGigReview.aggregate as any).mockResolvedValue({
        _avg: { rating: 5 },
      });

      const response = await GET(makeGetRequest("page=1&limit=6"), { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ratings).toHaveLength(5);
      expect(data.totalCount).toBe(5);
      expect(data.hasNextPage).toBe(false);

      // Verify merged and sorted by createdAt desc
      const dates = data.ratings.map((r: any) =>
        new Date(r.createdAt).getTime(),
      );
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i]).toBeLessThanOrEqual(dates[i - 1]);
      }

      // Verify gig reviews are mapped with reviewType GIG_ORGANIZER
      const gigReview = data.ratings.find(
        (r: any) => r.reviewType === "GIG_ORGANIZER",
      );
      expect(gigReview).toBeDefined();
      expect(gigReview.gig).toEqual({
        id: GIG.id,
        slug: GIG.slug,
        title: GIG.title,
      });
      expect(gigReview.event).toBeNull();

      // Verify DjRating records have gig: null
      const djRating = data.ratings.find((r: any) => r.reviewType === "DIRECT");
      expect(djRating.gig).toBeNull();
    });

    it("includes user roles in the response for all review types", async () => {
      (prisma.djRating.findMany as any).mockResolvedValue([
        DIRECT_REVIEW_FROM_FAN,
        EVENT_ATTENDEE_REVIEW,
      ]);
      (prisma.djRating.count as any).mockResolvedValue(2);
      (prisma.djRating.aggregate as any).mockResolvedValue({
        _avg: { rating: 5 },
      });
      (prisma.djGigReview.findMany as any).mockResolvedValue([
        GIG_REVIEW_FROM_ORGANIZER,
      ]);
      (prisma.djGigReview.count as any).mockResolvedValue(1);
      (prisma.djGigReview.aggregate as any).mockResolvedValue({
        _avg: { rating: 5 },
      });

      const response = await GET(makeGetRequest("page=1&limit=6"), { params });
      const data = await response.json();

      // Direct review from FAN user
      const directReview = data.ratings.find((r: any) => r.id === 101);
      expect(directReview.user.roles).toEqual(["FAN"]);

      // Event attendee review from FAN user
      const eventReview = data.ratings.find((r: any) => r.id === 201);
      expect(eventReview.user.roles).toEqual(["FAN"]);

      // Gig review from ORGANIZER user
      const gigReview = data.ratings.find((r: any) => r.id === 301);
      expect(gigReview.user.roles).toEqual(["ORGANIZER"]);
    });

    it("includes avatar images for all users", async () => {
      (prisma.djRating.findMany as any).mockResolvedValue([
        DIRECT_REVIEW_FROM_FAN,
        DIRECT_REVIEW_FROM_DJ,
      ]);
      (prisma.djRating.count as any).mockResolvedValue(2);
      (prisma.djRating.aggregate as any).mockResolvedValue({
        _avg: { rating: 5 },
      });
      (prisma.djGigReview.findMany as any).mockResolvedValue([
        GIG_REVIEW_FROM_ORGANIZER,
      ]);
      (prisma.djGigReview.count as any).mockResolvedValue(1);
      (prisma.djGigReview.aggregate as any).mockResolvedValue({
        _avg: { rating: 5 },
      });

      const response = await GET(makeGetRequest("page=1&limit=6"), { params });
      const data = await response.json();

      for (const r of data.ratings) {
        expect(r.user.image).toBeTruthy();
        expect(r.user.image).toMatch(/^\/rated-\d+\.webp$/);
      }
    });

    it("computes combined average rating from both sources", async () => {
      // DjRating: 4 reviews, avg 4.5 -> total 18
      // DjGigReview: 1 review, avg 5 -> total 5
      // Combined: (18 + 5) / 5 = 4.6
      (prisma.djRating.findMany as any).mockResolvedValue([]);
      (prisma.djRating.count as any).mockResolvedValue(4);
      (prisma.djRating.aggregate as any).mockResolvedValue({
        _avg: { rating: 4.5 },
      });
      (prisma.djGigReview.findMany as any).mockResolvedValue([]);
      (prisma.djGigReview.count as any).mockResolvedValue(1);
      (prisma.djGigReview.aggregate as any).mockResolvedValue({
        _avg: { rating: 5 },
      });

      const response = await GET(makeGetRequest("page=1&limit=6"), { params });
      const data = await response.json();

      expect(data.avgRating).toBeCloseTo(4.6, 5);
      expect(data.totalCount).toBe(5);
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // 2. GET — Direct reviews only (eventId=direct)
  // ════════════════════════════════════════════════════════════════════════
  describe("GET direct reviews (eventId=direct)", () => {
    it("returns only direct reviews from DjRating, no gig reviews", async () => {
      const directRatings = [
        DIRECT_REVIEW_FROM_FAN,
        DIRECT_REVIEW_FROM_ORGANIZER,
        DIRECT_REVIEW_FROM_DJ,
      ];

      (prisma.djRating.findMany as any).mockResolvedValue(directRatings);
      (prisma.djRating.count as any).mockResolvedValue(3);
      (prisma.djRating.aggregate as any).mockResolvedValue({
        _avg: { rating: 4.67 },
      });
      // Gig reviews should NOT be fetched in direct mode
      (prisma.djGigReview.findMany as any).mockResolvedValue([]);
      (prisma.djGigReview.count as any).mockResolvedValue(0);
      (prisma.djGigReview.aggregate as any).mockResolvedValue({
        _avg: { rating: null },
      });

      const response = await GET(
        makeGetRequest("page=1&limit=6&eventId=direct"),
        { params },
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ratings).toHaveLength(3);

      // All should be DIRECT type
      for (const r of data.ratings) {
        expect(r.reviewType).toBe("DIRECT");
        expect(r.event).toBeNull();
        expect(r.gig).toBeNull();
      }

      // Verify different user roles are present
      const roles = data.ratings.map((r: any) => r.user.roles[0]);
      expect(roles).toContain("FAN");
      expect(roles).toContain("ORGANIZER");
      expect(roles).toContain("DJ");
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // 3. GET — Event reviews only (eventId=event)
  // ════════════════════════════════════════════════════════════════════════
  describe("GET event reviews (eventId=event)", () => {
    it("returns only event-anchored reviews (attendee + organizer)", async () => {
      const eventRatings = [
        EVENT_ATTENDEE_REVIEW,
        EVENT_ORGANIZER_REVIEW,
        EVENT_ATTENDEE_FROM_MULTI_ROLE,
      ];

      (prisma.djRating.findMany as any).mockResolvedValue(eventRatings);
      (prisma.djRating.count as any).mockResolvedValue(3);
      (prisma.djRating.aggregate as any).mockResolvedValue({
        _avg: { rating: 4.67 },
      });
      // Gig reviews should NOT be fetched in event mode
      (prisma.djGigReview.findMany as any).mockResolvedValue([]);
      (prisma.djGigReview.count as any).mockResolvedValue(0);
      (prisma.djGigReview.aggregate as any).mockResolvedValue({
        _avg: { rating: null },
      });

      const response = await GET(
        makeGetRequest("page=1&limit=6&eventId=event"),
        { params },
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ratings).toHaveLength(3);

      // All should have event context
      for (const r of data.ratings) {
        expect(r.event).not.toBeNull();
        expect(r.event.id).toBe(EVENT.id);
        expect(r.event.title).toBe(EVENT.title);
        expect(r.gig).toBeNull();
      }

      // Should include both EVENT_ATTENDEE and EVENT_ORGANIZER types
      const types = data.ratings.map((r: any) => r.reviewType);
      expect(types).toContain("EVENT_ATTENDEE");
      expect(types).toContain("EVENT_ORGANIZER");

      // Should NOT include DIRECT or GIG_ORGANIZER
      expect(types).not.toContain("DIRECT");
      expect(types).not.toContain("GIG_ORGANIZER");
    });

    it("includes event context (title, slug, startDate) for each review", async () => {
      (prisma.djRating.findMany as any).mockResolvedValue([
        EVENT_ATTENDEE_REVIEW,
      ]);
      (prisma.djRating.count as any).mockResolvedValue(1);
      (prisma.djRating.aggregate as any).mockResolvedValue({
        _avg: { rating: 5 },
      });
      (prisma.djGigReview.findMany as any).mockResolvedValue([]);
      (prisma.djGigReview.count as any).mockResolvedValue(0);
      (prisma.djGigReview.aggregate as any).mockResolvedValue({
        _avg: { rating: null },
      });

      const response = await GET(
        makeGetRequest("page=1&limit=6&eventId=event"),
        { params },
      );
      const data = await response.json();

      const review = data.ratings[0];
      expect(review.event).toEqual({
        id: EVENT.id,
        slug: EVENT.slug,
        title: EVENT.title,
        startDate: EVENT.startDate.toISOString(),
      });
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // 4. GET — Gig reviews only (eventId=gig)
  // ════════════════════════════════════════════════════════════════════════
  describe("GET gig reviews (eventId=gig)", () => {
    it("returns only DjGigReview records with GIG_ORGANIZER type", async () => {
      const gigReviews = [
        GIG_REVIEW_FROM_ORGANIZER,
        GIG_REVIEW_FROM_MULTI_ROLE,
      ];

      (prisma.djGigReview.findMany as any).mockResolvedValue(gigReviews);
      (prisma.djGigReview.count as any).mockResolvedValue(2);
      (prisma.djGigReview.aggregate as any).mockResolvedValue({
        _avg: { rating: 4.5 },
      });

      const response = await GET(makeGetRequest("page=1&limit=6&eventId=gig"), {
        params,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ratings).toHaveLength(2);

      // All should be GIG_ORGANIZER type
      for (const r of data.ratings) {
        expect(r.reviewType).toBe("GIG_ORGANIZER");
        expect(r.gig).not.toBeNull();
        expect(r.gig.id).toBe(GIG.id);
        expect(r.gig.title).toBe(GIG.title);
        expect(r.event).toBeNull();
      }

      // Should NOT call djRating at all in gig mode
      expect(prisma.djRating.findMany).not.toHaveBeenCalled();
      expect(prisma.djRating.count).not.toHaveBeenCalled();
    });

    it("maps organizer roles correctly for gig reviews", async () => {
      (prisma.djGigReview.findMany as any).mockResolvedValue([
        GIG_REVIEW_FROM_ORGANIZER,
        GIG_REVIEW_FROM_MULTI_ROLE,
      ]);
      (prisma.djGigReview.count as any).mockResolvedValue(2);
      (prisma.djGigReview.aggregate as any).mockResolvedValue({
        _avg: { rating: 4.5 },
      });

      const response = await GET(makeGetRequest("page=1&limit=6&eventId=gig"), {
        params,
      });
      const data = await response.json();

      // First review from pure organizer
      expect(data.ratings[0].user.roles).toEqual(["ORGANIZER"]);

      // Second review from multi-role user (FAN + ORGANIZER)
      expect(data.ratings[1].user.roles).toEqual(["FAN", "ORGANIZER"]);
    });

    it("includes gig context (title, slug) for each review", async () => {
      (prisma.djGigReview.findMany as any).mockResolvedValue([
        GIG_REVIEW_FROM_ORGANIZER,
      ]);
      (prisma.djGigReview.count as any).mockResolvedValue(1);
      (prisma.djGigReview.aggregate as any).mockResolvedValue({
        _avg: { rating: 5 },
      });

      const response = await GET(makeGetRequest("page=1&limit=6&eventId=gig"), {
        params,
      });
      const data = await response.json();

      const review = data.ratings[0];
      expect(review.gig).toEqual({
        id: GIG.id,
        slug: GIG.slug,
        title: GIG.title,
      });
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // 5. POST — Create reviews (full cycle for each type)
  // ════════════════════════════════════════════════════════════════════════
  describe("POST — Create reviews (full cycle)", () => {
    it("creates a DIRECT review from a FAN user", async () => {
      mockAuthedUser("fan-user-id");
      (validateFields as any).mockReturnValue({
        ok: true,
        trimmedReview: "Amazing DJ! Would definitely book again for sure!",
        isEventReview: false,
      });
      (validateBusinessRules as any).mockResolvedValue({
        ok: true,
        resolvedReviewType: "DIRECT",
        djProfile: {
          id: 1,
          slug: "test-dj",
          userId: "dj-owner",
          stageName: "DJ Test",
        },
      });
      (upsertDjRating as any).mockResolvedValue({ id: 999, created: true });

      const response = await POST(
        makePostRequest({
          rating: 5,
          review: "Amazing DJ! Would definitely book again for sure!",
        }),
        { params },
      );

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual({ id: 999, created: true });

      expect(upsertDjRating).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "fan-user-id",
          djProfileId: 1,
          eventId: null,
          rating: 5,
          reviewType: "DIRECT",
        }),
      );
      expect(runPostSubmitEffects).toHaveBeenCalledTimes(1);
    });

    it("creates an EVENT_ATTENDEE review from a FAN who attended", async () => {
      mockAuthedUser("fan-user-id");
      (validateFields as any).mockReturnValue({
        ok: true,
        trimmedReview: "Incredible live performance at the event!",
        isEventReview: true,
      });
      (validateBusinessRules as any).mockResolvedValue({
        ok: true,
        resolvedReviewType: "EVENT_ATTENDEE",
        djProfile: {
          id: 1,
          slug: "test-dj",
          userId: "dj-owner",
          stageName: "DJ Test",
        },
      });
      (upsertDjRating as any).mockResolvedValue({ id: 998, created: true });

      const response = await POST(
        makePostRequest({
          rating: 5,
          review: "Incredible live performance at the event!",
          eventId: 10,
        }),
        { params },
      );

      expect(response.status).toBe(201);
      expect(upsertDjRating).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "fan-user-id",
          djProfileId: 1,
          eventId: 10,
          rating: 5,
          reviewType: "EVENT_ATTENDEE",
        }),
      );
    });

    it("creates an EVENT_ORGANIZER review from an event organizer", async () => {
      mockAuthedUser("organizer-user-id");
      (validateFields as any).mockReturnValue({
        ok: true,
        trimmedReview: "As the organizer, I was impressed by the punctuality.",
        isEventReview: true,
      });
      (validateBusinessRules as any).mockResolvedValue({
        ok: true,
        resolvedReviewType: "EVENT_ORGANIZER",
        djProfile: {
          id: 1,
          slug: "test-dj",
          userId: "dj-owner",
          stageName: "DJ Test",
        },
      });
      (upsertDjRating as any).mockResolvedValue({ id: 997, created: true });

      const response = await POST(
        makePostRequest({
          rating: 4,
          review: "As the organizer, I was impressed by the punctuality.",
          eventId: 10,
        }),
        { params },
      );

      expect(response.status).toBe(201);
      expect(upsertDjRating).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "organizer-user-id",
          djProfileId: 1,
          eventId: 10,
          rating: 4,
          reviewType: "EVENT_ORGANIZER",
        }),
      );
    });

    it("rejects unauthenticated users from creating any review", async () => {
      mockUnauthenticated();

      const response = await POST(
        makePostRequest({ rating: 5, review: "A".repeat(30) }),
        { params },
      );

      expect(response.status).toBe(401);
      expect(validateFields).not.toHaveBeenCalled();
      expect(upsertDjRating).not.toHaveBeenCalled();
    });

    it("rejects review creation when business rules fail (e.g. did not attend)", async () => {
      mockAuthedUser("fan-user-id");
      (validateFields as any).mockReturnValue({
        ok: true,
        trimmedReview: "Great event set that was amazing to experience!",
        isEventReview: true,
      });
      (validateBusinessRules as any).mockResolvedValue({
        ok: false,
        error: "You must have attended this event to review it",
      });

      const response = await POST(
        makePostRequest({
          rating: 5,
          review: "Great event set that was amazing to experience!",
          eventId: 10,
        }),
        { params },
      );

      expect(response.status).toBe(403);
      expect(upsertDjRating).not.toHaveBeenCalled();
      expect(runPostSubmitEffects).not.toHaveBeenCalled();
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // 6. Pagination — Load More only shows when 6+ reviews
  // ════════════════════════════════════════════════════════════════════════
  describe("Pagination behavior", () => {
    it("hasNextPage is true when totalCount > page * limit", async () => {
      (prisma.djRating.findMany as any).mockResolvedValue([]);
      (prisma.djRating.count as any).mockResolvedValue(10);
      (prisma.djRating.aggregate as any).mockResolvedValue({
        _avg: { rating: 4.5 },
      });
      (prisma.djGigReview.findMany as any).mockResolvedValue([]);
      (prisma.djGigReview.count as any).mockResolvedValue(0);
      (prisma.djGigReview.aggregate as any).mockResolvedValue({
        _avg: { rating: null },
      });

      const response = await GET(makeGetRequest("page=1&limit=6"), { params });
      const data = await response.json();

      expect(data.hasNextPage).toBe(true);
      expect(data.totalCount).toBe(10);
    });

    it("hasNextPage is false when totalCount <= page * limit", async () => {
      (prisma.djRating.findMany as any).mockResolvedValue([]);
      (prisma.djRating.count as any).mockResolvedValue(5);
      (prisma.djRating.aggregate as any).mockResolvedValue({
        _avg: { rating: 4.5 },
      });
      (prisma.djGigReview.findMany as any).mockResolvedValue([]);
      (prisma.djGigReview.count as any).mockResolvedValue(0);
      (prisma.djGigReview.aggregate as any).mockResolvedValue({
        _avg: { rating: null },
      });

      const response = await GET(makeGetRequest("page=1&limit=6"), { params });
      const data = await response.json();

      expect(data.hasNextPage).toBe(false);
      expect(data.totalCount).toBe(5);
    });

    it("hasNextPage is false when totalCount is exactly 6 (boundary)", async () => {
      (prisma.djRating.findMany as any).mockResolvedValue([]);
      (prisma.djRating.count as any).mockResolvedValue(6);
      (prisma.djRating.aggregate as any).mockResolvedValue({
        _avg: { rating: 4.5 },
      });
      (prisma.djGigReview.findMany as any).mockResolvedValue([]);
      (prisma.djGigReview.count as any).mockResolvedValue(0);
      (prisma.djGigReview.aggregate as any).mockResolvedValue({
        _avg: { rating: null },
      });

      const response = await GET(makeGetRequest("page=1&limit=6"), { params });
      const data = await response.json();

      // 1 * 6 = 6, not < 6, so no next page
      expect(data.hasNextPage).toBe(false);
    });

    it("hasNextPage is true when totalCount is 7 (just over boundary)", async () => {
      (prisma.djRating.findMany as any).mockResolvedValue([]);
      (prisma.djRating.count as any).mockResolvedValue(7);
      (prisma.djRating.aggregate as any).mockResolvedValue({
        _avg: { rating: 4.5 },
      });
      (prisma.djGigReview.findMany as any).mockResolvedValue([]);
      (prisma.djGigReview.count as any).mockResolvedValue(0);
      (prisma.djGigReview.aggregate as any).mockResolvedValue({
        _avg: { rating: null },
      });

      const response = await GET(makeGetRequest("page=1&limit=6"), { params });
      const data = await response.json();

      // 1 * 6 = 6 < 7, so there is a next page
      expect(data.hasNextPage).toBe(true);
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // 7. Multi-role user — primary role selection
  // ════════════════════════════════════════════════════════════════════════
  describe("Multi-role users", () => {
    it("returns all roles for a user with multiple roles", async () => {
      (prisma.djRating.findMany as any).mockResolvedValue([
        EVENT_ATTENDEE_FROM_MULTI_ROLE,
      ]);
      (prisma.djRating.count as any).mockResolvedValue(1);
      (prisma.djRating.aggregate as any).mockResolvedValue({
        _avg: { rating: 5 },
      });
      (prisma.djGigReview.findMany as any).mockResolvedValue([
        GIG_REVIEW_FROM_MULTI_ROLE,
      ]);
      (prisma.djGigReview.count as any).mockResolvedValue(1);
      (prisma.djGigReview.aggregate as any).mockResolvedValue({
        _avg: { rating: 4 },
      });

      const response = await GET(makeGetRequest("page=1&limit=6"), { params });
      const data = await response.json();

      // The multi-role user should have both FAN and ORGANIZER roles
      const multiRoleReview = data.ratings.find(
        (r: any) => r.user.username === "multi_role_user",
      );
      expect(multiRoleReview).toBeDefined();
      expect(multiRoleReview.user.roles).toEqual(["FAN", "ORGANIZER"]);
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // 8. Full cycle — Create then GET verifies the review appears
  // ════════════════════════════════════════════════════════════════════════
  describe("Full cycle: create then retrieve", () => {
    it("creates a direct review, then GET returns it with correct fields", async () => {
      // Step 1: Create the review
      mockAuthedUser("fan-user-id");
      (validateFields as any).mockReturnValue({
        ok: true,
        trimmedReview: "Absolutely incredible set! Would book again!",
        isEventReview: false,
      });
      (validateBusinessRules as any).mockResolvedValue({
        ok: true,
        resolvedReviewType: "DIRECT",
        djProfile: {
          id: 1,
          slug: "test-dj",
          userId: "dj-owner",
          stageName: "DJ Test",
        },
      });
      (upsertDjRating as any).mockResolvedValue({ id: 500, created: true });

      const postResponse = await POST(
        makePostRequest({
          rating: 5,
          review: "Absolutely incredible set! Would book again!",
        }),
        { params },
      );
      expect(postResponse.status).toBe(201);

      // Step 2: GET should return the review
      (prisma.djRating.findMany as any).mockResolvedValue([
        {
          id: 500,
          rating: 5,
          review: "Absolutely incredible set! Would book again!",
          reviewType: "DIRECT",
          createdAt: new Date(),
          user: FAN_USER,
          event: null,
        },
      ]);
      (prisma.djRating.count as any).mockResolvedValue(1);
      (prisma.djRating.aggregate as any).mockResolvedValue({
        _avg: { rating: 5 },
      });
      (prisma.djGigReview.findMany as any).mockResolvedValue([]);
      (prisma.djGigReview.count as any).mockResolvedValue(0);
      (prisma.djGigReview.aggregate as any).mockResolvedValue({
        _avg: { rating: null },
      });

      const getResponse = await GET(
        makeGetRequest("page=1&limit=6&eventId=direct"),
        { params },
      );
      const getData = await getResponse.json();

      expect(getData.ratings).toHaveLength(1);
      expect(getData.ratings[0].id).toBe(500);
      expect(getData.ratings[0].rating).toBe(5);
      expect(getData.ratings[0].review).toBe(
        "Absolutely incredible set! Would book again!",
      );
      expect(getData.ratings[0].reviewType).toBe("DIRECT");
      expect(getData.ratings[0].user.name).toBe("Fan User");
      expect(getData.ratings[0].user.roles).toEqual(["FAN"]);
      expect(getData.ratings[0].user.image).toBe("/rated-1.webp");
      expect(getData.ratings[0].event).toBeNull();
      expect(getData.ratings[0].gig).toBeNull();
    });

    it("creates an event attendee review, then GET event filter returns it", async () => {
      // Step 1: Create
      mockAuthedUser("fan-user-id");
      (validateFields as any).mockReturnValue({
        ok: true,
        trimmedReview: "Incredible live performance at the event!",
        isEventReview: true,
      });
      (validateBusinessRules as any).mockResolvedValue({
        ok: true,
        resolvedReviewType: "EVENT_ATTENDEE",
        djProfile: {
          id: 1,
          slug: "test-dj",
          userId: "dj-owner",
          stageName: "DJ Test",
        },
      });
      (upsertDjRating as any).mockResolvedValue({ id: 501, created: true });

      const postResponse = await POST(
        makePostRequest({
          rating: 5,
          review: "Incredible live performance at the event!",
          eventId: 10,
        }),
        { params },
      );
      expect(postResponse.status).toBe(201);

      // Step 2: GET with event filter
      (prisma.djRating.findMany as any).mockResolvedValue([
        {
          id: 501,
          rating: 5,
          review: "Incredible live performance at the event!",
          reviewType: "EVENT_ATTENDEE",
          createdAt: new Date(),
          user: FAN_USER,
          event: EVENT,
        },
      ]);
      (prisma.djRating.count as any).mockResolvedValue(1);
      (prisma.djRating.aggregate as any).mockResolvedValue({
        _avg: { rating: 5 },
      });
      (prisma.djGigReview.findMany as any).mockResolvedValue([]);
      (prisma.djGigReview.count as any).mockResolvedValue(0);
      (prisma.djGigReview.aggregate as any).mockResolvedValue({
        _avg: { rating: null },
      });

      const getResponse = await GET(
        makeGetRequest("page=1&limit=6&eventId=event"),
        { params },
      );
      const getData = await getResponse.json();

      expect(getData.ratings).toHaveLength(1);
      expect(getData.ratings[0].reviewType).toBe("EVENT_ATTENDEE");
      expect(getData.ratings[0].event.title).toBe("Summer Beats Festival");
      expect(getData.ratings[0].gig).toBeNull();
    });

    it("a gig review exists, then GET gig filter returns it with gig context", async () => {
      // DjGigReview is created via a different flow (server action),
      // so we just verify GET returns it correctly
      (prisma.djGigReview.findMany as any).mockResolvedValue([
        GIG_REVIEW_FROM_ORGANIZER,
      ]);
      (prisma.djGigReview.count as any).mockResolvedValue(1);
      (prisma.djGigReview.aggregate as any).mockResolvedValue({
        _avg: { rating: 5 },
      });

      const getResponse = await GET(
        makeGetRequest("page=1&limit=6&eventId=gig"),
        { params },
      );
      const getData = await getResponse.json();

      expect(getData.ratings).toHaveLength(1);
      expect(getData.ratings[0].reviewType).toBe("GIG_ORGANIZER");
      expect(getData.ratings[0].gig.title).toBe("Wedding Reception");
      expect(getData.ratings[0].gig.slug).toBe("wedding-gig");
      expect(getData.ratings[0].event).toBeNull();
      expect(getData.ratings[0].user.roles).toEqual(["ORGANIZER"]);
      expect(getData.ratings[0].user.image).toBe("/rated-2.webp");
    });
  });
});
