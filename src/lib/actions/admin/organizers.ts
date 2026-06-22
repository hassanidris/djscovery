"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  HideOrganizerSchema,
  UnhideOrganizerSchema,
  SuspendOrganizerSchema,
} from "@/lib/validations/admin";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { error: string };

export async function hideOrganizerProfile(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = HideOrganizerSchema.safeParse({
    organizerProfileId: formData.get("organizerProfileId"),
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { organizerProfileId } = parsed.data;

  try {
    const profile = await prisma.organizerProfile.findUnique({
      where: { id: organizerProfileId },
      select: { slug: true },
    });
    if (!profile) return { error: "Organizer profile not found" };

    await prisma.$transaction([
      prisma.organizerProfile.update({
        where: { id: organizerProfileId },
        data: { hidden: true },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "HIDE_ORGANIZER",
          targetType: "OrganizerProfile",
          targetId: String(organizerProfileId),
        },
      }),
    ]);

    revalidatePath("/admin/organizers");
    revalidatePath(`/organizers/${profile.slug}`);
    return { success: true };
  } catch {
    return { error: "Failed to hide organizer profile" };
  }
}

export async function unhideOrganizerProfile(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = UnhideOrganizerSchema.safeParse({
    organizerProfileId: formData.get("organizerProfileId"),
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { organizerProfileId } = parsed.data;

  try {
    const profile = await prisma.organizerProfile.findUnique({
      where: { id: organizerProfileId },
      select: { slug: true },
    });
    if (!profile) return { error: "Organizer profile not found" };

    await prisma.$transaction([
      prisma.organizerProfile.update({
        where: { id: organizerProfileId },
        data: { hidden: false },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "UNHIDE_ORGANIZER",
          targetType: "OrganizerProfile",
          targetId: String(organizerProfileId),
        },
      }),
    ]);

    revalidatePath("/admin/organizers");
    revalidatePath(`/organizers/${profile.slug}`);
    return { success: true };
  } catch {
    return { error: "Failed to unhide organizer profile" };
  }
}

export async function suspendOrganizer(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = SuspendOrganizerSchema.safeParse({
    organizerProfileId: formData.get("organizerProfileId"),
    reason: formData.get("reason") ?? undefined,
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { organizerProfileId, reason } = parsed.data;

  try {
    const profile = await prisma.organizerProfile.findUnique({
      where: { id: organizerProfileId },
      select: { userId: true, slug: true },
    });
    if (!profile) return { error: "Organizer profile not found" };

    if (profile.userId === adminId)
      return { error: "You cannot suspend your own account" };

    await prisma.$transaction([
      prisma.organizerProfile.update({
        where: { id: organizerProfileId },
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
          action: "SUSPEND_ORGANIZER",
          targetType: "OrganizerProfile",
          targetId: String(organizerProfileId),
          metadata: reason ? { reason } : undefined,
        },
      }),
    ]);

    revalidatePath("/admin/organizers");
    revalidatePath(`/organizers/${profile.slug}`);
    return { success: true };
  } catch {
    return { error: "Failed to suspend organizer" };
  }
}

export type AdminOrganizer = {
  id: number;
  displayName: string;
  slug: string;
  logoUrl: string | null;
  organizerType: string;
  status: string;
  hidden: boolean;
  createdAt: Date;
  country: { name: string } | null;
  city: { name: string } | null;
  _count: { gigs: number };
};

export async function getAdminOrganizers({
  cursor,
  take = 20,
  type,
  status,
  country,
}: {
  cursor?: number;
  take?: number;
  type?: string;
  status?: string;
  country?: string;
}): Promise<{ organizers: AdminOrganizer[]; nextCursor: number | null }> {
  await requireAdmin();

  const organizers = await prisma.organizerProfile.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    where: {
      deletedAt: null,
      ...(status
        ? { status: status as "PENDING" | "ACTIVE" | "SUSPENDED" }
        : {}),
      ...(type
        ? {
            organizerType: type as
              | "INDIVIDUAL"
              | "COMPANY"
              | "VENUE"
              | "AGENCY"
              | "FESTIVAL",
          }
        : {}),
      ...(country
        ? { country: { name: { contains: country, mode: "insensitive" } } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      displayName: true,
      slug: true,
      logoUrl: true,
      organizerType: true,
      status: true,
      hidden: true,
      createdAt: true,
      country: { select: { name: true } },
      city: { select: { name: true } },
      _count: { select: { gigs: true } },
    },
  });

  const hasNextPage = organizers.length > take;
  if (hasNextPage) organizers.pop();

  return {
    organizers,
    nextCursor: hasNextPage
      ? (organizers[organizers.length - 1]?.id ?? null)
      : null,
  };
}
