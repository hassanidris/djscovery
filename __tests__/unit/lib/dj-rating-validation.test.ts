import { describe, it, expect } from "vitest";
import {
  validateFields,
  MIN_REVIEW_LENGTH,
  MAX_REVIEW_LENGTH,
  VALID_REVIEW_TYPES,
} from "@/lib/validation/dj-rating-validation";

describe("validateFields", () => {
  // ── Rating validation ────────────────────────────────────────────────────

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

  // ── Review text validation ───────────────────────────────────────────────

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

  // ── eventId validation ───────────────────────────────────────────────────

  describe("eventId", () => {
    it("treats omitted eventId as direct review", () => {
      const result = validateFields({
        rating: 5,
        review: "A".repeat(30),
      });
      expect(result.ok).toBe(true);
      expect(result.isEventReview).toBe(false);
    });

    it("treats null eventId as direct review", () => {
      const result = validateFields({
        rating: 5,
        review: "A".repeat(30),
        eventId: null,
      });
      expect(result.ok).toBe(true);
      expect(result.isEventReview).toBe(false);
    });

    it("treats positive integer eventId as event review", () => {
      const result = validateFields({
        rating: 5,
        review: "A".repeat(30),
        eventId: 42,
      });
      expect(result.ok).toBe(true);
      expect(result.isEventReview).toBe(true);
    });

    it("treats eventId=0 as direct review", () => {
      const result = validateFields({
        rating: 5,
        review: "A".repeat(30),
        eventId: 0,
      });
      expect(result.ok).toBe(true);
      expect(result.isEventReview).toBe(false);
    });

    it("treats negative eventId as direct review", () => {
      const result = validateFields({
        rating: 5,
        review: "A".repeat(30),
        eventId: -1,
      });
      expect(result.ok).toBe(true);
      expect(result.isEventReview).toBe(false);
    });

    it("treats non-integer eventId as direct review", () => {
      const result = validateFields({
        rating: 5,
        review: "A".repeat(30),
        eventId: 3.5,
      });
      expect(result.ok).toBe(true);
      expect(result.isEventReview).toBe(false);
    });
  });

  // ── reviewType validation ────────────────────────────────────────────────

  describe("reviewType", () => {
    it("accepts DIRECT and EVENT_ATTENDEE from client", () => {
      for (const rt of ["DIRECT", "EVENT_ATTENDEE"] as const) {
        const result = validateFields({
          rating: 5,
          review: "A".repeat(30),
          reviewType: rt,
          ...(rt === "DIRECT" ? {} : { eventId: 1 }),
        });
        expect(result.ok).toBe(true);
      }
    });

    it("rejects EVENT_ORGANIZER from client (must be auto-detected)", () => {
      const result = validateFields({
        rating: 5,
        review: "A".repeat(30),
        reviewType: "EVENT_ORGANIZER",
        eventId: 42,
      });
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/reviewType/i);
    });

    it("rejects invalid reviewType string", () => {
      const result = validateFields({
        rating: 5,
        review: "A".repeat(30),
        reviewType: "INVALID",
      });
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/reviewType/i);
    });

    it("rejects DIRECT with eventId (inconsistency)", () => {
      const result = validateFields({
        rating: 5,
        review: "A".repeat(30),
        eventId: 42,
        reviewType: "DIRECT",
      });
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/direct.*event/i);
    });

    it("rejects EVENT_ATTENDEE without eventId (inconsistency)", () => {
      const result = validateFields({
        rating: 5,
        review: "A".repeat(30),
        reviewType: "EVENT_ATTENDEE",
      });
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/event.*eventId/i);
    });

    it("rejects EVENT_ORGANIZER without eventId (inconsistency)", () => {
      const result = validateFields({
        rating: 5,
        review: "A".repeat(30),
        reviewType: "EVENT_ORGANIZER",
      });
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/reviewType/i);
    });

    it("accepts EVENT_ATTENDEE with eventId", () => {
      const result = validateFields({
        rating: 5,
        review: "A".repeat(30),
        eventId: 42,
        reviewType: "EVENT_ATTENDEE",
      });
      expect(result.ok).toBe(true);
      expect(result.isEventReview).toBe(true);
    });

    it("accepts omitted reviewType (auto-detected later)", () => {
      const result = validateFields({
        rating: 5,
        review: "A".repeat(30),
        eventId: 42,
      });
      expect(result.ok).toBe(true);
    });
  });

  // ── Combined valid inputs ────────────────────────────────────────────────

  describe("valid combinations", () => {
    it("valid direct review (no eventId, no reviewType)", () => {
      const result = validateFields({
        rating: 4,
        review: "Great DJ, would book again for sure!",
      });
      expect(result.ok).toBe(true);
      expect(result.isEventReview).toBe(false);
      expect(result.trimmedReview).toBe("Great DJ, would book again for sure!");
    });

    it("valid event review (with eventId, no reviewType)", () => {
      const result = validateFields({
        rating: 5,
        review: "Amazing set at the festival, loved every minute!",
        eventId: 100,
      });
      expect(result.ok).toBe(true);
      expect(result.isEventReview).toBe(true);
    });
  });
});
