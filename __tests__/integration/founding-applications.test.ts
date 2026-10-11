import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  checkFoundingApplicationStatus,
  addToWaitlist,
} from "@/lib/actions/founding-applications";
import prisma from "@/lib/client";
import { getTestLocation } from "../setup";

describe("Founding Applications Integration Tests", () => {
  const testEmail = `test-integration-${Date.now()}@example.com`;
  const testEmail2 = `test-integration-2-${Date.now()}@example.com`;

  beforeEach(async () => {
    await prisma.foundingApplication.deleteMany({
      where: { email: { in: [testEmail, testEmail2] } },
    });
    await prisma.waitlistEntry.deleteMany({
      where: { email: { in: [testEmail, testEmail2] } },
    });
  });

  afterEach(async () => {
    await prisma.foundingApplication.deleteMany({
      where: { email: { in: [testEmail, testEmail2] } },
    });
    await prisma.waitlistEntry.deleteMany({
      where: { email: { in: [testEmail, testEmail2] } },
    });
  });

  describe("checkFoundingApplicationStatus", () => {
    it("returns error when no application found", async () => {
      const result = await checkFoundingApplicationStatus(
        "nonexistent@example.com",
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("No application found for this email");
      }
    });

    it("returns application status when found", async () => {
      const { countryId, cityId } = await getTestLocation();
      const submittedAt = new Date();
      await prisma.foundingApplication.create({
        data: {
          email: testEmail,
          name: "Test User",
          stageName: "Test DJ",
          countryId,
          cityId,
          portfolioLinks: [],
          status: "EMAIL_VERIFIED",
          submittedAt,
          emailVerificationTokenHash: "hash",
          emailVerificationExpiresAt: new Date(),
          emailVerifiedAt: new Date(),
          experienceYears: 0,
          experienceLevel: "OPEN",
        },
      });

      const result = await checkFoundingApplicationStatus(testEmail);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("EMAIL_VERIFIED");
        expect(result.data.submittedAt).toBeInstanceOf(Date);
      }
    });

    it("returns most recent application when multiple exist", async () => {
      const { countryId, cityId } = await getTestLocation();
      const submittedAt1 = new Date(Date.now() - 10000);
      const submittedAt2 = new Date();

      await prisma.foundingApplication.create({
        data: {
          email: testEmail,
          name: "Test User",
          stageName: "Test DJ",
          countryId,
          cityId,
          portfolioLinks: [],
          status: "PENDING",
          submittedAt: submittedAt1,
          emailVerificationTokenHash: "hash1",
          emailVerificationExpiresAt: new Date(),
          experienceYears: 0,
          experienceLevel: "OPEN",
        },
      });

      await prisma.foundingApplication.create({
        data: {
          email: testEmail,
          name: "Test User",
          stageName: "Test DJ",
          countryId,
          cityId,
          portfolioLinks: [],
          status: "APPROVED",
          submittedAt: submittedAt2,
          emailVerificationTokenHash: "hash2",
          emailVerificationExpiresAt: new Date(),
          emailVerifiedAt: new Date(),
          experienceYears: 0,
          experienceLevel: "OPEN",
        },
      });

      const result = await checkFoundingApplicationStatus(testEmail);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("APPROVED");
      }
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
      await prisma.waitlistEntry.create({
        data: {
          email: testEmail,
          name: "Existing User",
        },
      });

      const result = await addToWaitlist({
        email: testEmail,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Email already on waitlist");
      }
    });

    it("adds to waitlist successfully", async () => {
      const result = await addToWaitlist({
        email: testEmail,
        name: "Waitlist User",
        isDj: true,
        utmSource: "twitter",
        utmMedium: "social",
        utmCampaign: "launch",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBeDefined();
      }

      const entry = await prisma.waitlistEntry.findFirst({
        where: { email: testEmail },
      });
      expect(entry).toBeDefined();
      expect(entry?.name).toBe("Waitlist User");
      expect(entry?.isDj).toBe(true);
      expect(entry?.utmSource).toBe("twitter");
      expect(entry?.utmMedium).toBe("social");
      expect(entry?.utmCampaign).toBe("launch");
    });

    it("adds to waitlist with minimal data", async () => {
      const result = await addToWaitlist({
        email: testEmail2,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBeDefined();
      }

      const entry = await prisma.waitlistEntry.findFirst({
        where: { email: testEmail2 },
      });
      expect(entry).toBeDefined();
      expect(entry?.email).toBe(testEmail2);
    });
  });
});
