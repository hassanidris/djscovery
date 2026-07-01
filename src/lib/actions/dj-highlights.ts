"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { revalidatePath } from "next/cache";

export async function getDjHighlights(djProfileId: number) {
  return prisma.djCareerHighlight.findMany({
    where: { djProfileId },
    orderBy: { year: "desc" },
  });
}

export async function createDjHighlight(
  formData: FormData,
): Promise<{ success: true; id: number } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const profile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, plan: true },
  });
  if (!profile) return { error: "DJ profile not found" };
  if (profile.plan !== "PREMIUM")
    return { error: "Highlights require Premium" };

  const year = (formData.get("year") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!year || !title) {
    return { error: "Year and title are required" };
  }

  const highlight = await prisma.djCareerHighlight.create({
    data: {
      year,
      title,
      description,
      djProfileId: profile.id,
    },
  });

  revalidatePath("/djs/[slug]", "page");
  return { success: true as const, id: highlight.id };
}

export async function updateDjHighlight(
  id: number,
  formData: FormData,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const existing = await prisma.djCareerHighlight.findUnique({
    where: { id },
    include: { djProfile: { select: { userId: true } } },
  });
  if (!existing) return { error: "Highlight not found" };
  if (existing.djProfile.userId !== user.id) return { error: "Unauthorized" };

  const year = (formData.get("year") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();

  const data: Record<string, unknown> = {};
  if (year !== undefined && year !== "") data.year = year;
  if (title !== undefined && title !== "") data.title = title;
  if (description !== undefined) data.description = description || null;

  await prisma.djCareerHighlight.update({ where: { id }, data });

  revalidatePath("/djs/[slug]", "page");
  return { success: true as const };
}

export async function deleteDjHighlight(
  id: number,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const existing = await prisma.djCareerHighlight.findUnique({
    where: { id },
    include: { djProfile: { select: { userId: true } } },
  });
  if (!existing) return { error: "Highlight not found" };
  if (existing.djProfile.userId !== user.id) return { error: "Unauthorized" };

  await prisma.djCareerHighlight.delete({ where: { id } });

  revalidatePath("/djs/[slug]", "page");
  return { success: true as const };
}
