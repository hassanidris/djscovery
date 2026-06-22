"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { SuspendUserSchema, ActivateUserSchema } from "@/lib/validations/admin";
import { revalidatePath } from "next/cache";

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

  if (userId === adminId) return { error: "You cannot suspend your own account" };

  try {
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
      ...(status ? { status: status as "ACTIVE" | "SUSPENDED" | "PENDING" | "REJECTED" } : {}),
      ...(role
        ? { roles: { some: { role: role as "ADMIN" | "DJ" | "ORGANIZER" } } }
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
