"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ActionResult, actionError, actionSuccess } from "./action-result";

async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User is not authenticated!");
  return user.id;
}

export const switchLike = async (postId: number): Promise<ActionResult> => {
  let userId: string;
  try {
    userId = await getCurrentUserId();
  } catch {
    return actionError("User is not authenticated!");
  }

  try {
    await prisma.$transaction(async (tx) => {
      const { count } = await tx.postLike.deleteMany({
        where: { userId, postId },
      });

      if (count === 0) {
        await tx.postLike.create({ data: { postId, userId } });
      }
    });
    return actionSuccess();
  } catch (err) {
    if (err instanceof Error && err.message.includes("P2002")) {
      // Another request created the like between deleteMany and create;
      // treat as a successful toggle by deleting it now.
      await prisma.postLike.deleteMany({
        where: { userId, postId },
      });
      return actionSuccess();
    }

    return actionError("Something went wrong");
  }
};

export const addPostComment = async (
  postId: number,
  content: string,
  parentId?: number,
): Promise<ActionResult<any>> => {
  let userId: string;
  try {
    userId = await getCurrentUserId();
  } catch {
    return actionError("User is not authenticated!");
  }

  try {
    const comment = await prisma.postComment.create({
      data: { content, userId, postId, parentId },
      include: { user: true },
    });
    return actionSuccess(comment);
  } catch (err) {
    return actionError("Something went wrong!");
  }
};

export const deletePostComment = async (
  commentId: number,
): Promise<ActionResult> => {
  let userId: string;
  try {
    userId = await getCurrentUserId();
  } catch {
    return actionError("User is not authenticated!");
  }

  try {
    await prisma.postComment.update({
      where: { id: commentId, userId },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/");
    return actionSuccess();
  } catch (err) {
    return actionError("Something went wrong!");
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

export const addPost = async (
  formData: FormData,
  imageUrl?: string,
): Promise<ActionResult<any>> => {
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
  if (!validated.success) {
    return actionError("Post text must be 1000 characters or fewer.");
  }
  const hasMedia = !!(imageUrl || videoUrl || audioUrl);
  if (!validated.data && !hasMedia) {
    return actionError("Post must include text or media.");
  }

  let userId: string;
  try {
    userId = await getCurrentUserId();
  } catch {
    return actionError("User is not authenticated!");
  }

  try {
    const post = await prisma.$transaction(async (tx) => {
      const created = await tx.post.create({
        data: {
          content: validated.data,
          type: imageUrl ? "IMAGE" : "TEXT",
          userId,
        },
      });

      if (imageUrl) {
        await tx.media.create({
          data: {
            url: imageUrl,
            bucket: "djscovery-media",
            path: imageUrl,
            type: "IMAGE",
            postId: created.id,
          },
        });
      }

      if (videoUrl) {
        await tx.media.create({
          data: {
            url: videoUrl,
            bucket: "external",
            path: videoUrl,
            type: "VIDEO",
            postId: created.id,
          },
        });
      }

      if (audioUrl) {
        await tx.media.create({
          data: {
            url: audioUrl,
            bucket: "external",
            path: audioUrl,
            type: "AUDIO",
            postId: created.id,
          },
        });
      }

      return created;
    });

    revalidatePath("/");
    return actionSuccess(post);
  } catch (err) {
    return actionError("Failed to create post");
  }
};

export const deletePost = async (postId: number): Promise<ActionResult> => {
  let userId: string;
  try {
    userId = await getCurrentUserId();
  } catch {
    return actionError("User is not authenticated!");
  }

  try {
    await prisma.post.update({
      where: { id: postId, userId },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/");
    return actionSuccess();
  } catch (err) {
    return actionError("Failed to delete post");
  }
};
