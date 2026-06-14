"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";

// All organizer images live in the shared djscovery-media bucket under these folder prefixes
const BUCKET = "djscovery-media";
const FOLDERS = {
  avatar: "org-avatar",
  cover: "org-cover",
} as const;

type FolderKey = keyof typeof FOLDERS;

const MAX_SIZE: Record<FolderKey, number> = {
  avatar: 5 * 1024 * 1024, // 5 MB
  cover: 10 * 1024 * 1024, // 10 MB
};

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

async function uploadOrganizerImage(
  file: File,
  folderKey: FolderKey,
  userId: string,
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = await createClient();

  if (!ALLOWED_MIME.includes(file.type)) {
    return { error: "Only JPEG, PNG, and WebP images are allowed." };
  }
  if (file.size > MAX_SIZE[folderKey]) {
    const maxMB = MAX_SIZE[folderKey] / (1024 * 1024);
    return { error: `Image must be under ${maxMB} MB.` };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  // Path: org-avatar/{userId}/{timestamp}.{ext}  (mirrors dj-avatars/{userId}/...)
  const path = `${FOLDERS[folderKey]}/${userId}/${Date.now()}.${ext}`;

  const { data, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

  return { url: publicUrl, path: data.path };
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

  const result = await uploadOrganizerImage(file, "avatar", user.id);
  if ("error" in result) return result;

  // Persist the URL and Storage path to the organizer profile
  try {
    await prisma.organizerProfile.update({
      where: { userId: user.id },
      data: { logoUrl: result.url, logoPath: result.path },
    });
  } catch (err) {
    console.error("[uploadOrganizerLogo] prisma update failed:", err);
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

  // Best-effort storage delete — DB is always updated regardless
  if (storagePath) {
    try {
      await supabase.storage.from(BUCKET).remove([storagePath]);
    } catch {
      // continue
    }
  }

  await prisma.organizerProfile.update({
    where: { userId: user.id },
    data: { [field]: null, [pathField]: null },
  });

  return { success: true as const };
}
