"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { revalidatePath } from "next/cache";

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

export async function updateUserProfile(input: {
  name?: string;
  countryId?: number;
  cityId?: number;
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

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(countryId !== undefined && { countryId }),
      ...(cityId !== undefined && { cityId }),
      ...(countryId !== undefined && cityId === undefined && { cityId: null }),
    },
  });

  revalidatePath("/account");
  revalidatePath("/account/settings");
  return { success: true };
}
