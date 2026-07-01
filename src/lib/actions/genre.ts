"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";

export async function createGenre(
  name: string,
): Promise<{ success: true; name: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const trimmed = name.trim();
  if (!trimmed) return { error: "Genre name is required" };
  if (trimmed.length > 30)
    return { error: "Genre name too long (max 30 chars)" };

  // Normalize to match client-side rule: lowercase and strip non-alphanumerics
  const normalized = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Check for existing by normalized form to prevent duplicates like "Deep House" vs "Deep-House"
  const allGenres = await prisma.genre.findMany({ select: { name: true } });
  const existing = allGenres.find(
    (g) => g.name.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized,
  );
  if (existing) {
    return { success: true as const, name: existing.name };
  }

  try {
    const genre = await prisma.genre.create({
      data: { name: trimmed },
      select: { name: true },
    });
    return { success: true as const, name: genre.name };
  } catch {
    // Race condition: another request created it
    const race = await prisma.genre.findFirst({
      where: { name: { equals: trimmed, mode: "insensitive" } },
      select: { name: true },
    });
    if (race) return { success: true as const, name: race.name };
    return { error: "Failed to create genre" };
  }
}
