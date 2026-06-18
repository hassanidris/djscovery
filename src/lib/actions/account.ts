"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { revalidatePath } from "next/cache";
import {
  BUCKET,
  getPublicMediaUrl,
  validateImageFile,
  buildUserAvatarPath,
} from "@/lib/storage";

export async function updatePassword(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;
  if (!password) return { error: "Password is required." };
  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { success: true };
}

export async function uploadUserAvatar(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };

  const validationError = validateImageFile(file, 5 * 1024 * 1024);
  if (validationError) return validationError;

  const existing = await prisma.user.findUnique({
    where: { id: user.id },
    select: { imagePath: true },
  });

  const path = buildUserAvatarPath(user.id, file);

  const { data, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  const url = getPublicMediaUrl(data.path);

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { image: url, imagePath: data.path },
    });
  } catch {
    await supabase.storage.from(BUCKET).remove([data.path]);
    return { error: "Image uploaded but failed to save. Please try again." };
  }

  if (existing?.imagePath) {
    await supabase.storage.from(BUCKET).remove([existing.imagePath]);
  }

  revalidatePath("/account");
  revalidatePath("/account/settings");
  return { url };
}

export async function updateUserProfile(input: {
  name?: string;
  countryId?: number | null;
  cityId?: number | null;
}): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { name, countryId, cityId } = input;

  if (name !== undefined && name.trim().length === 0) {
    return { error: "Display name cannot be empty." };
  }

  if ("cityId" in input && cityId !== null) {
    let effectiveCountryId: number | null | undefined =
      "countryId" in input ? countryId : undefined;

    if (effectiveCountryId === undefined) {
      const existing = await prisma.user.findUnique({
        where: { id: user.id },
        select: { countryId: true },
      });
      effectiveCountryId = existing?.countryId ?? null;
    }

    if (!effectiveCountryId) {
      return { error: "Please select a country before setting a city." };
    }

    const city = await prisma.city.findFirst({
      where: { id: cityId, countryId: effectiveCountryId },
      select: { id: true },
    });
    if (!city) {
      return {
        error: "The selected city does not belong to the chosen country.",
      };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...("countryId" in input && { countryId }),
      ...("cityId" in input && { cityId }),
    },
  });

  revalidatePath("/account");
  revalidatePath("/account/settings");
  return { success: true };
}
