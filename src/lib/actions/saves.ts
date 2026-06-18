"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const SAVES_LIMIT = 50;

// -------------------------------------------------------
// Auth helper
// -------------------------------------------------------

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  return user.id;
}

// -------------------------------------------------------
// SAVED DJs
// -------------------------------------------------------

export async function toggleSaveDj(
  djProfileId: number,
): Promise<{ saved: boolean; error?: string }> {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return { saved: false, error: "Not authenticated." };
  }

  try {
    const existing = await prisma.savedDj.findUnique({
      where: { userId_djProfileId: { userId, djProfileId } },
    });

    if (existing) {
      await prisma.savedDj.delete({
        where: { userId_djProfileId: { userId, djProfileId } },
      });
      revalidatePath("/account");
      return { saved: false };
    }

    const count = await prisma.savedDj.count({ where: { userId } });
    if (count >= SAVES_LIMIT) {
      return {
        saved: false,
        error: `You can save up to ${SAVES_LIMIT} DJs. Remove one to add more.`,
      };
    }

    await prisma.savedDj.create({ data: { userId, djProfileId } });
    revalidatePath("/account");
    return { saved: true };
  } catch {
    return { saved: false, error: "Something went wrong. Please try again." };
  }
}

export async function isSavedDj(djProfileId: number): Promise<boolean> {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return false;
  }

  const existing = await prisma.savedDj.findUnique({
    where: { userId_djProfileId: { userId, djProfileId } },
  });
  return !!existing;
}

export async function getSavedDjIds(): Promise<number[]> {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return [];
  }

  const rows = await prisma.savedDj.findMany({
    where: { userId },
    select: { djProfileId: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => r.djProfileId);
}

export async function getSavedDjs() {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return [];
  }

  const rows = await prisma.savedDj.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      djProfile: {
        select: {
          id: true,
          slug: true,
          stageName: true,
          avatar: true,
          plan: true,
          verified: true,
          city: { select: { name: true } },
          country: { select: { name: true } },
          genres: {
            take: 3,
            select: { genre: { select: { name: true } } },
          },
        },
      },
    },
  });

  return rows.map((r) => ({
    savedAt: r.createdAt,
    ...r.djProfile,
    genres: r.djProfile.genres.map((g) => g.genre.name),
  }));
}

export async function removeSavedDj(
  djProfileId: number,
): Promise<{ error?: string }> {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return { error: "Not authenticated." };
  }

  try {
    await prisma.savedDj.delete({
      where: { userId_djProfileId: { userId, djProfileId } },
    });
    revalidatePath("/account");
    return {};
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

// -------------------------------------------------------
// SAVED EVENTS
// -------------------------------------------------------

export async function toggleSaveEvent(
  eventId: number,
): Promise<{ saved: boolean; error?: string }> {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return { saved: false, error: "Not authenticated." };
  }

  try {
    const existing = await prisma.savedEvent.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existing) {
      await prisma.savedEvent.delete({
        where: { userId_eventId: { userId, eventId } },
      });
      revalidatePath("/account");
      return { saved: false };
    }

    const count = await prisma.savedEvent.count({ where: { userId } });
    if (count >= SAVES_LIMIT) {
      return {
        saved: false,
        error: `You can save up to ${SAVES_LIMIT} events. Remove one to add more.`,
      };
    }

    await prisma.savedEvent.create({ data: { userId, eventId } });
    revalidatePath("/account");
    return { saved: true };
  } catch {
    return { saved: false, error: "Something went wrong. Please try again." };
  }
}

export async function isSavedEvent(eventId: number): Promise<boolean> {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return false;
  }

  const existing = await prisma.savedEvent.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  return !!existing;
}

export async function getSavedEventIds(): Promise<number[]> {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return [];
  }

  const rows = await prisma.savedEvent.findMany({
    where: { userId },
    select: { eventId: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => r.eventId);
}

export async function getSavedEvents() {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return [];
  }

  const rows = await prisma.savedEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      event: {
        select: {
          id: true,
          slug: true,
          title: true,
          posterUrl: true,
          startDate: true,
          category: true,
          eventType: true,
          status: true,
          venue: true,
          city: { select: { name: true } },
          country: { select: { name: true } },
          ownerDj: {
            select: {
              slug: true,
              stageName: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  return rows.map((r) => ({
    savedAt: r.createdAt,
    ...r.event,
  }));
}

export async function removeSavedEvent(
  eventId: number,
): Promise<{ error?: string }> {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return { error: "Not authenticated." };
  }

  try {
    await prisma.savedEvent.delete({
      where: { userId_eventId: { userId, eventId } },
    });
    revalidatePath("/account");
    return {};
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

// -------------------------------------------------------
// MY REVIEWS
// -------------------------------------------------------

export async function getMyReviews() {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return [];
  }

  const rows = await prisma.djRating.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      rating: true,
      review: true,
      createdAt: true,
      updatedAt: true,
      djProfile: {
        select: {
          id: true,
          slug: true,
          stageName: true,
          avatar: true,
          verified: true,
          city: { select: { name: true } },
          country: { select: { name: true } },
        },
      },
    },
  });

  return rows;
}
