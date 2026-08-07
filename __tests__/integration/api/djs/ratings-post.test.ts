import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/djs/[slug]/ratings/route";

// ── Mocks ─────────────────────────────────────────────────────────────────
vi.mock("@/lib/client", () => ({
  default: {
    djProfile: {
      findUnique: vi.fn(),
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
}));

vi.mock("@/lib/ratings/post-submit-effects", () => ({
  runPostSubmitEffects: vi.fn(),
}));

vi.mock("@/lib/cache", () => ({
  cacheGet: vi.fn(),
  cacheSet: vi.fn(),
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

function makeRequest(body: unknown) {
  return new NextRequest(
    "http://localhost:3000/api/djs/test-dj/ratings",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    },
  );
}

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

const params = Promise.resolve({ slug: "test-dj" });

describe("POST /api/djs/[slug]/ratings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the user is not authenticated", async () => {
    mockUnauthenticated();

    const response = await POST(makeRequest({ rating: 5, review: "A".repeat(30) }), {
      params,
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: "Unauthorized" });
    expect(validateFields).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid JSON body", async () => {
    mockAuthedUser();

    const badRequest = new NextRequest(
      "http://localhost:3000/api/djs/test-dj/ratings",
      {
        method: "POST",
        body: "{not-json",
        headers: { "content-type": "application/json" },
      },
    );

    const response = await POST(badRequest, { params });
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: "Invalid JSON" });
  });

  it("returns 400 when field validation fails", async () => {
    mockAuthedUser();
    (validateFields as any).mockReturnValue({
      ok: false,
      error: "Rating must be an integer between 1 and 5",
    });

    const response = await POST(
      makeRequest({ rating: 9, review: "A".repeat(30) }),
      { params },
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toMatch(/rating/i);
    expect(prisma.djProfile.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when the DJ profile does not exist", async () => {
    mockAuthedUser();
    (validateFields as any).mockReturnValue({
      ok: true,
      trimmedReview: "A".repeat(30),
      isEventReview: false,
    });
    (prisma.djProfile.findUnique as any).mockResolvedValue(null);

    const response = await POST(
      makeRequest({ rating: 5, review: "A".repeat(30) }),
      { params },
    );

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: "DJ profile not found" });
  });

  it("returns 403 when the DJ profile is rejected", async () => {
    mockAuthedUser();
    (validateFields as any).mockReturnValue({
      ok: true,
      trimmedReview: "A".repeat(30),
      isEventReview: false,
    });
    (prisma.djProfile.findUnique as any).mockResolvedValue({
      id: 1,
      status: "REJECTED",
    });

    const response = await POST(
      makeRequest({ rating: 5, review: "A".repeat(30) }),
      { params },
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data).toEqual({ error: "DJ profile not available for reviews" });
  });

  it("returns 403 when business-rule validation fails (e.g. did not attend event)", async () => {
    mockAuthedUser();
    (validateFields as any).mockReturnValue({
      ok: true,
      trimmedReview: "A".repeat(30),
      isEventReview: true,
    });
    (prisma.djProfile.findUnique as any).mockResolvedValue({
      id: 1,
      status: "APPROVED",
    });
    (validateBusinessRules as any).mockResolvedValue({
      ok: false,
      error: "You must have attended this event to review it",
    });

    const response = await POST(
      makeRequest({ rating: 5, review: "A".repeat(30), eventId: 42 }),
      { params },
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toMatch(/attended/i);
    expect(upsertDjRating).not.toHaveBeenCalled();
  });

  it("creates a new rating and returns 201 with created:true", async () => {
    mockAuthedUser("user-123");
    (validateFields as any).mockReturnValue({
      ok: true,
      trimmedReview: "Great DJ, would book again for sure!",
      isEventReview: false,
    });
    (prisma.djProfile.findUnique as any).mockResolvedValue({
      id: 1,
      status: "APPROVED",
    });
    (validateBusinessRules as any).mockResolvedValue({
      ok: true,
      resolvedReviewType: "DIRECT",
      djProfile: { id: 1, slug: "test-dj", userId: "dj-owner", stageName: "DJ Test" },
    });
    (upsertDjRating as any).mockResolvedValue({ id: 99, created: true });

    const response = await POST(
      makeRequest({ rating: 5, review: "Great DJ, would book again for sure!" }),
      { params },
    );

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toEqual({ id: 99, created: true });
    expect(upsertDjRating).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-123",
        djProfileId: 1,
        eventId: null,
        rating: 5,
        reviewType: "DIRECT",
      }),
    );
    expect(runPostSubmitEffects).toHaveBeenCalledTimes(1);
  });

  it("updates an existing rating and returns 200 with created:false", async () => {
    mockAuthedUser("user-123");
    (validateFields as any).mockReturnValue({
      ok: true,
      trimmedReview: "Updated review text that meets the minimum length.",
      isEventReview: false,
    });
    (prisma.djProfile.findUnique as any).mockResolvedValue({
      id: 1,
      status: "APPROVED",
    });
    (validateBusinessRules as any).mockResolvedValue({
      ok: true,
      resolvedReviewType: "DIRECT",
      djProfile: { id: 1, slug: "test-dj", userId: "dj-owner", stageName: "DJ Test" },
    });
    (upsertDjRating as any).mockResolvedValue({ id: 99, created: false });

    const response = await POST(
      makeRequest({
        rating: 4,
        review: "Updated review text that meets the minimum length.",
      }),
      { params },
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ id: 99, created: false });
  });

  it("passes eventId through for event-anchored reviews", async () => {
    mockAuthedUser("user-123");
    (validateFields as any).mockReturnValue({
      ok: true,
      trimmedReview: "Amazing set at the festival, loved every minute!",
      isEventReview: true,
    });
    (prisma.djProfile.findUnique as any).mockResolvedValue({
      id: 1,
      status: "APPROVED",
    });
    (validateBusinessRules as any).mockResolvedValue({
      ok: true,
      resolvedReviewType: "EVENT_ATTENDEE",
      djProfile: { id: 1, slug: "test-dj", userId: "dj-owner", stageName: "DJ Test" },
      eventSlug: "summer-fest",
      eventTitle: "Summer Fest",
    });
    (upsertDjRating as any).mockResolvedValue({ id: 100, created: true });

    await POST(
      makeRequest({
        rating: 5,
        review: "Amazing set at the festival, loved every minute!",
        eventId: 42,
      }),
      { params },
    );

    expect(upsertDjRating).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: 42, reviewType: "EVENT_ATTENDEE" }),
    );
    expect(runPostSubmitEffects).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 42,
        eventSlug: "summer-fest",
        eventTitle: "Summer Fest",
      }),
    );
  });
});
