"use server";

import crypto from "crypto";
import prisma from "@/lib/client";
import { ActionResult, actionError, actionSuccess } from "./action-result";
import {
  validateFields,
  validateBusinessRules,
  validateEmailVerification,
  validateResumeToken,
  EMAIL_VERIFICATION_EXPIRY_HOURS,
  RESUME_TOKEN_EXPIRY_HOURS,
} from "@/lib/validation/founding-application";

/**
 * Input for creating or saving a FoundingApplication.
 */
export interface CreateFoundingApplicationInput {
  email: string;
  name: string;
  stageName: string;
  portfolioLinks: string[];
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  saveOnly?: boolean;
}

/**
 * Create or save a FoundingApplication.
 *
 * If saveOnly is true, creates a partial application with a resume token.
 * If saveOnly is false, creates a full application and sends email verification.
 *
 * Business rules are enforced in `validateBusinessRules` — see
 * src/lib/validation/founding-application.ts for the full list.
 */
export async function createFoundingApplication(
  input: CreateFoundingApplicationInput,
): Promise<ActionResult<{ id: number; resumeToken?: string }>> {
  // --- Field validation (no DB access) ---
  const fieldResult = validateFields({
    email: input.email,
    name: input.name,
    stageName: input.stageName,
    portfolioLinks: input.portfolioLinks,
  });
  if (!fieldResult.ok) {
    return actionError(fieldResult.error!);
  }

  // --- Business-rule validation (DB access) ---
  const ruleResult = await validateBusinessRules({
    email: input.email,
  });
  if (!ruleResult.ok) {
    return actionError(ruleResult.error!);
  }

  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const stageName = input.stageName.trim();
  const portfolioLinks = input.portfolioLinks.map((link) => link.trim());

  // --- Generate tokens ---
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");
  const emailVerificationTokenHash = crypto
    .createHash("sha256")
    .update(emailVerificationToken)
    .digest("hex");
  const emailVerificationExpiresAt = new Date();
  emailVerificationExpiresAt.setHours(
    emailVerificationExpiresAt.getHours() + EMAIL_VERIFICATION_EXPIRY_HOURS,
  );

  let resumeToken: string | undefined;
  let resumeTokenHash: string | undefined;
  let resumeTokenExpiresAt: Date | undefined;

  if (input.saveOnly) {
    resumeToken = crypto.randomBytes(32).toString("hex");
    resumeTokenHash = crypto
      .createHash("sha256")
      .update(resumeToken)
      .digest("hex");
    resumeTokenExpiresAt = new Date();
    resumeTokenExpiresAt.setHours(
      resumeTokenExpiresAt.getHours() + RESUME_TOKEN_EXPIRY_HOURS,
    );
  }

  // --- Create application ---
  const application = await prisma.foundingApplication.create({
    data: {
      email,
      name,
      stageName,
      portfolioLinks,
      status: "PENDING",
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      emailVerificationTokenHash,
      emailVerificationExpiresAt,
      resumeTokenHash,
      resumeTokenExpiresAt,
      experienceYears: 0,
      experienceLevel: "OPEN",
    },
    select: { id: true },
  });

  // --- Send email verification (if not save-only) ---
  if (!input.saveOnly) {
    await sendVerificationEmail(email, emailVerificationToken, name);
  } else if (resumeToken) {
    await sendResumeEmail(email, resumeToken, name);
  }

  return actionSuccess({ id: application.id, resumeToken });
}

/**
 * Verify email using token.
 */
export async function verifyFoundingApplicationEmail(
  email: string,
  token: string,
): Promise<ActionResult<{ id: number }>> {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const validationResult = await validateEmailVerification(email, tokenHash);
  if (!validationResult.ok) {
    return actionError(validationResult.error!);
  }

  const applicationId = validationResult.applicationId!;

  await prisma.foundingApplication.update({
    where: { id: applicationId },
    data: {
      emailVerifiedAt: new Date(),
      status: "EMAIL_VERIFIED",
    },
  });

  const application = await prisma.foundingApplication.findUnique({
    where: { id: applicationId },
    select: { name: true, email: true },
  });

  if (application) {
    const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL}/founding-djs/status`;
    const { foundingEmailVerifiedEmail } =
      await import("@/lib/email/templates/foundingEmailVerified");
    const html = foundingEmailVerifiedEmail({
      name: application.name,
      statusUrl,
    });

    const resend = process.env.RESEND_API_KEY
      ? (await import("resend")).Resend
      : null;
    const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@djscovery.com";

    if (resend) {
      const client = new resend(process.env.RESEND_API_KEY);
      await client.emails.send({
        from: FROM_EMAIL,
        to: application.email,
        subject: "Email verified - Founding DJ Application",
        html,
      });
    } else {
      console.log(
        `[Email Mock] Would send verified email to ${application.email}`,
      );
    }
  }

  return actionSuccess({ id: applicationId });
}

/**
 * Check application status by email.
 */
export async function checkFoundingApplicationStatus(
  email: string,
): Promise<ActionResult<{ status: string; submittedAt: Date }>> {
  const application = await prisma.foundingApplication.findFirst({
    where: {
      email: email.toLowerCase(),
      deletedAt: null,
    },
    select: {
      status: true,
      submittedAt: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  if (!application) {
    return actionError("No application found for this email");
  }

  return actionSuccess({
    status: application.status,
    submittedAt: application.submittedAt,
  });
}

/**
 * Add to waitlist.
 */
export async function addToWaitlist(input: {
  name?: string;
  email: string;
  isDj?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}): Promise<ActionResult<{ id: number }>> {
  const email = input.email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return actionError("Invalid email address");
  }

  const existing = await prisma.waitlistEntry.findFirst({
    where: { email },
  });
  if (existing) {
    return actionError("Email already on waitlist");
  }

  const entry = await prisma.waitlistEntry.create({
    data: {
      email,
      name: input.name?.trim(),
      isDj: input.isDj ?? false,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
    },
    select: { id: true },
  });

  return actionSuccess({ id: entry.id });
}

/**
 * Send verification email.
 */
async function sendVerificationEmail(
  email: string,
  token: string,
  name: string,
) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/founding-djs/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  const { foundingApplicationReceivedEmail } =
    await import("@/lib/email/templates/foundingApplicationReceived");
  const html = foundingApplicationReceivedEmail({
    name,
    verifyUrl,
  });

  const resend = process.env.RESEND_API_KEY
    ? (await import("resend")).Resend
    : null;
  const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@djscovery.com";

  if (resend) {
    const client = new resend(process.env.RESEND_API_KEY);
    await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify your email - Founding DJ Application",
      html,
    });
  } else {
    console.log(`[Email Mock] Would send verification email to ${email}`);
  }
}

/**
 * Send resume email.
 */
async function sendResumeEmail(email: string, token: string, name: string) {
  const resumeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/founding-djs/apply?resume_token=${token}&email=${encodeURIComponent(email)}`;

  const { foundingPartialApplicationResumeEmail } =
    await import("@/lib/email/templates/foundingPartialApplicationResume");
  const html = foundingPartialApplicationResumeEmail({
    name,
    resumeUrl,
  });

  const resend = process.env.RESEND_API_KEY
    ? (await import("resend")).Resend
    : null;
  const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@djscovery.com";

  if (resend) {
    const client = new resend(process.env.RESEND_API_KEY);
    await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Continue your Founding DJ application",
      html,
    });
  } else {
    console.log(`[Email Mock] Would send resume email to ${email}`);
  }
}
