"use server";

import crypto from "crypto";
import { FoundingApplicationStatus, Prisma } from "@prisma/client";
import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import resend from "@/lib/email/client";
import {
  foundingApplicationInvitationEmail,
  foundingApplicationInvitationSubject,
} from "@/lib/email/templates/foundingApplicationInvitation";
import {
  foundingApplicationRejectionEmail,
  foundingApplicationRejectionSubject,
} from "@/lib/email/templates/foundingApplicationRejection";
import {
  FOUNDING_APPLICATION_STATUSES,
  FoundingApplicationIdSchema,
  FoundingApplicationNotesSchema,
  FoundingApplicationStatusChangeSchema,
} from "@/lib/validation/founding-admin";
import { revalidatePath } from "next/cache";

const ACTIVE_REVIEW_STATUSES: FoundingApplicationStatus[] = [
  "PENDING",
  "EMAIL_VERIFIED",
  "UNDER_REVIEW",
];
const INVITATION_EXPIRY_DAYS = 14;
const REAPPLICATION_COOLDOWN_DAYS = 30;

interface ChangeApplicationStatusInput {
  applicationId: number;
  status: "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  adminId: number;
  note?: string;
  reason?: string;
  invitationTokenHash?: string | null;
  expiresAt?: Date;
}

interface ChangeApplicationStatusResult {
  email: string;
  name: string;
  status: FoundingApplicationStatus;
}

async function changeApplicationStatusInTransaction(
  tx: Prisma.TransactionClient,
  input: ChangeApplicationStatusInput,
): Promise<ChangeApplicationStatusResult> {
  const {
    applicationId,
    status,
    adminId,
    note,
    reason,
    invitationTokenHash,
    expiresAt,
  } = input;

  const current = await tx.foundingApplication.findFirst({
    where: { id: applicationId, deletedAt: { equals: null } },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      resumeTokenHash: true,
      emailVerifiedAt: true,
    },
  });
  if (!current) throw new Error("APPLICATION_NOT_FOUND");
  if (current.resumeTokenHash) throw new Error("APPLICATION_NOT_SUBMITTED");
  if (status === "APPROVED" && !current.emailVerifiedAt) {
    throw new Error("APPLICATION_EMAIL_UNVERIFIED");
  }
  if (!ACTIVE_REVIEW_STATUSES.includes(current.status)) {
    throw new Error("APPLICATION_ALREADY_DECIDED");
  }
  if (current.status === status) throw new Error("STATUS_UNCHANGED");

  const now = new Date();
  const update = await tx.foundingApplication.updateMany({
    where: {
      id: applicationId,
      status: current.status,
      deletedAt: { equals: null },
    },
    data: {
      status,
      reviewedAt:
        status === "APPROVED" || status === "REJECTED" ? now : undefined,
      reviewedBy:
        status === "APPROVED" || status === "REJECTED" ? adminId : undefined,
      rejectionReason: status === "REJECTED" ? reason : null,
    },
  });
  if (!update.count) throw new Error("APPLICATION_CHANGED_CONCURRENTLY");

  await tx.foundingApplicationStatusLog.create({
    data: {
      foundingApplicationId: applicationId,
      previousStatus: current.status,
      newStatus: status,
      changedBy: adminId,
      reason:
        status === "REJECTED"
          ? reason
          : note ||
            (status === "UNDER_REVIEW" ? "Application review started" : null),
    },
  });

  if (invitationTokenHash && expiresAt) {
    await tx.invitationToken.create({
      data: {
        tokenHash: invitationTokenHash,
        type: "FOUNDING_MEMBER",
        email: current.email,
        foundingApplicationId: current.id,
        expiresAt,
      },
    });
  }

  return { email: current.email, name: current.name, status };
}

export type FoundingApplicationListFilters = {
  query?: string;
  status?: string;
  verified?: string;
  page?: number;
};

export async function getFoundingApplications(
  filters: FoundingApplicationListFilters = {},
) {
  await requireAdmin();

  const query = filters.query?.trim().slice(0, 120) ?? "";
  const status = FOUNDING_APPLICATION_STATUSES.includes(
    filters.status as (typeof FOUNDING_APPLICATION_STATUSES)[number],
  )
    ? (filters.status as FoundingApplicationStatus)
    : undefined;
  const page = Number.isInteger(filters.page)
    ? Math.max(1, filters.page ?? 1)
    : 1;
  const pageSize = 20;
  const where: Prisma.FoundingApplicationWhereInput = {
    deletedAt: { equals: null },
    ...(status ? { status } : {}),
    ...(filters.verified === "yes"
      ? { emailVerifiedAt: { not: null } }
      : filters.verified === "no"
        ? { emailVerifiedAt: { equals: null } }
        : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { stageName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [
    applications,
    total,
    statusGroups,
    verifiedCount,
    countryGroups,
    cityGroups,
  ] = await prisma.$transaction([
    prisma.foundingApplication.findMany({
      where,
      orderBy: [{ submittedAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        stageName: true,
        status: true,
        cityId: true,
        countryId: true,
        emailVerifiedAt: true,
        submittedAt: true,
        country: { select: { name: true } },
      },
    }),
    prisma.foundingApplication.count({ where }),
    prisma.foundingApplication.groupBy({
      by: ["status"],
      where: { deletedAt: { equals: null } },
      _count: { id: true },
      orderBy: { status: "asc" },
    }),
    prisma.foundingApplication.count({
      where: {
        deletedAt: { equals: null },
        emailVerifiedAt: { not: null },
      },
    }),
    prisma.foundingApplication.groupBy({
      by: ["countryId"],
      where: { deletedAt: { equals: null }, countryId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { countryId: "desc" } },
      take: 6,
    }),
    prisma.foundingApplication.groupBy({
      by: ["cityId"],
      where: { deletedAt: { equals: null }, cityId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { cityId: "desc" } },
      take: 6,
    }),
  ]);

  const cityIds = [
    ...new Set([
      ...applications.flatMap((application) =>
        application.cityId === null ? [] : [application.cityId],
      ),
      ...cityGroups.flatMap((group) =>
        group.cityId === null ? [] : [group.cityId],
      ),
    ]),
  ];
  const countryIds = countryGroups.flatMap((group) =>
    group.countryId === null ? [] : [group.countryId],
  );
  const [cities, countries] = await prisma.$transaction([
    prisma.city.findMany({
      where: { id: { in: cityIds } },
      select: { id: true, name: true },
    }),
    prisma.country.findMany({
      where: { id: { in: countryIds } },
      select: { id: true, name: true },
    }),
  ]);
  const cityNames = new Map(cities.map((city) => [city.id, city.name]));
  const countryNames = new Map(
    countries.map((country) => [country.id, country.name]),
  );
  const countsByStatus = Object.fromEntries(
    FOUNDING_APPLICATION_STATUSES.map((item) => [item, 0]),
  ) as Record<FoundingApplicationStatus, number>;
  for (const group of statusGroups) {
    countsByStatus[group.status] =
      typeof group._count === "object" && group._count !== null
        ? (group._count.id ?? 0)
        : 0;
  }

  const reviewedCount =
    countsByStatus.UNDER_REVIEW +
    countsByStatus.APPROVED +
    countsByStatus.REJECTED;
  const totalApplications = Object.values(countsByStatus).reduce(
    (sum, count) => sum + count,
    0,
  );

  return {
    applications: applications.map((application) => ({
      ...application,
      cityName: application.cityId
        ? (cityNames.get(application.cityId) ?? null)
        : null,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    analytics: {
      total: totalApplications,
      verified: verifiedCount,
      inReview: countsByStatus.UNDER_REVIEW,
      approved: countsByStatus.APPROVED,
      rejected: countsByStatus.REJECTED,
      reviewed: reviewedCount,
      verificationRate: totalApplications
        ? Math.round((verifiedCount / totalApplications) * 100)
        : 0,
      approvalRate: reviewedCount
        ? Math.round((countsByStatus.APPROVED / reviewedCount) * 100)
        : 0,
      countsByStatus,
      byCountry: countryGroups.map((group) => ({
        name: group.countryId
          ? (countryNames.get(group.countryId) ?? "Unknown")
          : "Unknown",
        count:
          typeof group._count === "object" && group._count !== null
            ? (group._count.id ?? 0)
            : 0,
      })),
      byCity: cityGroups.map((group) => ({
        name: group.cityId
          ? (cityNames.get(group.cityId) ?? "Unknown")
          : "Unknown",
        count:
          typeof group._count === "object" && group._count !== null
            ? (group._count.id ?? 0)
            : 0,
      })),
    },
  };
}

export async function getFoundingApplicationDetail(applicationId: number) {
  await requireAdmin();
  const parsed = FoundingApplicationIdSchema.safeParse({ applicationId });
  if (!parsed.success) return null;

  const application = await prisma.foundingApplication.findFirst({
    where: {
      id: parsed.data.applicationId,
      deletedAt: { equals: null },
    },
    include: {
      country: { select: { name: true } },
      statusLogs: {
        orderBy: { createdAt: "desc" },
        include: { changer: { select: { name: true, email: true } } },
      },
    },
  });
  if (!application) return null;

  const [city, invitation] = await Promise.all([
    application.cityId
      ? prisma.city.findUnique({
          where: { id: application.cityId },
          select: { name: true },
        })
      : Promise.resolve(null),
    application.status === "APPROVED"
      ? prisma.invitationToken.findFirst({
          where: {
            email: application.email,
            type: "FOUNDING_MEMBER",
            foundingApplicationId: application.id,
            createdAt: {
              gte: application.reviewedAt ?? application.submittedAt,
            },
          },
          orderBy: { createdAt: "desc" },
          select: { status: true, expiresAt: true, createdAt: true },
        })
      : Promise.resolve(null),
  ]);
  return {
    ...application,
    cityName: city?.name ?? null,
    latestInvitation: invitation,
  };
}

export async function saveFoundingApplicationNotes(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = FoundingApplicationNotesSchema.safeParse({
    applicationId: formData.get("applicationId"),
    notes: formData.get("notes"),
  });
  if (!parsed.success)
    return actionError(parsed.error.issues[0]?.message ?? "Invalid notes");

  const result = await prisma.foundingApplication.updateMany({
    where: {
      id: parsed.data.applicationId,
      deletedAt: { equals: null },
    },
    data: { notes: parsed.data.notes || null },
  });
  if (!result.count) return actionError("Application not found");

  revalidatePath("/admin/founding/applications");
  revalidatePath(`/admin/founding/applications/${parsed.data.applicationId}`);
  return actionSuccess();
}

export async function regenerateFoundingApplicationInvitation(
  formData: FormData,
): Promise<ActionResult<{ warning?: string }>> {
  await requireAdmin();
  const parsed = FoundingApplicationIdSchema.safeParse({
    applicationId: formData.get("applicationId"),
  });
  if (!parsed.success)
    return actionError(
      parsed.error.issues[0]?.message ?? "Invalid application ID",
    );

  const applicationId = parsed.data.applicationId;
  const rawInvitationToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawInvitationToken)
    .digest("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

  let application: { email: string; name: string };
  try {
    application = await prisma.$transaction(async (tx) => {
      const current = await tx.foundingApplication.findFirst({
        where: { id: applicationId, deletedAt: { equals: null } },
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          emailVerifiedAt: true,
        },
      });
      if (!current) throw new Error("APPLICATION_NOT_FOUND");
      if (current.status !== "APPROVED")
        throw new Error("APPLICATION_NOT_APPROVED");
      if (!current.emailVerifiedAt)
        throw new Error("APPLICATION_EMAIL_UNVERIFIED");

      await tx.invitationToken.updateMany({
        where: {
          email: current.email,
          type: "FOUNDING_MEMBER",
          foundingApplicationId: current.id,
          status: "PENDING",
        },
        data: { status: "REVOKED" },
      });
      await tx.invitationToken.create({
        data: {
          tokenHash,
          type: "FOUNDING_MEMBER",
          email: current.email,
          foundingApplicationId: current.id,
          expiresAt,
        },
      });
      return { email: current.email, name: current.name };
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "APPLICATION_NOT_FOUND")
      return actionError("Application not found");
    if (message === "APPLICATION_NOT_APPROVED")
      return actionError(
        "Only approved applications can receive a new invitation",
      );
    if (message === "APPLICATION_EMAIL_UNVERIFIED")
      return actionError(
        "The applicant must verify their email before receiving an invitation",
      );
    console.error(
      "Failed to regenerate founding application invitation",
      error,
    );
    return actionError("Failed to regenerate invitation");
  }

  let warning: string | undefined;
  try {
    if (!resend) {
      warning =
        "A new invitation was created, but it could not be emailed because email is not configured.";
    } else {
      const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://djcovery.com"}/founding-djs/invitation/${encodeURIComponent(rawInvitationToken)}`;
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "noreply@djcovery.com",
        to: application.email,
        subject: foundingApplicationInvitationSubject,
        html: foundingApplicationInvitationEmail({
          name: application.name,
          invitationUrl,
          expiresAt,
        }),
      });
      if (result.error)
        warning =
          "A new invitation was created, but the invitation email failed to send.";
    }
  } catch (error) {
    console.error("Failed to email regenerated founding invitation", error);
    warning =
      "A new invitation was created, but the invitation email failed to send.";
  }

  revalidatePath("/admin/founding/applications");
  revalidatePath(`/admin/founding/applications/${applicationId}`);
  return actionSuccess(warning ? { warning } : {});
}

export async function changeFoundingApplicationStatus(
  formData: FormData,
): Promise<ActionResult<{ warning?: string }>> {
  const { userId: adminId } = await requireAdmin();
  const parsed = FoundingApplicationStatusChangeSchema.safeParse({
    applicationId: formData.get("applicationId"),
    status: formData.get("status"),
    note: formData.get("note") ?? "",
    reason: formData.get("reason") ?? "",
  });
  if (!parsed.success)
    return actionError(parsed.error.issues[0]?.message ?? "Invalid decision");

  const { applicationId, status, note, reason } = parsed.data;
  if (!["UNDER_REVIEW", "APPROVED", "REJECTED"].includes(status)) {
    return actionError(
      "This status cannot be set from the admin review workflow",
    );
  }

  const rawInvitationToken =
    status === "APPROVED" ? crypto.randomBytes(32).toString("hex") : null;
  const invitationTokenHash = rawInvitationToken
    ? crypto.createHash("sha256").update(rawInvitationToken).digest("hex")
    : null;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

  let application: ChangeApplicationStatusResult;
  try {
    application = await prisma.$transaction(async (tx) => {
      return changeApplicationStatusInTransaction(tx, {
        applicationId,
        status,
        adminId,
        note,
        reason,
        invitationTokenHash,
        expiresAt,
      });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "APPLICATION_NOT_FOUND")
      return actionError("Application not found");
    if (message === "APPLICATION_NOT_SUBMITTED")
      return actionError(
        "This application has not been submitted yet. Ask the applicant to complete and submit it before reviewing.",
      );
    if (message === "APPLICATION_EMAIL_UNVERIFIED")
      return actionError(
        "The applicant must verify their email before receiving an invitation",
      );
    if (message === "APPLICATION_ALREADY_DECIDED")
      return actionError("This application has already been decided");
    if (message === "STATUS_UNCHANGED")
      return actionError("Application is already in this status");
    if (message === "APPLICATION_CHANGED_CONCURRENTLY") {
      return actionError(
        "Application changed during review. Refresh and try again.",
      );
    }
    console.error("Failed to update founding application status", error);
    return actionError("Failed to update application status");
  }

  let emailWarning: string | undefined;
  try {
    if (status === "APPROVED" && !resend) {
      emailWarning =
        "The approval was saved, but the invitation email could not be sent because email is not configured.";
      console.warn(
        `[Founding application] Email service unavailable for application ${applicationId}`,
      );
    } else if (status === "APPROVED" && rawInvitationToken && resend) {
      const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://djcovery.com"}/founding-djs/invitation/${encodeURIComponent(rawInvitationToken)}`;
      const result = await resend!.emails.send({
        from: process.env.EMAIL_FROM ?? "noreply@djcovery.com",
        to: application.email,
        subject: foundingApplicationInvitationSubject,
        html: foundingApplicationInvitationEmail({
          name: application.name,
          invitationUrl,
          expiresAt,
        }),
      });
      if (result.error)
        emailWarning =
          "The approval was saved, but the invitation email failed to send.";
    } else if (status === "REJECTED") {
      if (!resend) {
        emailWarning =
          "The rejection was saved, but the decision email could not be sent because email is not configured.";
      } else {
        const reapplyAt = new Date();
        reapplyAt.setDate(reapplyAt.getDate() + REAPPLICATION_COOLDOWN_DAYS);
        const result = await resend.emails.send({
          from: process.env.EMAIL_FROM ?? "noreply@djcovery.com",
          to: application.email,
          subject: foundingApplicationRejectionSubject,
          html: foundingApplicationRejectionEmail({
            name: application.name,
            reason,
            reapplyAt,
          }),
        });
        if (result.error)
          emailWarning =
            "The rejection was saved, but the decision email failed to send.";
      }
    }
  } catch (error) {
    console.error("Failed to send founding application decision email", error);
    emailWarning = "The decision was saved, but the email failed to send.";
  }

  revalidatePath("/admin/founding");
  revalidatePath("/admin/founding/applications");
  revalidatePath(`/admin/founding/applications/${applicationId}`);
  return actionSuccess(emailWarning ? { warning: emailWarning } : {});
}

export async function bulkChangeFoundingApplicationStatus(
  formData: FormData,
): Promise<ActionResult<{ warning?: string; processed?: number }>> {
  const { userId: adminId } = await requireAdmin();

  const applicationIds = formData.getAll("applicationIds").map(Number);
  const status = formData.get("status") as string;
  const note = formData.get("note") as string | null;
  const reason = formData.get("reason") as string | null;

  if (!["UNDER_REVIEW", "APPROVED", "REJECTED"].includes(status)) {
    return actionError("Invalid status");
  }

  if (applicationIds.length === 0) {
    return actionError("No applications selected");
  }

  const rawInvitationTokens =
    status === "APPROVED"
      ? applicationIds.map(() => crypto.randomBytes(32).toString("hex"))
      : [];
  const invitationTokenHashes = rawInvitationTokens.map((token) =>
    crypto.createHash("sha256").update(token).digest("hex"),
  );
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

  let processed = 0;
  let emailWarning: string | undefined;

  try {
    const applications = await prisma.foundingApplication.findMany({
      where: {
        id: { in: applicationIds },
        deletedAt: { equals: null },
        status: { in: ACTIVE_REVIEW_STATUSES },
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        emailVerifiedAt: true,
      },
    });

    for (const application of applications) {
      if (status === "APPROVED" && !application.emailVerifiedAt) {
        continue;
      }

      const tokenIndex = applications.indexOf(application);
      const tokenHash =
        status === "APPROVED" ? invitationTokenHashes[tokenIndex] : null;
      const rawToken =
        status === "APPROVED" ? rawInvitationTokens[tokenIndex] : null;

      let result: ChangeApplicationStatusResult;
      try {
        result = await prisma.$transaction(async (tx) => {
          return changeApplicationStatusInTransaction(tx, {
            applicationId: application.id,
            status: status as "UNDER_REVIEW" | "APPROVED" | "REJECTED",
            adminId,
            note: note ?? undefined,
            reason: reason ?? undefined,
            invitationTokenHash,
            expiresAt,
          });
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (
          message === "APPLICATION_NOT_FOUND" ||
          message === "APPLICATION_NOT_SUBMITTED" ||
          message === "APPLICATION_EMAIL_UNVERIFIED" ||
          message === "APPLICATION_ALREADY_DECIDED" ||
          message === "STATUS_UNCHANGED" ||
          message === "APPLICATION_CHANGED_CONCURRENTLY"
        ) {
          continue;
        }
        throw error;
      }

      processed++;

      if (status === "APPROVED" && rawToken && resend) {
        try {
          const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://djcovery.com"}/founding-djs/invitation/${encodeURIComponent(rawToken)}`;
          await resend.emails.send({
            from: process.env.EMAIL_FROM ?? "noreply@djcovery.com",
            to: result.email,
            subject: foundingApplicationInvitationSubject,
            html: foundingApplicationInvitationEmail({
              name: result.name,
              invitationUrl,
              expiresAt,
            }),
          });
        } catch {
          emailWarning = "Some invitation emails failed to send.";
        }
      }
    }

    revalidatePath("/admin/founding");
    revalidatePath("/admin/founding/applications");
    return actionSuccess({
      warning: emailWarning,
      processed,
    });
  } catch (error) {
    console.error("Failed to bulk update founding application status", error);
    return actionError("Failed to update applications");
  }
}
