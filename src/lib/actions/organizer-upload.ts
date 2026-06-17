"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import {
  BUCKET,
  getPublicMediaUrl,
  validateImageFile,
  buildOrganizerLogoPath,
  buildOrganizerCoverPath,
} from "@/lib/storage";

const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_COVER_BYTES = 10 * 1024 * 1024; // 10 MB

async function uploadOrganizerImage(
  file: File,
  type: "logo" | "cover",
  userId: string,
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = await createClient();

  const maxBytes = type === "logo" ? MAX_LOGO_BYTES : MAX_COVER_BYTES;
  const validationError = validateImageFile(file, maxBytes);
  if (validationError) return validationError;

  const path =
    type === "logo"
      ? buildOrganizerLogoPath(userId, file)
      : buildOrganizerCoverPath(userId, file);

  const { data, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` };
  }

  return { url: getPublicMediaUrl(data.path), path: data.path };
}

export async function uploadOrganizerLogo(
  formData: FormData,
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const profileCheck = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { status: true, deletedAt: true },
  });
  if (
    !profileCheck ||
    profileCheck.status !== "ACTIVE" ||
    profileCheck.deletedAt !== null
  )
    return { error: "Your organizer profile is not active." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };

  const result = await uploadOrganizerImage(file, "logo", user.id);
  if ("error" in result) return result;

  // Persist the URL and Storage path to the organizer profile
  try {
    await prisma.organizerProfile.update({
      where: { userId: user.id },
      data: { logoUrl: result.url, logoPath: result.path },
    });
  } catch (err) {
    console.error("[uploadOrganizerLogo] prisma update failed:", err);
    await supabase.storage.from(BUCKET).remove([result.path]);
    return {
      error: "Image uploaded but failed to save to profile. Please try again.",
    };
  }

  return result;
}

export async function uploadOrganizerCover(
  formData: FormData,
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const profileCheck = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { status: true, deletedAt: true },
  });
  if (
    !profileCheck ||
    profileCheck.status !== "ACTIVE" ||
    profileCheck.deletedAt !== null
  )
    return { error: "Your organizer profile is not active." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };

  const result = await uploadOrganizerImage(file, "cover", user.id);
  if ("error" in result) return result;

  // Persist the URL and Storage path to the organizer profile
  try {
    await prisma.organizerProfile.update({
      where: { userId: user.id },
      data: { coverImageUrl: result.url, coverImagePath: result.path },
    });
  } catch (err) {
    console.error("[uploadOrganizerCover] prisma update failed:", err);
    await supabase.storage.from(BUCKET).remove([result.path]);
    return {
      error: "Image uploaded but failed to save to profile. Please try again.",
    };
  }

  return result;
}

export async function deleteOrganizerImage(
  field: "logoUrl" | "coverImageUrl",
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const pathField = field === "logoUrl" ? "logoPath" : "coverImagePath";

  // Read the stored path from DB — server is the source of truth; also verify active status
  const profile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: {
      logoPath: true,
      coverImagePath: true,
      status: true,
      deletedAt: true,
    },
  });
  if (!profile || profile.status !== "ACTIVE" || profile.deletedAt !== null)
    return { error: "Your organizer profile is not active." };
  const storagePath =
    field === "logoUrl" ? profile.logoPath : profile.coverImagePath;

  if (storagePath) {
    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove([storagePath]);
    if (removeError) {
      return { error: `Failed to delete image: ${removeError.message}` };
    }
  }

  await prisma.organizerProfile.update({
    where: { userId: user.id },
    data: { [field]: null, [pathField]: null },
  });

  return { success: true as const };
}
