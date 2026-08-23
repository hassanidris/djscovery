"use server";

import prisma from "@/lib/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { cacheDelete } from "@/lib/cache";

export async function getAdminVenues({
  cursor,
  country,
}: {
  cursor?: number;
  country?: string;
}) {
  await requireAdmin();

  const take = 50;
  const where: any = {};

  if (country) {
    where.country = {
      name: { contains: country, mode: "insensitive" },
    };
  }

  const venues = await prisma.djVenue.findMany({
    where,
    take,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      city: true,
      country: true,
      djProfile: {
        select: {
          id: true,
          stageName: true,
          slug: true,
        },
      },
    },
  });

  const nextCursor =
    venues.length === take ? venues[venues.length - 1].id : undefined;

  return { venues, nextCursor };
}

type ActionResult = { success: true } | { error: string };

export async function deleteVenue(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const venueId = Number(formData.get("venueId"));

  if (!venueId) {
    return { error: "Venue ID is required" };
  }

  try {
    const venue = await prisma.djVenue.findUnique({
      where: { id: venueId },
      select: { djProfile: { select: { slug: true } } },
    });

    await prisma.djVenue.delete({
      where: { id: venueId },
    });

    revalidatePath("/admin/venues");
    if (venue?.djProfile?.slug) {
      revalidatePath(`/djs/${venue.djProfile.slug}`);
      await cacheDelete(`dj_venues:${venue.djProfile.slug}`).catch(() => {});
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting venue:", error);
    return { error: "Failed to delete venue" };
  }
}
