"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  HideGigSchema,
  UnhideGigSchema,
  CloseGigSchema,
} from "@/lib/validations/admin";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { error: string };

export async function hideGig(formData: FormData): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = HideGigSchema.safeParse({ gigId: formData.get("gigId") });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { gigId } = parsed.data;

  try {
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      select: { slug: true },
    });
    if (!gig) return { error: "Gig not found" };

    await prisma.$transaction([
      prisma.gig.update({ where: { id: gigId }, data: { hidden: true } }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "HIDE_GIG",
          targetType: "Gig",
          targetId: String(gigId),
        },
      }),
    ]);

    revalidatePath("/admin/gigs");
    revalidatePath(`/gigs/${gig.slug}`);
    revalidatePath("/gigs");
    return { success: true };
  } catch {
    return { error: "Failed to hide gig" };
  }
}

export async function unhideGig(formData: FormData): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = UnhideGigSchema.safeParse({ gigId: formData.get("gigId") });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { gigId } = parsed.data;

  try {
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      select: { slug: true },
    });
    if (!gig) return { error: "Gig not found" };

    await prisma.$transaction([
      prisma.gig.update({ where: { id: gigId }, data: { hidden: false } }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "UNHIDE_GIG",
          targetType: "Gig",
          targetId: String(gigId),
        },
      }),
    ]);

    revalidatePath("/admin/gigs");
    revalidatePath(`/gigs/${gig.slug}`);
    revalidatePath("/gigs");
    return { success: true };
  } catch {
    return { error: "Failed to unhide gig" };
  }
}

export async function closeGig(formData: FormData): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = CloseGigSchema.safeParse({
    gigId: formData.get("gigId"),
    reason: formData.get("reason") ?? undefined,
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { gigId, reason } = parsed.data;

  try {
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      select: { slug: true, organizerProfile: { select: { userId: true } } },
    });
    if (!gig) return { error: "Gig not found" };

    await prisma.$transaction([
      prisma.gig.update({
        where: { id: gigId },
        data: { status: "CANCELLED" },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "CLOSE_GIG",
          targetType: "Gig",
          targetId: String(gigId),
          metadata: reason ? { reason } : undefined,
        },
      }),
    ]);

    revalidatePath("/admin/gigs");
    revalidatePath(`/gigs/${gig.slug}`);
    revalidatePath("/gigs");
    return { success: true };
  } catch {
    return { error: "Failed to close gig" };
  }
}

export type AdminGig = {
  id: number;
  title: string;
  slug: string;
  gigType: string;
  status: string;
  hidden: boolean;
  createdAt: Date;
  eventDate: Date;
  country: { name: string } | null;
  city: { name: string } | null;
  organizerProfile: { displayName: string; slug: string };
  _count: { applications: number };
};

export async function getAdminGigs({
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
}): Promise<{ gigs: AdminGig[]; nextCursor: number | null }> {
  await requireAdmin();

  const gigs = await prisma.gig.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    where: {
      deletedAt: null,
      ...(status
        ? {
            status: status as
              | "DRAFT"
              | "PUBLISHED"
              | "UNDER_REVIEW"
              | "FILLED"
              | "CANCELLED"
              | "EXPIRED",
          }
        : {}),
      ...(type
        ? {
            gigType: type as
              | "CLUB"
              | "FESTIVAL"
              | "WEDDING"
              | "CORPORATE_EVENT"
              | "PRIVATE_PARTY"
              | "BIRTHDAY_PARTY"
              | "LOUNGE"
              | "RESTAURANT"
              | "HOTEL"
              | "BAR"
              | "OTHER",
          }
        : {}),
      ...(country
        ? { country: { name: { contains: country, mode: "insensitive" } } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      gigType: true,
      status: true,
      hidden: true,
      createdAt: true,
      eventDate: true,
      country: { select: { name: true } },
      city: { select: { name: true } },
      organizerProfile: { select: { displayName: true, slug: true } },
      _count: { select: { applications: true } },
    },
  });

  const hasNextPage = gigs.length > take;
  if (hasNextPage) gigs.pop();

  return {
    gigs,
    nextCursor: hasNextPage ? (gigs[gigs.length - 1]?.id ?? null) : null,
  };
}
