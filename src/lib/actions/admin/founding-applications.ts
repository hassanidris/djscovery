"use server";

import crypto from "crypto";
import { FoundingApplicationStatus, Prisma } from "@prisma/client";
import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
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

export async function saveFoundingApplicationNotes(formData: FormData) {
  await requireAdmin();
  const parsed = FoundingApplicationNotesSchema.safeParse({
    applicationId: formData.get("applicationId"),
    notes: formData.get("notes"),
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid notes" };

  const result = await prisma.foundingApplication.updateMany({
    where: {
      id: parsed.data.applicationId,
      deletedAt: { equals: null },
    },
    data: { notes: parsed.data.notes || null },
  });
  if (!result.count) return { error: "Application not found" };

  revalidatePath("/admin/founding/applications");
  revalidatePath(`/admin/founding/applications/${parsed.data.applicationId}`);
  return { success: true as const };
}

export async function changeFoundingApplicationStatus(formData: FormData) {
  const { userId: adminId } = await requireAdmin();
  const parsed = FoundingApplicationStatusChangeSchema.safeParse({
    applicationId: formData.get("applicationId"),
    status: formData.get("status"),
    note: formData.get("note") ?? "",
    reason: formData.get("reason") ?? "",
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid decision" };

  const { applicationId, status, note, reason } = parsed.data;
  if (!["UNDER_REVIEW", "APPROVED", "REJECTED"].includes(status)) {
    return {
      error: "This status cannot be set from the admin review workflow",
    };
  }

  const rawInvitationToken =
    status === "APPROVED" ? crypto.randomBytes(32).toString("hex") : null;
  const invitationTokenHash = rawInvitationToken
    ? crypto.createHash("sha256").update(rawInvitationToken).digest("hex")
    : null;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

  let application: {
    email: string;
    name: string;
    status: FoundingApplicationStatus;
  };
  try {
    application = await prisma.$transaction(async (tx) => {
      const current = await tx.foundingApplication.findFirst({
        where: { id: applicationId, deletedAt: { equals: null } },
        select: { id: true, email: true, name: true, status: true },
      });
      if (!current) throw new Error("APPLICATION_NOT_FOUND");
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
            status === "APPROVED" || status === "REJECTED"
              ? adminId
              : undefined,
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
                (status === "UNDER_REVIEW"
                  ? "Application review started"
                  : null),
        },
      });

      if (invitationTokenHash && rawInvitationToken) {
        await tx.invitationToken.create({
          data: {
            tokenHash: invitationTokenHash,
            type: "FOUNDING_MEMBER",
            email: current.email,
            expiresAt,
          },
        });
      }
      return { email: current.email, name: current.name, status };
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "APPLICATION_NOT_FOUND")
      return { error: "Application not found" };
    if (message === "APPLICATION_ALREADY_DECIDED")
      return { error: "This application has already been decided" };
    if (message === "STATUS_UNCHANGED")
      return { error: "Application is already in this status" };
    if (message === "APPLICATION_CHANGED_CONCURRENTLY") {
      return {
        error: "Application changed during review. Refresh and try again.",
      };
    }
    console.error("Failed to update founding application status", error);
    return { error: "Failed to update application status" };
  }

  let emailWarning: string | undefined;
  try {
    if (status === "APPROVED" && !resend) {
      emailWarning =
        "The approval was saved, but the invitation email could not be sent because email is not configured.";
      console.warn(
        `[Founding application] Email service unavailable for ${application.email}`,
      );
    } else if (status === "APPROVED" && rawInvitationToken && resend) {
      const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://djcovery.com"}/sign-up?role=dj&invitation=${encodeURIComponent(rawInvitationToken)}`;
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
  return {
    success: true as const,
    ...(emailWarning ? { warning: emailWarning } : {}),
  };
}
