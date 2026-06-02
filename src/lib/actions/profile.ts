"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { redirect } from "next/navigation";
import { z } from "zod";

function makeSlug(stageName: string, userId: string) {
  const base = stageName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
  return `${base}-${userId.slice(0, 8)}`;
}

export async function createDjProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const Schema = z.object({
    stageName: z.string().min(2).max(60),
    bio: z.string().max(500).optional(),
  });

  const parsed = Schema.safeParse({
    stageName: formData.get("stageName"),
    bio: formData.get("bio") || undefined,
  });

  if (!parsed.success) return;

  const slug = makeSlug(parsed.data.stageName, user.id);

  await prisma.djProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      stageName: parsed.data.stageName,
      slug,
      bio: parsed.data.bio ?? null,
    },
  });

  redirect("/");
}

export async function createOrganizerProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const Schema = z.object({
    businessName: z.string().min(2).max(80),
    phone: z.string().max(30).optional(),
  });

  const parsed = Schema.safeParse({
    businessName: formData.get("businessName"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) return;

  await prisma.organizerProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      businessName: parsed.data.businessName,
      phone: parsed.data.phone ?? null,
    },
  });

  redirect("/");
}
