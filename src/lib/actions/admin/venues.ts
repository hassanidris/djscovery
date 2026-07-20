"use server";

import prisma from "@/lib/client";
import { revalidatePath } from "next/cache";

export async function getAdminVenues({
  cursor,
  country,
  source,
}: {
  cursor?: number;
  country?: string;
  source?: string;
}) {
  const take = 50;
  const where: any = {};

  if (country) {
    where.country = {
      name: { contains: country, mode: "insensitive" },
    };
  }

  if (source) {
    where.source = source;
  }

  const venues = await prisma.venue.findMany({
    where,
    take,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { popularity: "desc" },
    include: {
      city: true,
      country: true,
    },
  });

  const nextCursor =
    venues.length === take ? venues[venues.length - 1].id : undefined;

  return { venues, nextCursor };
}

type ActionResult = { success: true } | { error: string };

export async function deleteVenue(formData: FormData): Promise<ActionResult> {
  const venueId = Number(formData.get("venueId"));

  if (!venueId) {
    return { error: "Venue ID is required" };
  }

  try {
    await prisma.venue.delete({
      where: { id: venueId },
    });

    revalidatePath("/admin/venues");
    return { success: true };
  } catch (error) {
    console.error("Error deleting venue:", error);
    return { error: "Failed to delete venue" };
  }
}
