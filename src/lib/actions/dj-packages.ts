"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { revalidatePath } from "next/cache";

export async function getDjPackages(djProfileId: number) {
  return prisma.djPackage.findMany({
    where: { djProfileId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createDjPackage(
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
  if (profile.plan !== "PREMIUM") return { error: "Packages require Premium" };

  const name = (formData.get("name") as string)?.trim();
  const priceFrom = parseInt(formData.get("priceFrom") as string, 10);
  const priceToRaw = formData.get("priceTo");
  const priceTo = priceToRaw ? parseInt(priceToRaw as string, 10) : null;
  const currency = (formData.get("currency") as string)?.trim() || "USD";
  const duration = (formData.get("duration") as string)?.trim() || null;
  const features = formData
    .getAll("features")
    .map((f) => String(f).trim())
    .filter(Boolean);
  const popular = formData.get("popular") === "true";

  if (!name || isNaN(priceFrom)) {
    return { error: "Name and price are required" };
  }

  const pkg = await prisma.djPackage.create({
    data: {
      name,
      priceFrom,
      priceTo,
      currency,
      duration,
      features,
      popular,
      djProfileId: profile.id,
    },
  });

  revalidatePath("/djs/[slug]", "page");
  return { success: true as const, id: pkg.id };
}

export async function updateDjPackage(
  id: number,
  formData: FormData,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const existing = await prisma.djPackage.findUnique({
    where: { id },
    include: { djProfile: { select: { userId: true } } },
  });
  if (!existing) return { error: "Package not found" };
  if (existing.djProfile.userId !== user.id) return { error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  const priceFromRaw = formData.get("priceFrom");
  const priceFrom = priceFromRaw ? parseInt(priceFromRaw as string, 10) : null;
  const priceToRaw = formData.get("priceTo");
  const currency = (formData.get("currency") as string)?.trim() || null;
  const duration = (formData.get("duration") as string)?.trim() || null;
  const features = formData
    .getAll("features")
    .map((f) => String(f).trim())
    .filter(Boolean);
  const popular = formData.get("popular");

  const data: Record<string, unknown> = {};
  if (name !== undefined && name !== "") data.name = name;
  if (priceFrom !== null) data.priceFrom = priceFrom;
  // Distinguish between field absent (leave unchanged) vs field present but empty (clear to null)
  if (priceToRaw !== null) {
    data.priceTo =
      priceToRaw === "" ? null : parseInt(priceToRaw as string, 10);
  }
  if (currency !== null) data.currency = currency;
  if (duration !== undefined) data.duration = duration || null;
  if (features !== undefined) data.features = features;
  if (popular !== null) data.popular = popular === "true";

  await prisma.djPackage.update({ where: { id }, data });

  revalidatePath("/djs/[slug]");
  return { success: true as const };
}

export async function deleteDjPackage(
  id: number,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const existing = await prisma.djPackage.findUnique({
    where: { id },
    include: { djProfile: { select: { userId: true } } },
  });
  if (!existing) return { error: "Package not found" };
  if (existing.djProfile.userId !== user.id) return { error: "Unauthorized" };

  await prisma.djPackage.delete({ where: { id } });

  revalidatePath("/djs/[slug]");
  return { success: true as const };
}
