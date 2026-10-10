"use server";

import { InvitationStatus, InvitationType, Prisma } from "@prisma/client";
import crypto from "crypto";
import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { revalidatePath } from "next/cache";
import resend from "@/lib/email/client";
import {
  foundingApplicationInvitationEmail,
  foundingApplicationInvitationSubject,
} from "@/lib/email/templates/foundingApplicationInvitation";

const INVITATION_EXPIRY_DAYS = 14;

export type InvitationListFilters = {
  query?: string;
  status?: string;
  page?: number;
};

export async function getFoundingInvitations(
  filters: InvitationListFilters = {},
) {
  await requireAdmin();

  const query = filters.query?.trim().slice(0, 120) ?? "";
  const status = ["PENDING", "ACCEPTED", "REJECTED", "EXPIRED", "REVOKED"].includes(
    filters.status as InvitationStatus,
  )
    ? (filters.status as InvitationStatus)
    : undefined;
  const page = Number.isInteger(filters.page)
    ? Math.max(1, filters.page ?? 1)
    : 1;
  const pageSize = 20;

  const where: Prisma.InvitationTokenWhereInput = {
    type: "FOUNDING_MEMBER",
    ...(status ? { status } : {}),
    ...(query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            {
              djProfile: {
                stageName: { contains: query, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
  };

  const [invitations, total, statusGroups] = await prisma.$transaction([
    prisma.invitationToken.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        djProfile: {
          select: {
            id: true,
            stageName: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
        foundingApplication: {
          select: { id: true, name: true, stageName: true },
        },
      },
    }),
    prisma.invitationToken.count({ where }),
    prisma.invitationToken.groupBy({
      by: ["status"],
      where: { type: "FOUNDING_MEMBER" },
      _count: { id: true },
      orderBy: { status: "asc" },
    }),
  ]);

  const countsByStatus: Record<InvitationStatus, number> = {
    PENDING: 0,
    ACCEPTED: 0,
    REJECTED: 0,
    EXPIRED: 0,
    REVOKED: 0,
  };
  for (const group of statusGroups) {
    countsByStatus[group.status] =
      typeof group._count === "object" && group._count !== null
        ? (group._count.id ?? 0)
        : 0;
  }

  return {
    invitations,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    analytics: {
      total,
      pending: countsByStatus.PENDING,
      accepted: countsByStatus.ACCEPTED,
      expired: countsByStatus.EXPIRED,
      revoked: countsByStatus.REVOKED,
      countsByStatus,
    },
  };
}

export async function revokeInvitation(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const invitationId = Number(formData.get("invitationId"));
  if (!invitationId || isNaN(invitationId)) {
    return actionError("Invalid invitation ID");
  }

  try {
    const result = await prisma.invitationToken.updateMany({
      where: {
        id: invitationId,
        status: "PENDING",
        type: "FOUNDING_MEMBER",
      },
      data: { status: "REVOKED" },
    });

    if (!result.count) {
      return actionError("Invitation not found or not pending");
    }

    await prisma.adminActionLog.create({
      data: {
        adminId,
        action: "REVOKE_INVITATION",
        targetType: "InvitationToken",
        targetId: String(invitationId),
      },
    });

    revalidatePath("/admin/founding/invitations");
    return actionSuccess();
  } catch (error) {
    console.error("Failed to revoke invitation", error);
    return actionError("Failed to revoke invitation");
  }
}

export async function resendInvitation(
  formData: FormData,
): Promise<ActionResult<{ warning?: string }>> {
  const { userId: adminId } = await requireAdmin();

  const invitationId = Number(formData.get("invitationId"));
  if (!invitationId || isNaN(invitationId)) {
    return actionError("Invalid invitation ID");
  }

  try {
    const invitation = await prisma.invitationToken.findFirst({
      where: {
        id: invitationId,
        type: "FOUNDING_MEMBER",
      },
      include: {
        foundingApplication: {
          select: { name: true },
        },
      },
    });

    if (!invitation) {
      return actionError("Invitation not found");
    }

    if (invitation.status !== "PENDING" && invitation.status !== "EXPIRED") {
      return actionError("Only pending or expired invitations can be resent");
    }

    const rawInvitationToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawInvitationToken)
      .digest("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    await prisma.$transaction([
      prisma.invitationToken.updateMany({
        where: { id: invitationId },
        data: { status: "REVOKED" },
      }),
      prisma.invitationToken.create({
        data: {
          tokenHash,
          type: "FOUNDING_MEMBER",
          email: invitation.email,
          foundingApplicationId: invitation.foundingApplicationId,
          expiresAt,
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "RESEND_INVITATION",
          targetType: "InvitationToken",
          targetId: String(invitationId),
        },
      }),
    ]);

    let warning: string | undefined;
    if (invitation.email) {
      try {
        if (!resend) {
          warning =
            "Invitation was regenerated, but email could not be sent (email not configured).";
        } else {
          const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://djcovery.com"}/founding-djs/invitation/${encodeURIComponent(rawInvitationToken)}`;
          const result = await resend.emails.send({
            from: process.env.EMAIL_FROM ?? "noreply@djcovery.com",
            to: invitation.email,
            subject: foundingApplicationInvitationSubject,
            html: foundingApplicationInvitationEmail({
              name: invitation.foundingApplication?.name ?? "there",
              invitationUrl,
              expiresAt,
            }),
          });
          if (result.error) {
            warning =
              "Invitation was regenerated, but the email failed to send.";
          }
        }
      } catch {
        warning = "Invitation was regenerated, but the email failed to send.";
      }
    }

    revalidatePath("/admin/founding/invitations");
    return actionSuccess(warning ? { warning } : {});
  } catch (error) {
    console.error("Failed to resend invitation", error);
    return actionError("Failed to resend invitation");
  }
}

export async function extendInvitation(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const invitationId = Number(formData.get("invitationId"));
  const extraDays = Number(formData.get("days"));
  if (!invitationId || isNaN(invitationId)) {
    return actionError("Invalid invitation ID");
  }
  if (isNaN(extraDays) || extraDays <= 0 || extraDays > 90) {
    return actionError("Extension days must be between 1 and 90");
  }

  try {
    const invitation = await prisma.invitationToken.findFirst({
      where: {
        id: invitationId,
        type: "FOUNDING_MEMBER",
        status: "PENDING",
      },
      select: { id: true, expiresAt: true },
    });

    if (!invitation) {
      return actionError("Invitation not found or not pending");
    }

    const newExpiry = new Date(
      invitation.expiresAt.getTime() + extraDays * 24 * 60 * 60 * 1000,
    );

    await prisma.$transaction([
      prisma.invitationToken.update({
        where: { id: invitationId },
        data: { expiresAt: newExpiry },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "EXTEND_INVITATION",
          targetType: "InvitationToken",
          targetId: String(invitationId),
          metadata: { extraDays, newExpiry: newExpiry.toISOString() },
        },
      }),
    ]);

    revalidatePath("/admin/founding/invitations");
    return actionSuccess();
  } catch (error) {
    console.error("Failed to extend invitation", error);
    return actionError("Failed to extend invitation");
  }
}
