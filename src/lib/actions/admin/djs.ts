"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  ApproveDjSchema,
  RejectDjSchema,
  HideDjSchema,
  UnhideDjSchema,
  SuspendDjAccountSchema,
} from "@/lib/validations/admin";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email/sendEmail";
import {
  profileApprovedSubject,
  profileApprovedHtml,
} from "@/lib/email/templates/profileApproved";
import {
  profileRejectedSubject,
  profileRejectedHtml,
} from "@/lib/email/templates/profileRejected";
import {
  accountSuspendedSubject,
  accountSuspendedHtml,
} from "@/lib/email/templates/accountSuspended";

type ActionResult = { success: true } | { error: string };

export async function approveDjProfile(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = ApproveDjSchema.safeParse({
    djProfileId: formData.get("djProfileId"),
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { djProfileId } = parsed.data;

  try {
    const profile = await prisma.djProfile.findUnique({
      where: { id: djProfileId },
      select: {
        userId: true,
        slug: true,
        stageName: true,
        user: { select: { email: true, name: true } },
      },
    });
    if (!profile) return { error: "DJ profile not found" };

    await prisma.$transaction([
      prisma.djProfile.update({
        where: { id: djProfileId },
        data: { status: "APPROVED" },
      }),
      prisma.notification.create({
        data: {
          type: "PROFILE_APPROVED",
          recipientId: profile.userId,
          data: { djProfileId },
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "APPROVE_DJ",
          targetType: "DjProfile",
          targetId: String(djProfileId),
        },
      }),
    ]);

    await sendEmail({
      to: profile.user.email,
      userId: profile.userId,
      emailType: "PROFILE_APPROVED",
      subject: profileApprovedSubject,
      html: profileApprovedHtml({
        name: profile.user.name ?? profile.stageName,
      }),
    });

    revalidatePath("/admin/djs");
    revalidatePath(`/djs/${profile.slug}`);
    revalidatePath("/directory");
    return { success: true };
  } catch {
    return { error: "Failed to approve DJ profile" };
  }
}

export async function rejectDjProfile(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = RejectDjSchema.safeParse({
    djProfileId: formData.get("djProfileId"),
    reason: formData.get("reason") ?? undefined,
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { djProfileId, reason } = parsed.data;

  try {
    const profile = await prisma.djProfile.findUnique({
      where: { id: djProfileId },
      select: {
        userId: true,
        stageName: true,
        user: { select: { email: true, name: true } },
      },
    });
    if (!profile) return { error: "DJ profile not found" };

    await prisma.$transaction([
      prisma.djProfile.update({
        where: { id: djProfileId },
        data: { status: "REJECTED" },
      }),
      prisma.notification.create({
        data: {
          type: "PROFILE_REJECTED",
          recipientId: profile.userId,
          data: { djProfileId, reason: reason ?? null },
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "REJECT_DJ",
          targetType: "DjProfile",
          targetId: String(djProfileId),
          metadata: reason ? { reason } : undefined,
        },
      }),
    ]);

    await sendEmail({
      to: profile.user.email,
      userId: profile.userId,
      emailType: "PROFILE_REJECTED",
      subject: profileRejectedSubject,
      html: profileRejectedHtml({
        name: profile.user.name ?? profile.stageName,
        reason,
      }),
    });

    revalidatePath("/admin/djs");
    return { success: true };
  } catch {
    return { error: "Failed to reject DJ profile" };
  }
}

export async function hideDjProfile(formData: FormData): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = HideDjSchema.safeParse({
    djProfileId: formData.get("djProfileId"),
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { djProfileId } = parsed.data;

  try {
    const profile = await prisma.djProfile.findUnique({
      where: { id: djProfileId },
      select: { slug: true },
    });
    if (!profile) return { error: "DJ profile not found" };

    await prisma.$transaction([
      prisma.djProfile.update({
        where: { id: djProfileId },
        data: { hidden: true },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "HIDE_DJ",
          targetType: "DjProfile",
          targetId: String(djProfileId),
        },
      }),
    ]);

    revalidatePath("/admin/djs");
    revalidatePath(`/djs/${profile.slug}`);
    revalidatePath("/directory");
    return { success: true };
  } catch {
    return { error: "Failed to hide DJ profile" };
  }
}

export async function unhideDjProfile(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = UnhideDjSchema.safeParse({
    djProfileId: formData.get("djProfileId"),
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { djProfileId } = parsed.data;

  try {
    const profile = await prisma.djProfile.findUnique({
      where: { id: djProfileId },
      select: { slug: true },
    });
    if (!profile) return { error: "DJ profile not found" };

    await prisma.$transaction([
      prisma.djProfile.update({
        where: { id: djProfileId },
        data: { hidden: false },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "UNHIDE_DJ",
          targetType: "DjProfile",
          targetId: String(djProfileId),
        },
      }),
    ]);

    revalidatePath("/admin/djs");
    revalidatePath(`/djs/${profile.slug}`);
    revalidatePath("/directory");
    return { success: true };
  } catch {
    return { error: "Failed to unhide DJ profile" };
  }
}

export async function suspendDjAccount(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = SuspendDjAccountSchema.safeParse({
    djProfileId: formData.get("djProfileId"),
    reason: formData.get("reason") ?? undefined,
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { djProfileId, reason } = parsed.data;

  try {
    const profile = await prisma.djProfile.findUnique({
      where: { id: djProfileId },
      select: {
        userId: true,
        user: { select: { email: true, name: true } },
      },
    });
    if (!profile) return { error: "DJ profile not found" };

    if (profile.userId === adminId)
      return { error: "You cannot suspend your own account" };

    await prisma.$transaction([
      prisma.user.update({
        where: { id: profile.userId },
        data: { status: "SUSPENDED" },
      }),
      prisma.notification.create({
        data: {
          type: "ACCOUNT_SUSPENDED",
          recipientId: profile.userId,
          data: { reason: reason ?? null },
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "SUSPEND_DJ_ACCOUNT",
          targetType: "DjProfile",
          targetId: String(djProfileId),
          metadata: reason ? { reason } : undefined,
        },
      }),
    ]);

    await sendEmail({
      to: profile.user.email,
      userId: profile.userId,
      emailType: "ACCOUNT_SUSPENDED",
      subject: accountSuspendedSubject,
      html: accountSuspendedHtml({
        name: profile.user.name ?? "there",
        reason,
      }),
    });

    revalidatePath("/admin/djs");
    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { error: "Failed to suspend DJ account" };
  }
}

export type AdminDj = {
  id: number;
  stageName: string;
  slug: string;
  avatar: string | null;
  status: string;
  hidden: boolean;
  createdAt: Date;
  country: { name: string } | null;
  city: { name: string } | null;
  genres: { genre: { name: string } }[];
  _avg: { rating: number | null } | null;
  user: { status: string };
};

export async function getAdminDjs({
  cursor,
  take = 20,
  status,
  country,
}: {
  cursor?: number;
  take?: number;
  status?: string;
  country?: string;
}): Promise<{ djs: AdminDj[]; nextCursor: number | null }> {
  await requireAdmin();

  const djs = await prisma.djProfile.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    where: {
      deletedAt: null,
      ...(status
        ? {
            status: status as "PENDING_APPROVAL" | "APPROVED" | "REJECTED",
          }
        : {}),
      ...(country
        ? { country: { name: { contains: country, mode: "insensitive" } } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      stageName: true,
      slug: true,
      avatar: true,
      status: true,
      hidden: true,
      createdAt: true,
      country: { select: { name: true } },
      city: { select: { name: true } },
      genres: { select: { genre: { select: { name: true } } } },
      user: { select: { status: true } },
      _count: { select: { ratings: true } },
    },
  });

  const hasNextPage = djs.length > take;
  if (hasNextPage) djs.pop();

  const djsWithAvg = await Promise.all(
    djs.map(async (dj) => {
      const avg = await prisma.djRating.aggregate({
        where: { djProfileId: dj.id },
        _avg: { rating: true },
      });
      return { ...dj, _avg: avg._avg };
    }),
  );

  return {
    djs: djsWithAvg,
    nextCursor: hasNextPage ? (djs[djs.length - 1]?.id ?? null) : null,
  };
}
