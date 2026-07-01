"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { revalidatePath } from "next/cache";

export async function getDjPressItems(djProfileId: number) {
  return prisma.djPress.findMany({
    where: { djProfileId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createDjPressItem(
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
    return { error: "Press items require Premium" };

  const source = (formData.get("source") as string)?.trim();
  const type = (formData.get("type") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const date = (formData.get("date") as string)?.trim() || null;
  const url = (formData.get("url") as string)?.trim() || null;

  if (!source || !type || !title) {
    return { error: "Source, type, and title are required" };
  }

  const press = await prisma.djPress.create({
    data: {
      source,
      type,
      title,
      date,
      url,
      djProfileId: profile.id,
    },
  });

  revalidatePath("/djs/[slug]", "page");
  return { success: true as const, id: press.id };
}

export async function updateDjPressItem(
  id: number,
  formData: FormData,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const existing = await prisma.djPress.findUnique({
    where: { id },
    include: { djProfile: { select: { userId: true } } },
  });
  if (!existing) return { error: "Press item not found" };
  if (existing.djProfile.userId !== user.id) return { error: "Unauthorized" };

  const source = (formData.get("source") as string)?.trim();
  const type = (formData.get("type") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const date = (formData.get("date") as string)?.trim();
  const url = (formData.get("url") as string)?.trim();

  const data: Record<string, unknown> = {};
  if (source !== undefined && source !== "") data.source = source;
  if (type !== undefined && type !== "") data.type = type;
  if (title !== undefined && title !== "") data.title = title;
  if (date !== undefined) data.date = date || null;
  if (url !== undefined) data.url = url || null;

  await prisma.djPress.update({ where: { id }, data });

  revalidatePath("/djs/[slug]");
  return { success: true as const };
}

export async function deleteDjPressItem(
  id: number,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const existing = await prisma.djPress.findUnique({
    where: { id },
    include: { djProfile: { select: { userId: true } } },
  });
  if (!existing) return { error: "Press item not found" };
  if (existing.djProfile.userId !== user.id) return { error: "Unauthorized" };

  await prisma.djPress.delete({ where: { id } });

  revalidatePath("/djs/[slug]");
  return { success: true as const };
}
