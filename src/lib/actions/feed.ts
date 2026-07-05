"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User is not authenticated!");
  return user.id;
}

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

function isSafeUrl(raw: string): boolean {
  try {
    const { protocol } = new URL(raw);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export const addPost = async (formData: FormData, imageUrl?: string) => {
  const content = ((formData.get("content") as string | null) ?? "").trim();
  const rawVideoUrl = (
    (formData.get("videoUrl") as string | null) ?? ""
  ).trim();
  const rawAudioUrl = (
    (formData.get("audioUrl") as string | null) ?? ""
  ).trim();

  const videoUrl = rawVideoUrl && isSafeUrl(rawVideoUrl) ? rawVideoUrl : "";
  const audioUrl = rawAudioUrl && isSafeUrl(rawAudioUrl) ? rawAudioUrl : "";

  const validated = z.string().min(0).max(1000).safeParse(content);
  if (!validated.success) return;
  const hasMedia = !!(imageUrl || videoUrl || audioUrl);
  if (!validated.data && !hasMedia) return;

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

    if (videoUrl) {
      await prisma.media.create({
        data: {
          url: videoUrl,
          bucket: "external",
          path: videoUrl,
          type: "VIDEO",
          postId: post.id,
        },
      });
    }

    if (audioUrl) {
      await prisma.media.create({
        data: {
          url: audioUrl,
          bucket: "external",
          path: audioUrl,
          type: "AUDIO",
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
