"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import {
  BUCKET,
  getPublicMediaUrl,
  validateImageFile,
  buildDjAvatarPath,
  buildDjCoverPath,
  buildDjGalleryPath,
} from "@/lib/storage";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_COVER_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_GALLERY_BYTES = 10 * 1024 * 1024; // 10 MB

// ── uploadDjAvatar ────────────────────────────────────────────────────────────
// Validates, uploads to djs/{userId}/avatar/, persists to DjProfile.avatar
// + DjProfile.avatarPath, and deletes the previous file from storage.

export async function uploadDjAvatar(
  formData: FormData,
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };

  const validationError = validateImageFile(file, MAX_AVATAR_BYTES);
  if (validationError) return validationError;

  const profile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, avatarPath: true },
  });
  if (!profile) return { error: "DJ profile not found." };

  const path = buildDjAvatarPath(user.id, file);

  const { data, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  const url = getPublicMediaUrl(data.path);

  try {
    await prisma.djProfile.update({
      where: { userId: user.id },
      data: { avatar: url, avatarPath: data.path },
    });
  } catch {
    await supabase.storage.from(BUCKET).remove([data.path]);
    return { error: "Image uploaded but failed to save. Please try again." };
  }

  if (profile.avatarPath && profile.avatarPath !== data.path) {
    await supabase.storage
      .from(BUCKET)
      .remove([profile.avatarPath])
      .catch(() => {});
  }

  return { url, path: data.path };
}

// ── uploadDjCover ─────────────────────────────────────────────────────────────
// Validates, uploads to djs/{userId}/cover/, persists to DjProfile.coverImage
// + DjProfile.coverImagePath, and deletes the previous file from storage.

export async function uploadDjCover(
  formData: FormData,
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };

  const validationError = validateImageFile(file, MAX_COVER_BYTES);
  if (validationError) return validationError;

  const profile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, coverImagePath: true },
  });
  if (!profile) return { error: "DJ profile not found." };

  const path = buildDjCoverPath(user.id, file);

  const { data, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  const url = getPublicMediaUrl(data.path);

  try {
    await prisma.djProfile.update({
      where: { userId: user.id },
      data: { coverImage: url, coverImagePath: data.path },
    });
  } catch {
    await supabase.storage.from(BUCKET).remove([data.path]);
    return { error: "Image uploaded but failed to save. Please try again." };
  }

  if (profile.coverImagePath && profile.coverImagePath !== data.path) {
    await supabase.storage
      .from(BUCKET)
      .remove([profile.coverImagePath])
      .catch(() => {});
  }

  return { url, path: data.path };
}

// ── uploadDjGalleryImage ──────────────────────────────────────────────────────
// Validates, uploads to djs/{userId}/gallery/, and creates a Media record.

export async function uploadDjGalleryImage(formData: FormData): Promise<
  | { id: number; url: string; path: string; bucket: string }
  | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };

  const validationError = validateImageFile(file, MAX_GALLERY_BYTES);
  if (validationError) return validationError;

  const profile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) return { error: "DJ profile not found." };

  const path = buildDjGalleryPath(user.id, file);

  const { data, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  const url = getPublicMediaUrl(data.path);

  try {
    const media = await prisma.media.create({
      data: {
        type: "IMAGE",
        url,
        path: data.path,
        bucket: BUCKET,
        djProfileId: profile.id,
      },
    });
    return {
      id: media.id,
      url: media.url,
      path: media.path,
      bucket: media.bucket,
    };
  } catch {
    await supabase.storage.from(BUCKET).remove([data.path]);
    return { error: "Image uploaded but failed to save. Please try again." };
  }
}

// ── deleteGalleryImage ────────────────────────────────────────────────────────
// Removes a gallery Media record from the DB and its file from storage.
// Storage deletion is best-effort; the DB record is always removed.

export async function deleteGalleryImage(
  mediaId: number,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    include: { djProfile: { select: { userId: true } } },
  });
  if (!media) return { error: "Image not found" };
  if (media.djProfile?.userId !== user.id) return { error: "Unauthorized" };

  if (media.bucket !== "external") {
    await supabase.storage
      .from(media.bucket)
      .remove([media.path])
      .catch(() => {});
  }

  await prisma.media.delete({ where: { id: mediaId } });
  return { success: true as const };
}

// ── uploadDjMediaTemp ─────────────────────────────────────────────────────────
// Used by BecomeDjForm during initial profile creation (before the DJ profile
// exists in the DB). Validates, uploads, and returns the storage result without
// writing to the database. The caller (BecomeDjForm) is responsible for cleanup
// on error using the returned path.

export async function uploadDjMediaTemp(
  formData: FormData,
  type: "avatar" | "gallery",
): Promise<{ url: string; path: string; bucket: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };

  const maxBytes = type === "avatar" ? MAX_AVATAR_BYTES : MAX_GALLERY_BYTES;
  const validationError = validateImageFile(file, maxBytes);
  if (validationError) return validationError;

  const path =
    type === "avatar"
      ? buildDjAvatarPath(user.id, file)
      : buildDjGalleryPath(user.id, file);

  const { data, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  return {
    url: getPublicMediaUrl(data.path),
    path: data.path,
    bucket: BUCKET,
  };
}
