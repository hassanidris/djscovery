"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { SuspendUserSchema, ActivateUserSchema } from "@/lib/validations/admin";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email/sendEmail";
import {
  accountSuspendedSubject,
  accountSuspendedHtml,
} from "@/lib/email/templates/accountSuspended";

type ActionResult = { success: true } | { error: string };

export async function suspendUser(formData: FormData): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = SuspendUserSchema.safeParse({
    userId: formData.get("userId"),
    reason: formData.get("reason") ?? undefined,
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { userId, reason } = parsed.data;

  if (userId === adminId)
    return { error: "You cannot suspend your own account" };

  try {
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { status: "SUSPENDED" },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "SUSPEND_USER",
          targetType: "User",
          targetId: userId,
          metadata: reason ? { reason } : undefined,
        },
      }),
    ]);

    if (target) {
      await sendEmail({
        to: target.email,
        userId,
        emailType: "ACCOUNT_SUSPENDED",
        subject: accountSuspendedSubject,
        html: accountSuspendedHtml({ name: target.name ?? "there", reason }),
      });
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { error: "Failed to suspend user" };
  }
}

export async function activateUser(formData: FormData): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = ActivateUserSchema.safeParse({
    userId: formData.get("userId"),
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { userId } = parsed.data;

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { status: "ACTIVE" },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "ACTIVATE_USER",
          targetType: "User",
          targetId: userId,
        },
      }),
    ]);

    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { error: "Failed to activate user" };
  }
}

export type AdminUser = {
  id: string;
  email: string;
  username: string;
  name: string | null;
  image: string | null;
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  country: { name: string } | null;
  roles: { role: string }[];
};

export type DashboardUser = {
  id: string;
  name: string | null;
  email: string;
  roles: string[];
  status: string;
  createdAt: Date;
};

export async function getAdminUsers({
  cursor,
  take = 20,
  role,
  status,
  search,
}: {
  cursor?: string;
  take?: number;
  role?: string;
  status?: string;
  search?: string;
}): Promise<{ users: AdminUser[]; nextCursor: string | null }> {
  await requireAdmin();

  const users = await prisma.user.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    where: {
      deletedAt: null,
      ...(status
        ? { status: status as "ACTIVE" | "SUSPENDED" | "PENDING" | "REJECTED" }
        : {}),
      ...(role === "FAN"
        ? { roles: { some: { role: "FAN" } } }
        : role
          ? {
              roles: {
                some: { role: role as "ADMIN" | "DJ" | "ORGANIZER" | "FAN" },
              },
            }
          : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      image: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      country: { select: { name: true } },
      roles: { select: { role: true } },
    },
  });

  const hasNextPage = users.length > take;
  if (hasNextPage) users.pop();

  return {
    users,
    nextCursor: hasNextPage ? (users[users.length - 1]?.id ?? null) : null,
  };
}

export async function getRecentUsers({
  limit = 5,
}: {
  limit?: number;
} = {}): Promise<DashboardUser[]> {
  await requireAdmin();

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      status: true,
      roles: { select: { role: true } },
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    status: user.status,
    roles: user.roles.map((r) => r.role),
  }));
}
