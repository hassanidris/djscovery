"use server";

import prisma from "./client";
import { createClient } from "./supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// -------------------------------------------------------
// Auth helper — returns the current Supabase user id
// -------------------------------------------------------
async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User is not authenticated!");

  // Ensure a matching User row exists (webhook may not have run yet)
  const emailPrefix = (user.email ?? user.id)
    .split("@")[0]
    .replace(/[^a-zA-Z0-9_]/g, "_");
  const username = `${emailPrefix}_${user.id.slice(0, 6)}`;
  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email ?? `${user.id}@unknown.local`,
      username,
    },
  });

  return user.id;
}

// -------------------------------------------------------
// FOLLOW
// -------------------------------------------------------

export const switchFollow = async (targetUserId: string) => {
  const currentUserId = await getCurrentUserId();

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
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

// -------------------------------------------------------
// POST LIKES
// -------------------------------------------------------

export const switchLike = async (postId: number) => {
  const userId = await getCurrentUserId();

  try {
    const existingLike = await prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingLike) {
      await prisma.postLike.delete({
        where: { userId_postId: { userId, postId } },
      });
    } else {
      await prisma.postLike.create({ data: { postId, userId } });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong");
  }
};

// -------------------------------------------------------
// POST COMMENTS
// -------------------------------------------------------

export const addPostComment = async (
  postId: number,
  content: string,
  parentId?: number,
) => {
  const userId = await getCurrentUserId();

  try {
    const comment = await prisma.postComment.create({
      data: { content, userId, postId, parentId },
      include: { user: true },
    });
    return comment;
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const deletePostComment = async (commentId: number) => {
  const userId = await getCurrentUserId();

  try {
    await prisma.postComment.update({
      where: { id: commentId, userId },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/");
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

// -------------------------------------------------------
// POSTS (DJ only — enforced in UI; double-checked here)
// -------------------------------------------------------

export const addPost = async (formData: FormData, imageUrl?: string) => {
  const content = formData.get("content") as string;

  const validated = z.string().min(1).max(1000).safeParse(content);
  if (!validated.success) return;

  const userId = await getCurrentUserId();

  try {
    const post = await prisma.post.create({
      data: {
        content: validated.data,
        type: imageUrl ? "IMAGE" : "TEXT",
        userId,
      },
    });

    if (imageUrl) {
      await prisma.media.create({
        data: {
          url: imageUrl,
          bucket: "djscovery-media",
          path: imageUrl,
          type: "IMAGE",
          postId: post.id,
        },
      });
    }

    revalidatePath("/");
  } catch (err) {
    console.log(err);
    throw new Error(`addPost failed: ${err}`);
  }
};

export const deletePost = async (postId: number) => {
  const userId = await getCurrentUserId();

  try {
    await prisma.post.update({
      where: { id: postId, userId },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/");
  } catch (err) {
    console.log(err);
    throw new Error(`deletePost failed: ${err}`);
  }
};

// -------------------------------------------------------
// DJ PROFILE
// -------------------------------------------------------

export const updateDjProfile = async (
  prevState: { success: boolean; error: boolean },
  payload: { formData: FormData; avatar?: string; coverImage?: string },
) => {
  const { formData, avatar, coverImage } = payload;
  const fields = Object.fromEntries(formData);

  const DjProfileSchema = z.object({
    stageName: z.string().min(1).max(60).optional(),
    bio: z.string().max(500).optional(),
    countryId: z.coerce.number().optional(),
    cityId: z.coerce.number().optional(),
  });

  const validated = DjProfileSchema.safeParse(fields);
  if (!validated.success) {
    console.log(validated.error.flatten().fieldErrors);
    return { success: false, error: true };
  }

  const userId = await getCurrentUserId();

  try {
    await prisma.djProfile.update({
      where: { userId },
      data: {
        ...validated.data,
        ...(avatar && { avatar }),
        ...(coverImage && { coverImage }),
      },
    });
    revalidatePath("/profile");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// -------------------------------------------------------
// DJ RATINGS
// -------------------------------------------------------

export const upsertDjRating = async (
  djProfileId: number,
  rating: number,
  review?: string,
) => {
  const userId = await getCurrentUserId();

  try {
    await prisma.djRating.upsert({
      where: { userId_djProfileId: { userId, djProfileId } },
      update: { rating, review },
      create: { userId, djProfileId, rating, review },
    });
    revalidatePath("/");
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

// -------------------------------------------------------
// DJ PROFILE COMMENTS
// -------------------------------------------------------

export const addDjComment = async (
  djProfileId: number,
  content: string,
  parentId?: number,
) => {
  const userId = await getCurrentUserId();

  try {
    const comment = await prisma.djComment.create({
      data: { content, userId, djProfileId, parentId },
      include: { user: true },
    });
    return comment;
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

// -------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------

export const markNotificationRead = async (notificationId: number) => {
  const userId = await getCurrentUserId();

  try {
    await prisma.notification.update({
      where: { id: notificationId, recipientId: userId },
      data: { read: true },
    });
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const markAllNotificationsRead = async () => {
  const userId = await getCurrentUserId();

  try {
    await prisma.notification.updateMany({
      where: { recipientId: userId, read: false },
      data: { read: true },
    });
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};
