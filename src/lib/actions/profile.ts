"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { z } from "zod";

function makeSlugBase(stageName: string) {
  return stageName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

async function makeUniqueSlug(stageName: string, excludeUserId?: string) {
  const base = makeSlugBase(stageName);
  const existing = await prisma.djProfile.findMany({
    where: {
      slug: { startsWith: base },
      ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
    },
    select: { slug: true },
  });
  const taken = new Set(existing.map((p) => p.slug));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

export async function getCitiesByCountry(countryId: number) {
  const cities = await prisma.city.findMany({
    where: { countryId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return cities;
}

export async function getOrCreateGenre(
  name: string,
): Promise<{ id: number; name: string }> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Genre name is required");
  }
  const existing = await prisma.genre.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
    select: { id: true, name: true },
  });
  if (existing) return existing;
  return await prisma.genre.create({
    data: { name: trimmed },
    select: { id: true, name: true },
  });
}

const DjProfileInputSchema = z.object({
  stageName: z.string().min(2).max(60),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  countryId: z.number().int().positive({ message: "Country is required" }),
  cityId: z.number().int().positive().optional(),
  genreIds: z
    .array(z.number().int().positive())
    .min(1, "Select at least one genre"),
  socialLinks: z
    .array(z.object({ platform: z.string(), url: z.string().url() }))
    .min(1, "Add at least one social media link"),
  djTypes: z
    .array(z.enum(["CLUB", "WEDDING", "FESTIVAL", "CORPORATE", "BAR_LOUNGE"]))
    .min(1, "Select at least one DJ type"),
  media: z.array(
    z.object({
      type: z.enum(["IMAGE", "VIDEO", "AUDIO"]),
      url: z.string().url(),
      path: z.string(),
      bucket: z.string(),
    }),
  ),
});

export async function createDjProfile(
  input: unknown,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = DjProfileInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error:
        "Invalid data: " + parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const {
    stageName,
    bio,
    avatarUrl,
    countryId,
    cityId,
    genreIds,
    socialLinks,
    djTypes,
    media,
  } = parsed.data;

  if (cityId) {
    const city = await prisma.city.findFirst({
      where: { id: cityId, countryId },
      select: { id: true },
    });
    if (!city) {
      return {
        error: "The selected city does not belong to the selected country.",
      };
    }
  }

  const slug = await makeUniqueSlug(stageName, user.id);

  await prisma.$transaction(async (tx) => {
    const profile = await tx.djProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        stageName,
        slug,
        bio: bio ?? null,
        avatar: avatarUrl ?? null,
        countryId: countryId ?? null,
        cityId: cityId ?? null,
      },
    });

    if (djTypes.length > 0) {
      await tx.djProfileType.createMany({
        data: djTypes.map((type) => ({ djProfileId: profile.id, type })),
        skipDuplicates: true,
      });
    }

    if (genreIds.length > 0) {
      await tx.djGenre.createMany({
        data: genreIds.map((genreId) => ({ djProfileId: profile.id, genreId })),
        skipDuplicates: true,
      });
    }

    if (socialLinks.length > 0) {
      await tx.socialLink.createMany({
        data: socialLinks.map((link) => ({
          djProfileId: profile.id,
          platform: link.platform,
          url: link.url,
        })),
        skipDuplicates: true,
      });
    }

    if (media.length > 0) {
      await tx.media.createMany({
        data: media.map((m) => ({
          type: m.type as "IMAGE" | "VIDEO" | "AUDIO",
          url: m.url,
          bucket: m.bucket,
          path: m.path,
          djProfileId: profile.id,
        })),
      });
    }

    // Grant DJ role only now — after the profile is fully saved.
    await tx.userRole.upsert({
      where: { userId_role: { userId: user.id, role: "DJ" } },
      update: {},
      create: { userId: user.id, role: "DJ" },
    });
  });

  return { success: true as const };
}

export async function createOrganizerProfile(
  _prevState: { success: boolean; error: string | null },
  formData: FormData,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const Schema = z.object({
    businessName: z.string().min(2).max(80),
    phone: z.string().max(30).optional(),
  });

  const parsed = Schema.safeParse({
    businessName: formData.get("businessName"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Please check your details and try again.",
    };
  }

  try {
    await prisma.organizerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        businessName: parsed.data.businessName,
        phone: parsed.data.phone ?? null,
      },
    });

    // Grant ORGANIZER role only now — after the profile is fully saved.
    await prisma.userRole.upsert({
      where: { userId_role: { userId: user.id, role: "ORGANIZER" } },
      update: {},
      create: { userId: user.id, role: "ORGANIZER" },
    });

    return { success: true, error: null };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
