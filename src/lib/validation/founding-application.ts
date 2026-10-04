/**
 * Shared validation logic for FoundingApplication creation.
 *
 * Used by both:
 *   - Server action: src/lib/actions/founding-applications.ts
 *   - API route:     src/app/api/founding-applications/route.ts (if needed)
 *
 * This ensures consistent validation across all entry points and avoids
 * the duplication that would otherwise drift out of sync.
 */

import prisma from "@/lib/client";

export const APPLICATION_COOLDOWN_DAYS = 30;
export const EMAIL_VERIFICATION_EXPIRY_HOURS = 24;
export const RESUME_TOKEN_EXPIRY_HOURS = 48;

/** Result of validating raw input fields */
export interface FieldValidationResult {
  ok: boolean;
  error?: string;
}

export function validateLocationFields(
  countryId: unknown,
  cityId: unknown,
): FieldValidationResult {
  if (
    typeof countryId !== "number" ||
    !Number.isInteger(countryId) ||
    countryId <= 0 ||
    typeof cityId !== "number" ||
    !Number.isInteger(cityId) ||
    cityId <= 0
  ) {
    return { ok: false, error: "Please select a valid country and city" };
  }

  return { ok: true };
}

/**
 * Validate the basic input fields (email, name, stageName, portfolioLink).
 * Does NOT touch the database — use `validateBusinessRules` for that.
 */
export function validateFields(input: {
  email: unknown;
  name: unknown;
  stageName: unknown;
  portfolioLinks: unknown;
}): FieldValidationResult {
  const email = input.email;
  const name = input.name;
  const stageName = input.stageName;
  const portfolioLinks = input.portfolioLinks;

  // Email validation
  if (typeof email !== "string" || !email.trim()) {
    return { ok: false, error: "Email is required" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { ok: false, error: "Invalid email address" };
  }

  // Name validation
  if (typeof name !== "string" || !name.trim()) {
    return { ok: false, error: "Name is required" };
  }
  if (name.trim().length < 2) {
    return { ok: false, error: "Name must be at least 2 characters" };
  }
  if (name.trim().length > 100) {
    return { ok: false, error: "Name must be less than 100 characters" };
  }

  // Stage name validation
  if (typeof stageName !== "string" || !stageName.trim()) {
    return { ok: false, error: "Stage name is required" };
  }
  if (stageName.trim().length < 2) {
    return { ok: false, error: "Stage name must be at least 2 characters" };
  }
  if (stageName.trim().length > 50) {
    return { ok: false, error: "Stage name must be less than 50 characters" };
  }

  // Portfolio links validation - at least one required
  if (!Array.isArray(portfolioLinks) || portfolioLinks.length === 0) {
    return {
      ok: false,
      error: "At least one portfolio or social link is required",
    };
  }
  const hasValidLink = portfolioLinks.some(
    (link) => typeof link === "string" && link.trim() !== "",
  );
  if (!hasValidLink) {
    return {
      ok: false,
      error: "At least one portfolio or social link is required",
    };
  }
  // Validate that at least one link is a valid URL
  const urlRegex = /^https?:\/\/.+/i;
  const hasValidUrl = portfolioLinks.some(
    (link) =>
      typeof link === "string" &&
      link.trim() !== "" &&
      urlRegex.test(link.trim()),
  );
  if (!hasValidUrl) {
    return { ok: false, error: "At least one link must be a valid URL" };
  }

  return { ok: true };
}

/**
 * Validate business rules that require database access.
 * These are checked AFTER field validation passes.
 */
export async function validateBusinessRules(input: {
  email: string;
  countryId: number;
  cityId: number;
}): Promise<{ ok: boolean; error?: string; existingApplicationId?: number }> {
  const email = input.email.trim().toLowerCase();

  const city = await prisma.city.findFirst({
    where: { id: input.cityId, countryId: input.countryId },
    select: { id: true },
  });
  if (!city) {
    return {
      ok: false,
      error: "Please select a valid city for the chosen country",
    };
  }

  // Check for existing DJ profile
  const existingDjProfile = await prisma.djProfile.findFirst({
    where: { user: { email } },
    select: { id: true },
  });

  if (existingDjProfile) {
    return {
      ok: false,
      error:
        "You already have a DJ profile on DJcovery. Founding status is for new DJs only.",
    };
  }

  // Check for recent application (cooldown period)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - APPLICATION_COOLDOWN_DAYS);

  const recentApplication = await prisma.foundingApplication.findFirst({
    where: {
      email,
      status: { in: ["PENDING", "UNDER_REVIEW"] },
      submittedAt: { gte: thirtyDaysAgo },
      deletedAt: { equals: null },
    },
    select: { id: true, status: true, submittedAt: true },
  });

  if (recentApplication) {
    const daysSinceSubmission = Math.floor(
      (new Date().getTime() - recentApplication.submittedAt.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const daysRemaining = APPLICATION_COOLDOWN_DAYS - daysSinceSubmission;
    return {
      ok: false,
      error: `You already have an active application. You can reapply in ${daysRemaining} days.`,
      existingApplicationId: recentApplication.id,
    };
  }

  const recentRejection = await prisma.foundingApplication.findFirst({
    where: {
      email,
      status: "REJECTED",
      reviewedAt: { gte: thirtyDaysAgo },
      deletedAt: { equals: null },
    },
    select: { reviewedAt: true },
    orderBy: { reviewedAt: "desc" },
  });

  if (recentRejection?.reviewedAt) {
    const cooldownEndsAt = new Date(recentRejection.reviewedAt);
    cooldownEndsAt.setDate(
      cooldownEndsAt.getDate() + APPLICATION_COOLDOWN_DAYS,
    );
    const daysRemaining = Math.max(
      1,
      Math.ceil(
        (cooldownEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      ),
    );
    return {
      ok: false,
      error: `Your last application was not approved. You can reapply in ${daysRemaining} days.`,
    };
  }

  return { ok: true };
}

/**
 * Validate email verification token.
 */
export async function validateEmailVerification(
  email: string,
  tokenHash: string,
): Promise<{ ok: boolean; error?: string; applicationId?: number }> {
  const application = await prisma.foundingApplication.findFirst({
    where: {
      email: email.toLowerCase(),
      emailVerificationTokenHash: tokenHash,
      deletedAt: null,
    },
    select: {
      id: true,
      emailVerifiedAt: true,
      emailVerificationExpiresAt: true,
    },
  });

  if (!application) {
    return { ok: false, error: "Invalid or expired verification link" };
  }

  if (application.emailVerifiedAt) {
    return { ok: false, error: "Email already verified" };
  }

  if (
    application.emailVerificationExpiresAt &&
    application.emailVerificationExpiresAt < new Date()
  ) {
    return { ok: false, error: "Verification link has expired" };
  }

  return { ok: true, applicationId: application.id };
}

/**
 * Validate resume token for save-and-resume functionality.
 */
export async function validateResumeToken(
  email: string,
  tokenHash: string,
): Promise<{ ok: boolean; error?: string; applicationId?: number }> {
  const application = await prisma.foundingApplication.findFirst({
    where: {
      email: email.toLowerCase(),
      resumeTokenHash: tokenHash,
      status: "PENDING",
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      stageName: true,
      portfolioLinks: true,
      resumeTokenExpiresAt: true,
    },
  });

  if (!application) {
    return { ok: false, error: "Invalid or expired resume link" };
  }

  if (
    application.resumeTokenExpiresAt &&
    application.resumeTokenExpiresAt < new Date()
  ) {
    return { ok: false, error: "Resume link has expired" };
  }

  return {
    ok: true,
    applicationId: application.id,
  };
}
