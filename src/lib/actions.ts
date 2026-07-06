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
  return user.id;
}

// -------------------------------------------------------
// DJ PROFILE (legacy action-state version)
// Used by: UpdateUser.tsx
// Prefer updateDjProfile in @/lib/actions/profile.ts for new code.
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
