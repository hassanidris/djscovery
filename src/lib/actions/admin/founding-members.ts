"use server";

import { FoundingMemberStatus, Prisma } from "@prisma/client";
import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import { revalidatePath } from "next/cache";

export type FoundingMemberListFilters = {
  query?: string;
  status?: string;
  page?: number;
};

export async function getFoundingMembers(
  filters: FoundingMemberListFilters = {},
) {
  await requireAdmin();

  const query = filters.query?.trim().slice(0, 120) ?? "";
  const status = [
    "PENDING_ONBOARDING",
    "ACTIVE",
    "SUSPENDED",
    "REVOKED",
  ].includes(filters.status as FoundingMemberStatus)
    ? (filters.status as FoundingMemberStatus)
    : undefined;
  const page = Number.isInteger(filters.page)
    ? Math.max(1, filters.page ?? 1)
    : 1;
  const pageSize = 20;

  const where: Prisma.FoundingMemberWhereInput = {
    ...(status ? { status } : {}),
    ...(query
      ? {
          djProfile: {
            OR: [
              { stageName: { contains: query, mode: "insensitive" } },
              { user: { name: { contains: query, mode: "insensitive" } } },
              { user: { email: { contains: query, mode: "insensitive" } } },
            ],
          },
        }
      : {}),
  };

  const [members, total, statusGroups] = await prisma.$transaction([
    prisma.foundingMember.findMany({
      where,
      orderBy: [{ joinedAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        djProfile: {
          select: {
            id: true,
            stageName: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            city: {
              select: {
                name: true,
                country: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.foundingMember.count({ where }),
    prisma.foundingMember.groupBy({
      by: ["status"],
      _count: { id: true },
      orderBy: { status: "asc" },
    }),
  ]);

  const countsByStatus: Record<FoundingMemberStatus, number> = {
    PENDING_ONBOARDING: 0,
    ACTIVE: 0,
    SUSPENDED: 0,
    REVOKED: 0,
  };

  for (const group of statusGroups) {
    countsByStatus[group.status] =
      typeof group._count === "object" && group._count !== null
        ? (group._count.id ?? 0)
        : 0;
  }

  return {
    members,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    analytics: {
      total,
      pendingOnboarding: countsByStatus.PENDING_ONBOARDING,
      active: countsByStatus.ACTIVE,
      suspended: countsByStatus.SUSPENDED,
      revoked: countsByStatus.REVOKED,
      countsByStatus,
    },
  };
}

export async function suspendFoundingMember(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const memberId = Number(formData.get("memberId"));
  const reason = formData.get("reason") as string | null;

  if (!memberId || isNaN(memberId)) {
    return actionError("Invalid member ID");
  }

  try {
    await prisma.$transaction([
      prisma.foundingMember.update({
        where: { id: memberId },
        data: {
          status: "SUSPENDED",
          notes: reason || undefined,
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "SUSPEND_FOUNDING_MEMBER",
          targetType: "FoundingMember",
          targetId: String(memberId),
          metadata: reason ? { reason } : undefined,
        },
      }),
    ]);

    revalidatePath("/admin/founding/members");
    return actionSuccess();
  } catch (error) {
    console.error("Failed to suspend founding member", error);
    return actionError("Failed to suspend member");
  }
}

export async function revokeFoundingMember(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const memberId = Number(formData.get("memberId"));
  const reason = formData.get("reason") as string | null;

  if (!memberId || isNaN(memberId)) {
    return actionError("Invalid member ID");
  }

  try {
    await prisma.$transaction([
      prisma.foundingMember.update({
        where: { id: memberId },
        data: {
          status: "REVOKED",
          revokedAt: new Date(),
          revocationReason: reason || undefined,
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "REVOKE_FOUNDING_MEMBER",
          targetType: "FoundingMember",
          targetId: String(memberId),
          metadata: reason ? { reason } : undefined,
        },
      }),
    ]);

    revalidatePath("/admin/founding/members");
    return actionSuccess();
  } catch (error) {
    console.error("Failed to revoke founding member", error);
    return actionError("Failed to revoke member");
  }
}

export async function activateFoundingMember(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const memberId = Number(formData.get("memberId"));

  if (!memberId || isNaN(memberId)) {
    return actionError("Invalid member ID");
  }

  try {
    await prisma.$transaction([
      prisma.foundingMember.update({
        where: { id: memberId },
        data: {
          status: "ACTIVE",
          revokedAt: null,
          revocationReason: null,
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "ACTIVATE_FOUNDING_MEMBER",
          targetType: "FoundingMember",
          targetId: String(memberId),
        },
      }),
    ]);

    revalidatePath("/admin/founding/members");
    return actionSuccess();
  } catch (error) {
    console.error("Failed to activate founding member", error);
    return actionError("Failed to activate member");
  }
}

export async function getFoundingMemberDetail(memberId: number) {
  await requireAdmin();

  if (!memberId || isNaN(memberId)) return null;

  const member = await prisma.foundingMember.findUnique({
    where: { id: memberId },
    include: {
      djProfile: {
        select: {
          id: true,
          stageName: true,
          bio: true,
          plan: true,
          priorityBoost: true,
          homepageFeatured: true,
          homepageFeaturedUntil: true,
          premiumUntil: true,
          monthlyViews: true,
          isFoundingMember: true,
          foundingNumber: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
          city: {
            select: {
              name: true,
              country: {
                select: {
                  name: true,
                },
              },
            },
          },
          genres: {
            include: {
              genre: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!member) return null;

  const actionLogs = await prisma.adminActionLog.findMany({
    where: {
      targetType: "FoundingMember",
      targetId: String(memberId),
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      admin: {
        select: { name: true, email: true },
      },
    },
  });

  return { ...member, actionLogs };
}

export async function updateFoundingMemberRewards(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const memberId = Number(formData.get("memberId"));
  if (!memberId || isNaN(memberId)) {
    return actionError("Invalid member ID");
  }

  const priorityBoost = Number(formData.get("priorityBoost"));
  const homepageFeatured = formData.get("homepageFeatured") === "true";
  const homepageFeaturedDays = Number(formData.get("homepageFeaturedDays"));
  const premiumDays = Number(formData.get("premiumDays"));

  if (isNaN(priorityBoost) || priorityBoost < 0 || priorityBoost > 10) {
    return actionError("Priority boost must be between 0 and 10");
  }

  try {
    const member = await prisma.foundingMember.findUnique({
      where: { id: memberId },
      select: { djProfileId: true },
    });
    if (!member) return actionError("Member not found");

    const now = new Date();
    const homepageFeaturedUntil = homepageFeatured
      ? new Date(
          now.getTime() + (homepageFeaturedDays || 30) * 24 * 60 * 60 * 1000,
        )
      : null;
    const premiumUntil =
      premiumDays > 0
        ? new Date(now.getTime() + premiumDays * 24 * 60 * 60 * 1000)
        : null;

    await prisma.$transaction([
      prisma.djProfile.update({
        where: { id: member.djProfileId },
        data: {
          priorityBoost,
          homepageFeatured,
          homepageFeaturedUntil,
          premiumUntil,
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "UPDATE_FOUNDING_REWARDS",
          targetType: "FoundingMember",
          targetId: String(memberId),
          metadata: {
            priorityBoost,
            homepageFeatured,
            homepageFeaturedDays: homepageFeaturedDays || 30,
            premiumDays: premiumDays || 0,
          },
        },
      }),
    ]);

    revalidatePath("/admin/founding/members");
    revalidatePath(`/admin/founding/members/${memberId}`);
    return actionSuccess();
  } catch (error) {
    console.error("Failed to update founding member rewards", error);
    return actionError("Failed to update rewards");
  }
}

export async function updateFoundingMemberNotes(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const memberId = Number(formData.get("memberId"));
  const notes = formData.get("notes") as string | null;

  if (!memberId || isNaN(memberId)) {
    return actionError("Invalid member ID");
  }

  try {
    await prisma.foundingMember.update({
      where: { id: memberId },
      data: { notes: notes || null },
    });

    revalidatePath(`/admin/founding/members/${memberId}`);
    return actionSuccess();
  } catch (error) {
    console.error("Failed to update founding member notes", error);
    return actionError("Failed to update notes");
  }
}
