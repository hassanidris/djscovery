"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";

// Supabase Storage bucket names for organizer images
const BUCKETS = {
  avatar: "org-avatar",
  cover: "org-cover",
} as const;

type BucketKey = keyof typeof BUCKETS;

const MAX_SIZE: Record<BucketKey, number> = {
  avatar: 5 * 1024 * 1024, // 5 MB
  cover: 10 * 1024 * 1024, // 10 MB
};

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

async function uploadOrganizerImage(
  file: File,
  bucketKey: BucketKey,
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!ALLOWED_MIME.includes(file.type)) {
    return { error: "Only JPEG, PNG, and WebP images are allowed." };
  }
  if (file.size > MAX_SIZE[bucketKey]) {
    const maxMB = MAX_SIZE[bucketKey] / (1024 * 1024);
    return { error: `Image must be under ${maxMB} MB.` };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;
  const bucket = BUCKETS[bucketKey];

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { error: "Upload failed. Please try again." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return { url: publicUrl, path };
}

export async function uploadOrganizerLogo(
  formData: FormData,
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };

  const result = await uploadOrganizerImage(file, "avatar");
  if ("error" in result) return result;

  // Persist the URL to the organizer profile
  await prisma.organizerProfile.update({
    where: { userId: user.id },
    data: { logoUrl: result.url },
  });

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

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };

  const result = await uploadOrganizerImage(file, "cover");
  if ("error" in result) return result;

  // Persist the URL to the organizer profile
  await prisma.organizerProfile.update({
    where: { userId: user.id },
    data: { coverImageUrl: result.url },
  });

  return result;
}

export async function deleteOrganizerImage(
  field: "logoUrl" | "coverImageUrl",
  path: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const bucketKey: BucketKey = field === "logoUrl" ? "avatar" : "cover";
  const bucket = BUCKETS[bucketKey];

  // Best-effort storage delete — DB is always updated regardless
  try {
    await supabase.storage.from(bucket).remove([path]);
  } catch {
    // continue
  }

  await prisma.organizerProfile.update({
    where: { userId: user.id },
    data: { [field]: null },
  });

  return { success: true as const };
}
