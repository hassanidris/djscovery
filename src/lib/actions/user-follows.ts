"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";

// -------------------------------------------------------
// Auth helper
// -------------------------------------------------------

async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User is not authenticated!");
  return user.id;
}

// -------------------------------------------------------
// USER-TO-USER FOLLOW
// -------------------------------------------------------

export const isFollowing = async (targetUserId: string): Promise<boolean> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const existing = await prisma.follower.findUnique({
    where: {
      followerId_followingId: {
        followerId: user.id,
        followingId: targetUserId,
      },
    },
  });
  return !!existing;
};

export const switchFollow = async (
  targetUserId: string,
): Promise<{ errorCode: "UNAUTHENTICATED" | "UNKNOWN" } | undefined> => {
  let currentUserId: string;
  try {
    currentUserId = await getCurrentUserId();
  } catch {
    return { errorCode: "UNAUTHENTICATED" };
  }

  try {
    const existingFollow = await prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      await prisma.follower.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      await prisma.follower.create({
        data: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      });
    }
  } catch (err) {
    console.error(err);
    return { errorCode: "UNKNOWN" };
  }
};
