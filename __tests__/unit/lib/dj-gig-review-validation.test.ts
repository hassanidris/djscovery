import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validateFields,
  validateBusinessRules,
  findExistingDjGigReview,
  upsertDjGigReview,
  MIN_REVIEW_LENGTH,
  MAX_REVIEW_LENGTH,
} from "@/lib/validation/dj-gig-review-validation";

vi.mock("@/lib/client", () => ({
  default: {
    djProfile: {
      findUnique: vi.fn(),
    },
    gig: {
      findUnique: vi.fn(),
    },
    gigApplication: {
      findUnique: vi.fn(),
    },
    hire: {
      findUnique: vi.fn(),
    },
    organizerProfile: {
      findUnique: vi.fn(),
    },
    djGigReview: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import prisma from "@/lib/client";

describe("validateFields", () => {
  describe("rating", () => {
    it("accepts integer ratings 1-5", () => {
      for (const r of [1, 2, 3, 4, 5]) {
        const result = validateFields({
          rating: r,
          review: "A".repeat(MIN_REVIEW_LENGTH),
        });
        expect(result.ok).toBe(true);
      }
    });

    it("rejects rating below 1", () => {
      const result = validateFields({ rating: 0, review: "A".repeat(30) });
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/rating/i);
    });

    it("rejects rating above 5", () => {
      const result = validateFields({ rating: 6, review: "A".repeat(30) });
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/rating/i);
    });

    it("rejects non-integer rating", () => {
      const result = validateFields({ rating: 3.5, review: "A".repeat(30) });
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/rating/i);
    });

    it("rejects non-number rating", () => {
      const result = validateFields({
        rating: "5",
        review: "A".repeat(30),
      });
      expect(result.ok).toBe(false);
    });

    it("rejects undefined rating", () => {
      const result = validateFields({
        rating: undefined,
        review: "A".repeat(30),
      });
      expect(result.ok).toBe(false);
    });

    it("rejects NaN rating", () => {
      const result = validateFields({ rating: NaN, review: "A".repeat(30) });
      expect(result.ok).toBe(false);
    });
  });

  describe("review text", () => {
    it("accepts review at minimum length", () => {
      const result = validateFields({
        rating: 5,
        review: "A".repeat(MIN_REVIEW_LENGTH),
      });
      expect(result.ok).toBe(true);
      expect(result.trimmedReview).toBe("A".repeat(MIN_REVIEW_LENGTH));
    });

    it("accepts review at maximum length", () => {
      const result = validateFields({
        rating: 5,
        review: "A".repeat(MAX_REVIEW_LENGTH),
      });
      expect(result.ok).toBe(true);
    });

    it("rejects review below minimum length", () => {
      const result = validateFields({
        rating: 5,
        review: "A".repeat(MIN_REVIEW_LENGTH - 1),
      });
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/at least/);
    });

    it("rejects review above maximum length", () => {
      const result = validateFields({
        rating: 5,
        review: "A".repeat(MAX_REVIEW_LENGTH + 1),
      });
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/at most/);
    });

    it("rejects non-string review", () => {
      const result = validateFields({
        rating: 5,
        review: 123,
      });
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/string/i);
    });

    it("trims whitespace before length check", () => {
      const result = validateFields({
        rating: 5,
        review: `   ${"A".repeat(MIN_REVIEW_LENGTH)}   `,
      });
      expect(result.ok).toBe(true);
      expect(result.trimmedReview).toBe("A".repeat(MIN_REVIEW_LENGTH));
    });

    it("rejects review that is only whitespace", () => {
      const result = validateFields({
        rating: 5,
        review: "   ".repeat(MIN_REVIEW_LENGTH),
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("valid combinations", () => {
    it("valid review with all fields", () => {
      const result = validateFields({
        rating: 4,
        review: "Great gig experience, would work with this organizer again!",
      });
      expect(result.ok).toBe(true);
      expect(result.trimmedReview).toBe(
        "Great gig experience, would work with this organizer again!",
      );
    });
  });
});

describe("validateBusinessRules", () => {
  const BASE_CTX = {
    userId: "dj-user-id",
    gigId: 1,
    djProfileId: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("DJ profile validation", () => {
    it("rejects when DJ profile not found", async () => {
      (prisma.djProfile.findUnique as any).mockResolvedValue(null);

      const result = await validateBusinessRules(BASE_CTX);

      expect(result.ok).toBe(false);
      expect(result.error).toBe("DJ profile not found");
    });

    it("rejects when DJ profile is REJECTED", async () => {
      (prisma.djProfile.findUnique as any).mockResolvedValue({
        id: 100,
        status: "REJECTED",
        userId: "dj-user-id",
      });

      const result = await validateBusinessRules(BASE_CTX);

      expect(result.ok).toBe(false);
      expect(result.error).toBe("DJ profile not available for reviews");
    });

    it("rejects when user is not the DJ", async () => {
      (prisma.djProfile.findUnique as any).mockResolvedValue({
        id: 100,
        status: "APPROVED",
        userId: "different-user-id",
      });

      const result = await validateBusinessRules(BASE_CTX);

      expect(result.ok).toBe(false);
      expect(result.error).toBe("You can only review gigs you worked on");
    });
  });

  describe("Gig validation", () => {
    it("rejects when gig not found", async () => {
      (prisma.djProfile.findUnique as any).mockResolvedValue({
        id: 100,
        status: "APPROVED",
        userId: "dj-user-id",
      });
      (prisma.gig.findUnique as any).mockResolvedValue(null);

      const result = await validateBusinessRules(BASE_CTX);

      expect(result.ok).toBe(false);
      expect(result.error).toBe("Gig not found");
    });

    it("rejects when gig is deleted", async () => {
      (prisma.djProfile.findUnique as any).mockResolvedValue({
        id: 100,
        status: "APPROVED",
        userId: "dj-user-id",
      });
      (prisma.gig.findUnique as any).mockResolvedValue(null);

      const result = await validateBusinessRules(BASE_CTX);

      expect(result.ok).toBe(false);
      expect(result.error).toBe("Gig not found");
    });
  });

  describe("Application validation", () => {
    it("rejects when no application found", async () => {
      (prisma.djProfile.findUnique as any).mockResolvedValue({
        id: 100,
        status: "APPROVED",
        userId: "dj-user-id",
      });
      (prisma.gig.findUnique as any).mockResolvedValue({
        id: 1,
        slug: "test-gig",
        title: "Test Gig",
        organizerProfileId: 200,
        eventDate: new Date(),
      });
      (prisma.gigApplication.findUnique as any).mockResolvedValue(null);

      const result = await validateBusinessRules(BASE_CTX);

      expect(result.ok).toBe(false);
      expect(result.error).toBe("No application found for this gig");
    });

    it("rejects when application not ACCEPTED", async () => {
      (prisma.djProfile.findUnique as any).mockResolvedValue({
        id: 100,
        status: "APPROVED",
        userId: "dj-user-id",
      });
      (prisma.gig.findUnique as any).mockResolvedValue({
        id: 1,
        slug: "test-gig",
        title: "Test Gig",
        organizerProfileId: 200,
        eventDate: new Date(),
      });
      (prisma.gigApplication.findUnique as any).mockResolvedValue({
        id: 50,
        status: "PENDING",
      });

      const result = await validateBusinessRules(BASE_CTX);

      expect(result.ok).toBe(false);
      expect(result.error).toBe("Application was not accepted");
    });
  });

  describe("Hire validation", () => {
    it("rejects when hire not found", async () => {
      (prisma.djProfile.findUnique as any).mockResolvedValue({
        id: 100,
        status: "APPROVED",
        userId: "dj-user-id",
      });
      (prisma.gig.findUnique as any).mockResolvedValue({
        id: 1,
        slug: "test-gig",
        title: "Test Gig",
        organizerProfileId: 200,
        eventDate: new Date(),
      });
      (prisma.gigApplication.findUnique as any).mockResolvedValue({
        id: 50,
        status: "ACCEPTED",
      });
      (prisma.hire.findUnique as any).mockResolvedValue(null);

      const result = await validateBusinessRules(BASE_CTX);

      expect(result.ok).toBe(false);
      expect(result.error).toBe("Hire record not found");
    });

    it("rejects when hire not COMPLETED", async () => {
      (prisma.djProfile.findUnique as any).mockResolvedValue({
        id: 100,
        status: "APPROVED",
        userId: "dj-user-id",
      });
      (prisma.gig.findUnique as any).mockResolvedValue({
        id: 1,
        slug: "test-gig",
        title: "Test Gig",
        organizerProfileId: 200,
        eventDate: new Date(),
      });
      (prisma.gigApplication.findUnique as any).mockResolvedValue({
        id: 50,
        status: "ACCEPTED",
      });
      (prisma.hire.findUnique as any).mockResolvedValue({
        id: 75,
        status: "IN_PROGRESS",
        completedAt: null,
      });

      const result = await validateBusinessRules(BASE_CTX);

      expect(result.ok).toBe(false);
      expect(result.error).toBe("Gig must be completed before reviewing");
    });
  });

  describe("Review window validation", () => {
    it("rejects when review window expired", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 31);

      (prisma.djProfile.findUnique as any).mockResolvedValue({
        id: 100,
        status: "APPROVED",
        userId: "dj-user-id",
      });
      (prisma.gig.findUnique as any).mockResolvedValue({
        id: 1,
        slug: "test-gig",
        title: "Test Gig",
        organizerProfileId: 200,
        eventDate: new Date(),
      });
      (prisma.gigApplication.findUnique as any).mockResolvedValue({
        id: 50,
        status: "ACCEPTED",
      });
      (prisma.hire.findUnique as any).mockResolvedValue({
        id: 75,
        status: "COMPLETED",
        completedAt: pastDate,
      });
      (prisma.organizerProfile.findUnique as any).mockResolvedValue({
        userId: "organizer-user-id",
      });

      const result = await validateBusinessRules(BASE_CTX);

      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/Review window expired/);
    });

    it("accepts when within review window", async () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 15);

      (prisma.djProfile.findUnique as any).mockResolvedValue({
        id: 100,
        slug: "test-dj",
        status: "APPROVED",
        userId: "dj-user-id",
        stageName: "Test DJ",
      });
      (prisma.gig.findUnique as any).mockResolvedValue({
        id: 1,
        slug: "test-gig",
        title: "Test Gig",
        organizerProfileId: 200,
        eventDate: new Date(),
      });
      (prisma.gigApplication.findUnique as any).mockResolvedValue({
        id: 50,
        status: "ACCEPTED",
      });
      (prisma.hire.findUnique as any).mockResolvedValue({
        id: 75,
        status: "COMPLETED",
        completedAt: recentDate,
      });
      (prisma.organizerProfile.findUnique as any).mockResolvedValue({
        userId: "organizer-user-id",
      });

      const result = await validateBusinessRules(BASE_CTX);

      expect(result.ok).toBe(true);
      expect(result.gig).toBeDefined();
      expect(result.djProfile).toBeDefined();
      expect(result.hire).toBeDefined();
    });
  });

  describe("Organizer profile validation", () => {
    it("rejects when organizer profile not found", async () => {
      (prisma.djProfile.findUnique as any).mockResolvedValue({
        id: 100,
        status: "APPROVED",
        userId: "dj-user-id",
      });
      (prisma.gig.findUnique as any).mockResolvedValue({
        id: 1,
        slug: "test-gig",
        title: "Test Gig",
        organizerProfileId: 200,
        eventDate: new Date(),
      });
      (prisma.gigApplication.findUnique as any).mockResolvedValue({
        id: 50,
        status: "ACCEPTED",
      });
      (prisma.hire.findUnique as any).mockResolvedValue({
        id: 75,
        status: "COMPLETED",
        completedAt: new Date(),
      });
      (prisma.organizerProfile.findUnique as any).mockResolvedValue(null);

      const result = await validateBusinessRules(BASE_CTX);

      expect(result.ok).toBe(false);
      expect(result.error).toBe("Organizer profile not found");
    });
  });
});

describe("findExistingDjGigReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("finds existing review by gigId and djProfileId", async () => {
    const existingReview = {
      id: 1,
      gigId: 10,
      djProfileId: 100,
      rating: 5,
      review: "Great gig!",
    };
    (prisma.djGigReview.findFirst as any).mockResolvedValue(existingReview);

    const result = await findExistingDjGigReview(10, 100);

    expect(result).toEqual(existingReview);
    expect(prisma.djGigReview.findFirst).toHaveBeenCalledWith({
      where: { gigId: 10, djProfileId: 100 },
    });
  });

  it("returns null when no review exists", async () => {
    (prisma.djGigReview.findFirst as any).mockResolvedValue(null);

    const result = await findExistingDjGigReview(10, 100);

    expect(result).toBeNull();
  });
});

describe("upsertDjGigReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates new review when none exists", async () => {
    const newReview = { id: 1, gigId: 10, djProfileId: 100 };
    (prisma.djGigReview.create as any).mockResolvedValue(newReview);

    const result = await upsertDjGigReview({
      gigId: 10,
      djProfileId: 100,
      organizerId: "org-123",
      rating: 5,
      review: "Great gig!",
    });

    expect(result).toEqual({ id: 1, created: true });
    expect(prisma.djGigReview.create).toHaveBeenCalledWith({
      data: {
        gigId: 10,
        djProfileId: 100,
        organizerId: "org-123",
        rating: 5,
        review: "Great gig!",
        ipAddress: undefined,
        userAgent: undefined,
      },
    });
  });

  it("handles P2002 unique constraint violation by updating", async () => {
    const existingReview = {
      id: 1,
      gigId: 10,
      djProfileId: 100,
      rating: 4,
      review: "Old review",
    };
    const updatedReview = {
      id: 1,
      gigId: 10,
      djProfileId: 100,
      rating: 5,
      review: "Updated review",
    };

    (prisma.djGigReview.create as any).mockRejectedValue({
      code: "P2002",
    });
    (prisma.djGigReview.findFirst as any).mockResolvedValue(existingReview);
    (prisma.djGigReview.update as any).mockResolvedValue(updatedReview);

    const result = await upsertDjGigReview({
      gigId: 10,
      djProfileId: 100,
      organizerId: "org-123",
      rating: 5,
      review: "Updated review",
    });

    expect(result).toEqual({ id: 1, created: false });
    expect(prisma.djGigReview.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        rating: 5,
        review: "Updated review",
        ipAddress: undefined,
        userAgent: undefined,
      },
    });
  });

  it("includes ipAddress and userAgent when provided", async () => {
    const newReview = { id: 1, gigId: 10, djProfileId: 100 };
    (prisma.djGigReview.create as any).mockResolvedValue(newReview);

    await upsertDjGigReview({
      gigId: 10,
      djProfileId: 100,
      organizerId: "org-123",
      rating: 5,
      review: "Great gig!",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0",
    });

    expect(prisma.djGigReview.create).toHaveBeenCalledWith({
      data: {
        gigId: 10,
        djProfileId: 100,
        organizerId: "org-123",
        rating: 5,
        review: "Great gig!",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      },
    });
  });

  it("re-throws non-P2002 errors", async () => {
    const error = new Error("Database connection failed");
    (prisma.djGigReview.create as any).mockRejectedValue(error);

    await expect(
      upsertDjGigReview({
        gigId: 10,
        djProfileId: 100,
        organizerId: "org-123",
        rating: 5,
        review: "Great gig!",
      }),
    ).rejects.toThrow("Database connection failed");
  });
});
