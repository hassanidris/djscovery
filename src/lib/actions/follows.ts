"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email/send";
import type { DjFollowData } from "@/lib/email/types";
import { cacheGet, cacheSet, cacheDelete } from "@/lib/cache";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://djscovery.com";
const FOLLOWS_LIMIT = 200;
const SAVES_LIMIT = 50;
const SAVED_EVENTS_TTL = 300;

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
// FOLLOWED DJs
// -------------------------------------------------------

export async function toggleFollowDj(
  djProfileId: number,
): Promise<{ following: boolean; error?: string }> {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return { following: false, error: "Not authenticated." };
  }

  try {
    const existing = await prisma.djFollow.findUnique({
      where: { userId_djProfileId: { userId, djProfileId } },
    });

    if (existing) {
      await prisma.djFollow.delete({
        where: { userId_djProfileId: { userId, djProfileId } },
      });
      revalidatePath("/organizer/followed-djs");
      revalidatePath("/account/followed-djs");
      revalidatePath("/fan/followed-djs");
      return { following: false };
    }

    const count = await prisma.djFollow.count({ where: { userId } });
    if (count >= FOLLOWS_LIMIT) {
      return {
        following: false,
        error: `You can follow up to ${FOLLOWS_LIMIT} DJs.`,
      };
    }

    await prisma.djFollow.create({ data: { userId, djProfileId } });
    revalidatePath("/organizer/followed-djs");
    revalidatePath("/account/followed-djs");
    revalidatePath("/fan/followed-djs");

    // Send email notification to DJ
    try {
      const [djProfile, user] = await Promise.all([
        prisma.djProfile.findUnique({
          where: { id: djProfileId },
          select: { stageName: true, slug: true },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true },
        }),
      ]);

      if (djProfile && user?.email) {
        const djUser = await prisma.user.findUnique({
          where: {
            id:
              (
                await prisma.djProfile.findUnique({
                  where: { id: djProfileId },
                  select: { userId: true },
                })
              )?.userId || "",
          },
          select: { email: true },
        });

        if (djUser?.email) {
          const emailData: DjFollowData = {
            djName: djProfile.stageName,
            followerName: user.name || "Someone",
            followerProfileUrl: `${SITE_URL}/account`,
          };
          await sendEmail(djUser.email, "DJ_FOLLOW", emailData);
        }
      }
    } catch (emailError) {
      console.error("Failed to send follow email:", emailError);
    }

    return { following: true };
  } catch {
    return {
      following: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function isFollowingDj(djProfileId: number): Promise<boolean> {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return false;
  }

  const existing = await prisma.djFollow.findUnique({
    where: { userId_djProfileId: { userId, djProfileId } },
  });
  return !!existing;
}

export async function getFollowedDjIds(): Promise<number[]> {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return [];
  }

  const rows = await prisma.djFollow.findMany({
    where: { userId },
    select: { djProfileId: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => r.djProfileId);
}

export async function getFollowedDjs() {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return [];
  }

  const rows = await prisma.djFollow.findMany({
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
          status: true,
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
    followedAt: r.createdAt,
    ...r.djProfile,
    genres: r.djProfile.genres.map((g) => g.genre.name),
  }));
}

export async function unfollowDj(
  djProfileId: number,
): Promise<{ error?: string }> {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return { error: "Not authenticated." };
  }

  try {
    await prisma.djFollow.delete({
      where: { userId_djProfileId: { userId, djProfileId } },
    });
    revalidatePath("/organizer/followed-djs");
    revalidatePath("/account/followed-djs");
    revalidatePath("/fan/followed-djs");
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
      revalidatePath("/events");
      revalidatePath("/account");
      revalidatePath("/organizer/saved-events");
      revalidatePath("/fan/saved-events");
      await cacheDelete(`saved_events:user:${userId}`).catch(() => {});
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
    revalidatePath("/events");
    revalidatePath("/account");
    revalidatePath("/organizer/saved-events");
    revalidatePath("/fan/saved-events");
    await cacheDelete(`saved_events:user:${userId}`).catch(() => {});
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

  const cacheKey = `saved_events:user:${userId}`;
  const cached = await cacheGet<number[]>(cacheKey);
  if (cached) return cached;

  const rows = await prisma.savedEvent.findMany({
    where: { userId },
    select: { eventId: true },
    orderBy: { createdAt: "desc" },
  });
  const result = rows.map((r) => r.eventId);

  await cacheSet(cacheKey, result, SAVED_EVENTS_TTL);
  return result;
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
    revalidatePath("/organizer/saved-events");
    revalidatePath("/fan/saved-events");
    await cacheDelete(`saved_events:user:${userId}`).catch(() => {});
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
          status: true,
          city: { select: { name: true } },
          country: { select: { name: true } },
        },
      },
    },
  });

  return rows;
}
