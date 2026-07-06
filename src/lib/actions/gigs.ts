"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { updateReputationScore } from "@/lib/reputation/update";
import {
  createGigSchema,
  updateGigSchema,
  publishGigSchema,
  applyToGigSchema,
  updateApplicationStatusSchema,
  completeGigSchema,
  cancelHireSchema,
  reportNoShowSchema,
} from "@/lib/validations/gig";
import { isPrivateEventType } from "@/config/gig-type-fields";
import { sendEmail } from "@/lib/email/sendEmail";
import {
  gigApplicationReceivedSubject,
  gigApplicationReceivedHtml,
} from "@/lib/email/templates/gigApplicationReceived";
import {
  gigApplicationAcceptedSubject,
  gigApplicationAcceptedHtml,
} from "@/lib/email/templates/gigApplicationAccepted";
import {
  gigApplicationRejectedSubject,
  gigApplicationRejectedHtml,
} from "@/lib/email/templates/gigApplicationRejected";
import { requireGigOwner } from "@/lib/auth/require-owner";

// ============================================================
// RESULT TYPE
// Every action returns a consistent shape so client components
// can uniformly check success and feed sonner toasts.
// ============================================================

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================
// PRIVATE HELPERS
// ============================================================

async function makeUniqueGigSlug(
  title: string,
  excludeGigId?: number,
): Promise<string> {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  if (!base)
    throw new Error("Title must contain at least one letter or number.");
  const existing = await prisma.gig.findMany({
    where: {
      slug: { startsWith: base },
      ...(excludeGigId ? { id: { not: excludeGigId } } : {}),
    },
    select: { slug: true },
  });
  const taken = new Set(existing.map((g) => g.slug));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function getRoles(userId: string): Promise<string[]> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { roles: { select: { role: true } } },
  });
  return dbUser?.roles.map((r) => r.role) ?? [];
}

async function getActiveOrganizerProfile(userId: string) {
  return prisma.organizerProfile.findUnique({
    where: { userId },
    select: { id: true, status: true, deletedAt: true },
  });
}

async function getApprovedDjProfile(userId: string) {
  return prisma.djProfile.findUnique({
    where: { userId },
    select: { id: true, status: true },
  });
}

// ============================================================
// createGig
// Creates a new gig in DRAFT status.
// Auto-sets hideVenueName=true for private event types.
// ============================================================

export async function createGig(
  input: unknown,
): Promise<ActionResult<{ gigId: number; slug: string }>> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const roles = await getRoles(user.id);
  if (!roles.includes("ORGANIZER"))
    return { success: false, error: "Only organizers can create gigs." };

  const orgProfile = await getActiveOrganizerProfile(user.id);
  if (
    !orgProfile ||
    orgProfile.status !== "ACTIVE" ||
    orgProfile.deletedAt !== null
  )
    return {
      success: false,
      error: "You need an active organizer profile to create gigs.",
    };

  const parsed = createGigSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };

  const d = parsed.data;
  const slug = await makeUniqueGigSlug(d.title);
  const hideVenueName = d.hideVenueName ?? isPrivateEventType(d.gigType);

  const gig = await prisma.gig.create({
    data: {
      slug,
      organizerProfileId: orgProfile.id,
      title: d.title,
      gigType: d.gigType,
      description: d.description ?? null,
      status: "DRAFT",
      eventDate: new Date(d.eventDate),
      applicationDeadline: d.applicationDeadline
        ? new Date(d.applicationDeadline)
        : null,
      countryId: d.countryId,
      cityId: d.cityId,
      venueName: d.venueName ?? null,
      hideVenueName,
      venueAddress: d.venueAddress ?? null,
      venuePostalCode: d.venuePostalCode ?? null,
      budgetType: d.budgetType ?? "TBA",
      budgetMin: d.budgetMin ?? null,
      budgetMax: d.budgetMax ?? null,
      currency: d.currency ?? "SEK",
      requiredGenres: d.requiredGenres ?? [],
      requiredExperienceLevel: d.requiredExperienceLevel ?? "OPEN",
      setDurationMinutes: d.setDurationMinutes ?? null,
      guestCount: d.guestCount ?? null,
      dressCode: d.dressCode ?? null,
      mcRequired: d.mcRequired ?? false,
      micRequired: d.micRequired ?? false,
      languagesSpoken: d.languagesSpoken ?? [],
      venueProvides: d.venueProvides ?? [],
      djMustBring: d.djMustBring ?? [],
      arrivalInstructions: d.arrivalInstructions ?? null,
      setupNotes: d.setupNotes ?? null,
      organizerContactName: d.organizerContactName ?? null,
      organizerContactPhone: d.organizerContactPhone ?? null,
      organizerContactEmail: d.organizerContactEmail ?? null,
    },
    select: { id: true, slug: true },
  });

  return { success: true, data: { gigId: gig.id, slug: gig.slug } };
}

// ============================================================
// updateGig
// Partial update. Works on DRAFT, PUBLISHED, UNDER_REVIEW gigs.
// Regenerates slug when title changes.
// Prisma skips undefined fields automatically.
// ============================================================

export async function updateGig(
  gigId: number,
  input: unknown,
): Promise<ActionResult<{ slug: string }>> {
  const { organizerProfileId } = await requireGigOwner(gigId);

  const orgProfile = await prisma.organizerProfile.findUnique({
    where: { id: organizerProfileId },
    select: { status: true, deletedAt: true },
  });
  if (
    !orgProfile ||
    orgProfile.status !== "ACTIVE" ||
    orgProfile.deletedAt !== null
  )
    return { success: false, error: "Active organizer profile required." };

  const gig = await prisma.gig.findUnique({
    where: { id: gigId, deletedAt: null },
    select: { status: true, title: true, slug: true },
  });
  if (!gig) return { success: false, error: "Gig not found." };

  if (gig.status === "CANCELLED" || gig.status === "EXPIRED")
    return {
      success: false,
      error: "Cancelled or expired gigs cannot be edited.",
    };

  const parsed = updateGigSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };

  const d = parsed.data;

  let slug = gig.slug;
  if (d.title && d.title !== gig.title) {
    slug = await makeUniqueGigSlug(d.title, gigId);
  }

  const updated = await prisma.gig.update({
    where: { id: gigId },
    data: {
      slug,
      title: d.title,
      gigType: d.gigType,
      description: d.description,
      eventDate: d.eventDate ? new Date(d.eventDate) : undefined,
      applicationDeadline:
        d.applicationDeadline === undefined
          ? undefined
          : d.applicationDeadline === null
            ? null
            : new Date(d.applicationDeadline),
      countryId: d.countryId,
      cityId: d.cityId,
      venueName: d.venueName,
      hideVenueName: d.hideVenueName,
      venueAddress: d.venueAddress,
      venuePostalCode: d.venuePostalCode,
      budgetType: d.budgetType,
      budgetMin: d.budgetMin,
      budgetMax: d.budgetMax,
      currency: d.currency,
      requiredGenres: d.requiredGenres,
      requiredExperienceLevel: d.requiredExperienceLevel,
      setDurationMinutes: d.setDurationMinutes,
      guestCount: d.guestCount,
      dressCode: d.dressCode,
      mcRequired: d.mcRequired,
      micRequired: d.micRequired,
      languagesSpoken: d.languagesSpoken,
      venueProvides: d.venueProvides,
      djMustBring: d.djMustBring,
      arrivalInstructions: d.arrivalInstructions,
      setupNotes: d.setupNotes,
      organizerContactName: d.organizerContactName,
      organizerContactPhone: d.organizerContactPhone,
      organizerContactEmail: d.organizerContactEmail,
    },
    select: { slug: true },
  });

  return { success: true, data: { slug: updated.slug } };
}

// ============================================================
// publishGig
// Transitions DRAFT or UNDER_REVIEW → PUBLISHED.
// Runs publishGigSchema to ensure required fields are present.
// ============================================================

const publishSelectShape = {
  title: true,
  gigType: true,
  description: true,
  eventDate: true,
  applicationDeadline: true,
  countryId: true,
  cityId: true,
  venueName: true,
  hideVenueName: true,
  venueAddress: true,
  venuePostalCode: true,
  budgetType: true,
  budgetMin: true,
  budgetMax: true,
  currency: true,
  requiredGenres: true,
  requiredExperienceLevel: true,
} as const;

export async function publishGig(gigId: number): Promise<ActionResult> {
  const { organizerProfileId } = await requireGigOwner(gigId);

  const orgProfile = await prisma.organizerProfile.findUnique({
    where: { id: organizerProfileId },
    select: { status: true, deletedAt: true },
  });
  if (
    !orgProfile ||
    orgProfile.status !== "ACTIVE" ||
    orgProfile.deletedAt !== null
  )
    return { success: false, error: "Active organizer profile required." };

  const gig = await prisma.gig.findUnique({
    where: { id: gigId, deletedAt: null },
    select: { status: true, ...publishSelectShape },
  });
  if (!gig) return { success: false, error: "Gig not found." };

  if (gig.status !== "DRAFT" && gig.status !== "UNDER_REVIEW")
    return { success: false, error: "Only draft gigs can be published." };

  const publishCheck = publishGigSchema.safeParse({
    ...gig,
    eventDate: gig.eventDate.toISOString(),
    applicationDeadline: gig.applicationDeadline?.toISOString() ?? null,
  });
  if (!publishCheck.success)
    return {
      success: false,
      error:
        publishCheck.error.errors[0]?.message ??
        "Gig is missing required information.",
    };

  await prisma.gig.update({
    where: { id: gigId },
    data: { status: "PUBLISHED" },
  });

  return { success: true, data: undefined };
}

// ============================================================
// closeGig
// Marks a PUBLISHED gig as FILLED (position taken).
// ============================================================

export async function closeGig(gigId: number): Promise<ActionResult> {
  const { organizerProfileId } = await requireGigOwner(gigId);

  const orgProfile = await prisma.organizerProfile.findUnique({
    where: { id: organizerProfileId },
    select: { status: true, deletedAt: true },
  });
  if (
    !orgProfile ||
    orgProfile.status !== "ACTIVE" ||
    orgProfile.deletedAt !== null
  )
    return { success: false, error: "Active organizer profile required." };

  const gig = await prisma.gig.findUnique({
    where: { id: gigId, deletedAt: null },
    select: { status: true },
  });
  if (!gig) return { success: false, error: "Gig not found." };

  if (gig.status !== "PUBLISHED" && gig.status !== "UNDER_REVIEW")
    return { success: false, error: "Only published gigs can be closed." };

  await prisma.gig.update({
    where: { id: gigId },
    data: { status: "FILLED" },
  });

  return { success: true, data: undefined };
}

// ============================================================
// cancelGig
// Cancels a gig and atomically rejects all open applications.
// ============================================================

export async function cancelGig(gigId: number): Promise<ActionResult> {
  const { organizerProfileId } = await requireGigOwner(gigId);

  const orgProfile = await prisma.organizerProfile.findUnique({
    where: { id: organizerProfileId },
    select: { status: true, deletedAt: true },
  });
  if (
    !orgProfile ||
    orgProfile.status !== "ACTIVE" ||
    orgProfile.deletedAt !== null
  )
    return { success: false, error: "Active organizer profile required." };

  const gig = await prisma.gig.findUnique({
    where: { id: gigId, deletedAt: null },
    select: { status: true },
  });
  if (!gig) return { success: false, error: "Gig not found." };

  if (gig.status === "CANCELLED" || gig.status === "EXPIRED")
    return { success: false, error: "Gig is already cancelled or expired." };

  await prisma.$transaction([
    prisma.gig.update({
      where: { id: gigId },
      data: { status: "CANCELLED" },
    }),
    prisma.gigApplication.updateMany({
      where: { gigId, status: { in: ["APPLIED", "SHORTLISTED"] } },
      data: { status: "REJECTED", rejectedAt: new Date() },
    }),
  ]);

  return { success: true, data: undefined };
}

// ============================================================
// applyToGig
// DJ applies. Checks: status, date, deadline, no duplicate.
// Creates application + organizer notification atomically.
// ============================================================

export async function applyToGig(
  input: unknown,
): Promise<ActionResult<{ applicationId: number }>> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const roles = await getRoles(user.id);
  if (!roles.includes("DJ"))
    return { success: false, error: "Only DJs can apply to gigs." };

  const djProfile = await getApprovedDjProfile(user.id);
  if (!djProfile)
    return { success: false, error: "You need a DJ profile to apply." };
  if (djProfile.status !== "APPROVED")
    return {
      success: false,
      error: "Your DJ profile must be approved before you can apply.",
    };

  const parsed = applyToGigSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };

  const { gigId, message } = parsed.data;

  const gig = await prisma.gig.findUnique({
    where: { id: gigId, deletedAt: null },
    select: {
      status: true,
      title: true,
      eventDate: true,
      applicationDeadline: true,
      organizerProfile: {
        select: {
          userId: true,
          displayName: true,
          user: { select: { email: true, name: true } },
        },
      },
    },
  });

  if (!gig) return { success: false, error: "Gig not found." };
  if (gig.status !== "PUBLISHED")
    return {
      success: false,
      error: "This gig is no longer accepting applications.",
    };

  const now = new Date();
  if (gig.eventDate <= now)
    return { success: false, error: "This gig has already passed." };
  if (gig.applicationDeadline && gig.applicationDeadline <= now)
    return { success: false, error: "The application deadline has passed." };

  const existing = await prisma.gigApplication.findUnique({
    where: { gigId_djProfileId: { gigId, djProfileId: djProfile.id } },
    select: { id: true, status: true },
  });
  if (existing && existing.status !== "WITHDRAWN")
    return {
      success: false,
      error: "You have already applied to this gig.",
    };

  try {
    const application = await prisma.$transaction(async (tx) => {
      // Re-check inside transaction to minimize race window
      const existing = await tx.gigApplication.findUnique({
        where: { gigId_djProfileId: { gigId, djProfileId: djProfile.id } },
        select: { id: true, status: true },
      });
      if (existing && existing.status !== "WITHDRAWN") {
        throw new Error("DUPLICATE");
      }
      const app = await tx.gigApplication.create({
        data: {
          gigId,
          djProfileId: djProfile.id,
          status: "APPLIED",
          message: message ?? null,
        },
        select: { id: true },
      });

      await tx.notification.create({
        data: {
          type: "GIG_APPLICATION_RECEIVED",
          recipientId: gig.organizerProfile.userId,
          senderId: user.id,
          data: { gigId, applicationId: app.id },
        },
      });

      return app;
    });

    const djStageName = await prisma.djProfile.findUnique({
      where: { id: djProfile.id },
      select: { stageName: true },
    });

    await sendEmail({
      to: gig.organizerProfile.user.email,
      userId: gig.organizerProfile.userId,
      emailType: "GIG_APPLICATION_RECEIVED",
      subject: gigApplicationReceivedSubject,
      html: gigApplicationReceivedHtml({
        organizerName:
          gig.organizerProfile.user.name ?? gig.organizerProfile.displayName,
        gigTitle: gig.title,
        djName: djStageName?.stageName ?? user.email ?? "A DJ",
      }),
    });

    return { success: true, data: { applicationId: application.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "DUPLICATE") {
      return { success: false, error: "You have already applied to this gig." };
    }
    // Prisma unique constraint error code
    if ((err as { code?: string }).code === "P2002") {
      return { success: false, error: "You have already applied to this gig." };
    }
    throw err;
  }
}

// ============================================================
// withdrawApplication
// DJ withdraws their own APPLIED or SHORTLISTED application.
// ============================================================

export async function withdrawApplication(
  applicationId: number,
): Promise<ActionResult> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const application = await prisma.gigApplication.findUnique({
    where: { id: applicationId },
    select: {
      status: true,
      djProfile: { select: { userId: true } },
    },
  });

  if (!application) return { success: false, error: "Application not found." };
  if (application.djProfile.userId !== user.id)
    return {
      success: false,
      error: "You can only withdraw your own applications.",
    };

  if (application.status !== "APPLIED" && application.status !== "SHORTLISTED")
    return {
      success: false,
      error: "Only pending or shortlisted applications can be withdrawn.",
    };

  await prisma.gigApplication.update({
    where: { id: applicationId },
    data: { status: "WITHDRAWN", withdrawnAt: new Date() },
  });

  return { success: true, data: undefined };
}

// ============================================================
// updateApplicationStatus
// Organizer shortlists, accepts, or rejects an applicant.
// Valid transitions enforced. DJ notified on every change.
// ============================================================

const VALID_TRANSITIONS: Partial<Record<string, string[]>> = {
  APPLIED: ["SHORTLISTED", "ACCEPTED", "REJECTED"],
  SHORTLISTED: ["ACCEPTED", "REJECTED"],
};

export async function updateApplicationStatus(
  input: unknown,
): Promise<ActionResult> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const roles = await getRoles(user.id);
  if (!roles.includes("ORGANIZER"))
    return {
      success: false,
      error: "Only organizers can manage applications.",
    };

  const orgProfile = await getActiveOrganizerProfile(user.id);
  if (
    !orgProfile ||
    orgProfile.status !== "ACTIVE" ||
    orgProfile.deletedAt !== null
  )
    return { success: false, error: "Active organizer profile required." };

  const parsed = updateApplicationStatusSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };

  const { applicationId, status: newStatus } = parsed.data;

  const application = await prisma.gigApplication.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      status: true,
      gig: { select: { id: true, organizerProfileId: true, title: true } },
      djProfile: {
        select: {
          userId: true,
          stageName: true,
          user: { select: { email: true, name: true } },
        },
      },
    },
  });

  if (!application) return { success: false, error: "Application not found." };
  if (application.gig.organizerProfileId !== orgProfile.id)
    return {
      success: false,
      error: "You can only manage applications for your own gigs.",
    };

  const allowedNext = VALID_TRANSITIONS[application.status];
  if (!allowedNext?.includes(newStatus))
    return {
      success: false,
      error: `Cannot change application from ${application.status} to ${newStatus}.`,
    };

  const now = new Date();
  const timestampUpdate =
    newStatus === "SHORTLISTED"
      ? { shortlistedAt: now }
      : newStatus === "ACCEPTED"
        ? { acceptedAt: now }
        : { rejectedAt: now };

  const notificationType =
    newStatus === "SHORTLISTED"
      ? ("GIG_APPLICATION_SHORTLISTED" as const)
      : newStatus === "ACCEPTED"
        ? ("GIG_APPLICATION_ACCEPTED" as const)
        : ("GIG_APPLICATION_REJECTED" as const);

  await prisma.$transaction([
    prisma.gigApplication.update({
      where: { id: applicationId },
      data: { status: newStatus, ...timestampUpdate },
    }),
    prisma.notification.create({
      data: {
        type: notificationType,
        recipientId: application.djProfile.userId,
        senderId: user.id,
        data: { gigId: application.gig.id, applicationId },
      },
    }),
    ...(newStatus === "ACCEPTED"
      ? [
          prisma.hire.create({
            data: {
              applicationId: application.id,
            },
          }),
        ]
      : []),
  ]);

  if (newStatus === "ACCEPTED" || newStatus === "REJECTED") {
    const djName =
      application.djProfile.user.name ?? application.djProfile.stageName;
    await sendEmail({
      to: application.djProfile.user.email,
      userId: application.djProfile.userId,
      emailType:
        newStatus === "ACCEPTED"
          ? "GIG_APPLICATION_ACCEPTED"
          : "GIG_APPLICATION_REJECTED",
      subject:
        newStatus === "ACCEPTED"
          ? gigApplicationAcceptedSubject
          : gigApplicationRejectedSubject,
      html:
        newStatus === "ACCEPTED"
          ? gigApplicationAcceptedHtml({
              djName,
              gigTitle: application.gig.title,
            })
          : gigApplicationRejectedHtml({
              djName,
              gigTitle: application.gig.title,
            }),
    });
  }

  revalidatePath("/dashboard/organizer/gigs", "layout");
  return { success: true, data: undefined };
}

// ============================================================
// completeGig
// Organizer marks a gig as performed. Only gigs with an active
// hire (accepted application) can be completed.
// Updates: Gig.status = COMPLETED, Hire.status = COMPLETED,
// Hire.completedAt = now(). This is the trigger for gig review
// eligibility and DJ reliability scoring.
// ============================================================

export async function completeGig(
  input: unknown,
): Promise<ActionResult<{ gigId: number; hireId: number }>> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const roles = await getRoles(user.id);
  if (!roles.includes("ORGANIZER"))
    return { success: false, error: "Only organizers can complete gigs." };

  const parsed = completeGigSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };

  const { gigId } = parsed.data;

  const gig = await prisma.gig.findUnique({
    where: { id: gigId },
    include: {
      organizerProfile: { select: { userId: true } },
      applications: {
        where: { status: "ACCEPTED" },
        include: { hire: true, djProfile: true },
      },
    },
  });

  if (!gig) return { success: false, error: "Gig not found." };
  if (gig.organizerProfile.userId !== user.id)
    return { success: false, error: "You can only complete your own gigs." };
  if (gig.status === "COMPLETED" || gig.status === "CANCELLED")
    return { success: false, error: "Gig is already finalized." };

  const application = gig.applications[0];
  if (!application)
    return { success: false, error: "No accepted DJ to complete." };

  const now = new Date();
  if (gig.eventDate > now)
    return {
      success: false,
      error: "Gig cannot be completed before its event date.",
    };

  const { hire, completed } = await prisma.$transaction(async (tx) => {
    // Ensure Hire exists (fixes the missing creation bug)
    if (!application.hire) {
      await tx.hire.create({
        data: {
          applicationId: application.id,
          status: "ACTIVE",
        },
      });
    } else if (
      application.hire.status === "CANCELLED_BY_DJ" ||
      application.hire.status === "CANCELLED_BY_ORGANIZER" ||
      application.hire.status === "NO_SHOW"
    ) {
      // Preserve cancelled/no-show hires and abort completion
      return { hire: application.hire, completed: false };
    }

    const updatedHire = await tx.hire.update({
      where: { applicationId: application.id },
      data: {
        status: "COMPLETED",
        completedAt: now,
      },
    });

    await tx.gig.update({
      where: { id: gigId },
      data: { status: "COMPLETED" },
    });

    await tx.notification.create({
      data: {
        type: "GIG_COMPLETED",
        recipientId: gig.organizerProfile.userId,
        data: {
          gigId: gig.id,
          gigSlug: gig.slug,
          gigTitle: gig.title,
          djName: application.djProfile.stageName,
          djProfileId: application.djProfile.id,
        },
      },
    });

    return { hire: updatedHire, completed: true };
  });

  if (!completed) {
    return {
      success: false,
      error:
        "Hire cannot be completed because it was cancelled or marked as no-show.",
    };
  }

  await updateReputationScore(application.djProfile.id, "GIG_COMPLETED");

  revalidatePath(`/gigs/${gig.slug}`);
  revalidatePath("/organizer/gigs", "layout");
  revalidatePath("/organizer/dashboard");
  return { success: true, data: { gigId, hireId: hire.id } };
}

// ============================================================
// cancelHire
// DJ or organizer cancels an active hire after acceptance.
// Sets Hire.status to CANCELLED_BY_DJ or CANCELLED_BY_ORGANIZER,
// records the reason and timestamp.
// ============================================================

export async function cancelHire(
  input: unknown,
): Promise<ActionResult<{ hireId: number }>> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const parsed = cancelHireSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };

  const { hireId, reason, cancelledBy } = parsed.data;

  const hire = await prisma.hire.findUnique({
    where: { id: hireId },
    include: {
      application: {
        include: {
          djProfile: { select: { id: true, userId: true } },
          gig: {
            include: {
              organizerProfile: { select: { id: true, userId: true } },
            },
          },
        },
      },
    },
  });

  if (!hire) return { success: false, error: "Hire not found." };
  if (hire.status !== "ACTIVE")
    return {
      success: false,
      error: "Only active hires can be cancelled.",
    };

  const { gig, djProfile } = hire.application;

  if (cancelledBy === "ORGANIZER") {
    const roles = await getRoles(user.id);
    if (!roles.includes("ORGANIZER"))
      return {
        success: false,
        error: "Only organizers can cancel on behalf of an organizer.",
      };
    if (gig.organizerProfile.userId !== user.id)
      return {
        success: false,
        error: "You can only cancel hires for your own gigs.",
      };
  } else {
    if (djProfile.userId !== user.id)
      return {
        success: false,
        error: "You can only cancel your own hire.",
      };
  }

  const now = new Date();
  const status =
    cancelledBy === "ORGANIZER" ? "CANCELLED_BY_ORGANIZER" : "CANCELLED_BY_DJ";

  await prisma.$transaction(async (tx) => {
    await tx.hire.update({
      where: { id: hireId },
      data: {
        status,
        cancelledAt: now,
        cancellationReason: reason ?? null,
      },
    });

    await tx.notification.create({
      data: {
        type:
          cancelledBy === "DJ" ? "GIG_APPLICATION_WITHDRAWN" : "GIG_CANCELLED",
        recipientId:
          cancelledBy === "DJ" ? gig.organizerProfile.userId : djProfile.userId,
        data: {
          gigId: gig.id,
          gigSlug: gig.slug,
          gigTitle: gig.title,
          cancelledBy,
          reason: reason ?? null,
        },
      },
    });
  });

  await updateReputationScore(djProfile.id, "HIRE_CANCELLED");

  revalidatePath(`/gigs/${gig.slug}`);
  revalidatePath("/organizer/gigs", "layout");
  return { success: true, data: { hireId } };
}

// ============================================================
// reportNoShow
// Organizer flags the DJ as a no-show. Sets Hire.noShow = true
// and Hire.status = NO_SHOW.
// ============================================================

export async function reportNoShow(
  input: unknown,
): Promise<ActionResult<{ hireId: number }>> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const roles = await getRoles(user.id);
  if (!roles.includes("ORGANIZER"))
    return {
      success: false,
      error: "Only organizers can report a no-show.",
    };

  const parsed = reportNoShowSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };

  const { hireId } = parsed.data;

  const hire = await prisma.hire.findUnique({
    where: { id: hireId },
    include: {
      application: {
        include: {
          djProfile: { select: { id: true, userId: true } },
          gig: {
            include: {
              organizerProfile: { select: { userId: true } },
            },
          },
        },
      },
    },
  });

  if (!hire) return { success: false, error: "Hire not found." };
  if (hire.status !== "ACTIVE")
    return {
      success: false,
      error: "Only active hires can be reported as no-show.",
    };

  const { gig, djProfile } = hire.application;

  if (gig.organizerProfile.userId !== user.id)
    return {
      success: false,
      error: "You can only report no-shows for your own gigs.",
    };

  await prisma.$transaction(async (tx) => {
    await tx.hire.update({
      where: { id: hireId },
      data: { noShow: true, status: "NO_SHOW" },
    });

    await tx.notification.create({
      data: {
        type: "GIG_NO_SHOW",
        recipientId: djProfile.userId,
        data: {
          gigId: gig.id,
          gigSlug: gig.slug,
          gigTitle: gig.title,
          message: "You were reported as a no-show for a gig.",
        },
      },
    });
  });

  await updateReputationScore(djProfile.id, "NO_SHOW_REPORTED");

  revalidatePath(`/gigs/${gig.slug}`);
  revalidatePath("/organizer/gigs", "layout");
  return { success: true, data: { hireId } };
}
