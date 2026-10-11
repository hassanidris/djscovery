import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  checkFoundingApplicationStatus,
  addToWaitlist,
} from "@/lib/actions/founding-applications";

vi.mock("@/lib/client", () => ({
  default: {
    foundingApplication: {
      findFirst: vi.fn(),
    },
    waitlistEntry: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import prisma from "@/lib/client";

describe("Founding Applications Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkFoundingApplicationStatus", () => {
    it("returns error when no application found", async () => {
      (prisma.foundingApplication.findFirst as any).mockResolvedValue(null);

      const result = await checkFoundingApplicationStatus(
        "nonexistent@example.com",
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("No application found for this email");
      }
    });

    it("returns application status when found", async () => {
      const submittedAt = new Date();
      (prisma.foundingApplication.findFirst as any).mockResolvedValue({
        status: "EMAIL_VERIFIED",
        submittedAt,
      });

      const result = await checkFoundingApplicationStatus("test@example.com");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          status: "EMAIL_VERIFIED",
          submittedAt,
        });
      }
    });

    it("returns most recent application when multiple exist", async () => {
      const submittedAt = new Date();
      (prisma.foundingApplication.findFirst as any).mockResolvedValue({
        status: "APPROVED",
        submittedAt,
      });

      const result = await checkFoundingApplicationStatus("test@example.com");

      expect(result.success).toBe(true);
      expect(prisma.foundingApplication.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { submittedAt: "desc" },
        }),
      );
    });
  });

  describe("addToWaitlist", () => {
    it("returns error for invalid email", async () => {
      const result = await addToWaitlist({
        email: "invalid-email",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Invalid email address");
      }
    });

    it("returns error when email already on waitlist", async () => {
      (prisma.waitlistEntry.findFirst as any).mockResolvedValue({
        id: 1,
        email: "existing@example.com",
      });

      const result = await addToWaitlist({
        email: "existing@example.com",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Email already on waitlist");
      }
    });

    it("adds to waitlist successfully", async () => {
      (prisma.waitlistEntry.findFirst as any).mockResolvedValue(null);
      (prisma.waitlistEntry.create as any).mockResolvedValue({
        id: 456,
      });

      const result = await addToWaitlist({
        email: "new@example.com",
        name: "Waitlist User",
        isDj: true,
        utmSource: "twitter",
        utmMedium: "social",
        utmCampaign: "launch",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ id: 456 });
      }
      expect(prisma.waitlistEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: "new@example.com",
            name: "Waitlist User",
            isDj: true,
            utmSource: "twitter",
            utmMedium: "social",
            utmCampaign: "launch",
          }),
        }),
      );
    });

    it("adds to waitlist with minimal data", async () => {
      (prisma.waitlistEntry.findFirst as any).mockResolvedValue(null);
      (prisma.waitlistEntry.create as any).mockResolvedValue({
        id: 457,
      });

      const result = await addToWaitlist({
        email: "minimal@example.com",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ id: 457 });
      }
      expect(prisma.waitlistEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: "minimal@example.com",
          }),
        }),
      );
    });
  });
});
