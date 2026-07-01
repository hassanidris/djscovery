"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { revalidatePath } from "next/cache";

export async function getDjEndorsements(djProfileId: number) {
  return prisma.djEndorsement.findMany({
    where: { djProfileId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createDjEndorsement(
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
    return { error: "Endorsements require Premium" };

  const name = (formData.get("name") as string)?.trim();
  const role = (formData.get("role") as string)?.trim();
  const company = (formData.get("company") as string)?.trim() || null;
  const quote = (formData.get("quote") as string)?.trim();
  const avatar = (formData.get("avatar") as string)?.trim() || null;

  if (!name || !role || !quote) {
    return { error: "Name, role, and quote are required" };
  }

  const endorsement = await prisma.djEndorsement.create({
    data: {
      name,
      role,
      company,
      quote,
      avatar,
      djProfileId: profile.id,
    },
  });

  revalidatePath("/djs/[slug]");
  return { success: true as const, id: endorsement.id };
}

export async function updateDjEndorsement(
  id: number,
  formData: FormData,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const existing = await prisma.djEndorsement.findUnique({
    where: { id },
    include: { djProfile: { select: { userId: true } } },
  });
  if (!existing) return { error: "Endorsement not found" };
  if (existing.djProfile.userId !== user.id) return { error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  const role = (formData.get("role") as string)?.trim();
  const company = (formData.get("company") as string)?.trim();
  const quote = (formData.get("quote") as string)?.trim();
  const avatar = (formData.get("avatar") as string)?.trim();

  const data: Record<string, unknown> = {};
  if (name !== undefined && name !== "") data.name = name;
  if (role !== undefined && role !== "") data.role = role;
  if (company !== undefined) data.company = company || null;
  if (quote !== undefined && quote !== "") data.quote = quote;
  if (avatar !== undefined) data.avatar = avatar || null;

  await prisma.djEndorsement.update({ where: { id }, data });

  revalidatePath("/djs/[slug]");
  return { success: true as const };
}

export async function deleteDjEndorsement(
  id: number,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const existing = await prisma.djEndorsement.findUnique({
    where: { id },
    include: { djProfile: { select: { userId: true } } },
  });
  if (!existing) return { error: "Endorsement not found" };
  if (existing.djProfile.userId !== user.id) return { error: "Unauthorized" };

  await prisma.djEndorsement.delete({ where: { id } });

  revalidatePath("/djs/[slug]");
  return { success: true as const };
}
