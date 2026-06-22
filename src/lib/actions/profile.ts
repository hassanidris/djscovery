"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { Prisma } from "@prisma/client";
import { z } from "zod";

function makeSlugBase(stageName: string) {
  return stageName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

async function makeUniqueOrganizerSlug(
  displayName: string,
  excludeUserId?: string,
) {
  const base = displayName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  if (!base)
    throw new Error("Display name must contain at least one letter or number.");
  const existing = await prisma.organizerProfile.findMany({
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
  client: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<{ id: number; name: string }> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Genre name is required");
  }
  const existing = await client.genre.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
    select: { id: true, name: true },
  });
  if (existing) return existing;
  return await client.genre.create({
    data: { name: trimmed },
    select: { id: true, name: true },
  });
}

const DjProfileInputSchema = z.object({
  stageName: z.string().min(2).max(60),
  bio: z.string().max(800).optional(),
  avatarUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
  countryId: z.number().int().positive({ message: "Country is required" }),
  cityId: z.number().int().positive(),
  genreIds: z
    .array(z.number().int().positive())
    .min(1, "Select at least one genre")
    .max(5, "Select up to 5 genres"),
  socialLinks: z
    .array(z.object({ platform: z.string(), url: z.string().url() }))
    .min(1, "Add at least one social media link"),
  djTypes: z
    .array(
      z.enum([
        "CLUB",
        "WEDDING",
        "FESTIVAL",
        "CORPORATE",
        "BAR_LOUNGE",
        "PRIVATE_PARTY",
        "BIRTHDAY",
        "CULTURAL_EVENT",
      ]),
    )
    .min(1, "Select at least one DJ type"),
  media: z.array(
    z.object({
      type: z.enum(["IMAGE", "VIDEO", "AUDIO"]),
      url: z.string().url(),
      path: z.string(),
      bucket: z.string(),
    }),
  ),
  bookingEmail: z.string().email().optional(),
  bookingPhone: z.string().max(30).optional(),
  feeMin: z.number().int().nonnegative().optional(),
  feeMax: z.number().int().nonnegative().optional(),
  feeCurrency: z.string().max(3).optional(),
});

const UpdateDjProfileSchema = z.object({
  stageName: z
    .string()
    .min(2, "Stage name must be at least 2 characters")
    .max(60)
    .optional(),
  bio: z.string().max(800).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
  countryId: z.number().int().positive().optional(),
  cityId: z.number().int().positive().optional(),
  genreNames: z
    .array(z.string().min(1).max(50))
    .max(5, "Select up to 5 genres")
    .optional(),
  socialLinks: z
    .array(
      z.object({
        platform: z.string().min(1),
        url: z.string().url("Invalid URL"),
      }),
    )
    .optional(),
  djTypes: z
    .array(
      z.enum([
        "CLUB",
        "WEDDING",
        "FESTIVAL",
        "CORPORATE",
        "BAR_LOUNGE",
        "PRIVATE_PARTY",
        "BIRTHDAY",
        "CULTURAL_EVENT",
      ]),
    )
    .optional(),
  bookingEmail: z.string().email("Invalid email address").optional().nullable(),
  bookingPhone: z.string().max(30).optional().nullable(),
  feeMin: z.number().int().nonnegative().optional().nullable(),
  feeMax: z.number().int().nonnegative().optional().nullable(),
  feeCurrency: z.string().max(3).optional().nullable(),
});

export type UpdateDjProfileInput = z.infer<typeof UpdateDjProfileSchema>;

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
    coverImageUrl,
    countryId,
    cityId,
    genreIds,
    socialLinks,
    djTypes,
    media,
    bookingEmail,
    bookingPhone,
    feeMin,
    feeMax,
    feeCurrency,
  } = parsed.data;

  const city = await prisma.city.findFirst({
    where: { id: cityId, countryId },
    select: { id: true },
  });
  if (!city) {
    return {
      error: "The selected city does not belong to the selected country.",
    };
  }

  const slug = await makeUniqueSlug(stageName, user.id);

  await prisma.$transaction(async (tx) => {
    const profileData = {
      stageName,
      bio: bio ?? null,
      avatar: avatarUrl ?? null,
      coverImage: coverImageUrl ?? null,
      countryId: countryId,
      cityId: cityId,
      bookingEmail: bookingEmail ?? null,
      bookingPhone: bookingPhone ?? null,
      feeMin: feeMin ?? null,
      feeMax: feeMax ?? null,
      feeCurrency: feeCurrency ?? null,
    };
    const profile = await tx.djProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: { userId: user.id, slug, ...profileData },
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

export async function updateDjProfile(
  input: unknown,
): Promise<{ success: true; newSlug?: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = UpdateDjProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error:
        "Validation failed: " +
        parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const existing = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, stageName: true, slug: true, countryId: true },
  });
  if (!existing) return { error: "DJ profile not found" };

  const data = parsed.data;

  let newSlug = existing.slug;
  if (data.stageName && data.stageName !== existing.stageName) {
    newSlug = await makeUniqueSlug(data.stageName, user.id);
  }

  const effectiveCountryId = data.countryId ?? existing.countryId;
  if (data.cityId && effectiveCountryId) {
    const city = await prisma.city.findFirst({
      where: { id: data.cityId, countryId: effectiveCountryId },
      select: { id: true },
    });
    if (!city)
      return {
        error: "The selected city does not belong to the selected country.",
      };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.djProfile.update({
        where: { userId: user.id },
        data: {
          ...(data.stageName !== undefined && {
            stageName: data.stageName,
            slug: newSlug,
          }),
          ...(data.bio !== undefined && { bio: data.bio }),
          ...(data.avatarUrl !== undefined && { avatar: data.avatarUrl }),
          ...(data.coverImageUrl !== undefined && {
            coverImage: data.coverImageUrl,
          }),
          ...(data.countryId !== undefined && { countryId: data.countryId }),
          ...(data.cityId !== undefined && { cityId: data.cityId }),
          ...(data.bookingEmail !== undefined && {
            bookingEmail: data.bookingEmail,
          }),
          ...(data.bookingPhone !== undefined && {
            bookingPhone: data.bookingPhone,
          }),
          ...(data.feeMin !== undefined && { feeMin: data.feeMin }),
          ...(data.feeMax !== undefined && { feeMax: data.feeMax }),
          ...(data.feeCurrency !== undefined && {
            feeCurrency: data.feeCurrency,
          }),
        },
      });

      if (data.genreNames !== undefined) {
        const genres = await Promise.all(
          data.genreNames.map((name) => getOrCreateGenre(name, tx)),
        );
        await tx.djGenre.deleteMany({ where: { djProfileId: existing.id } });
        if (genres.length > 0) {
          await tx.djGenre.createMany({
            data: genres.map((g) => ({
              djProfileId: existing.id,
              genreId: g.id,
            })),
            skipDuplicates: true,
          });
        }
      }

      if (data.djTypes !== undefined) {
        await tx.djProfileType.deleteMany({
          where: { djProfileId: existing.id },
        });
        if (data.djTypes.length > 0) {
          await tx.djProfileType.createMany({
            data: data.djTypes.map((type) => ({
              djProfileId: existing.id,
              type,
            })),
            skipDuplicates: true,
          });
        }
      }

      if (data.socialLinks !== undefined) {
        await tx.socialLink.deleteMany({ where: { djProfileId: existing.id } });
        if (data.socialLinks.length > 0) {
          await tx.socialLink.createMany({
            data: data.socialLinks.map((link) => ({
              djProfileId: existing.id,
              platform: link.platform,
              url: link.url,
            })),
            skipDuplicates: true,
          });
        }
      }
    });

    const slugChanged = newSlug !== existing.slug;
    return { success: true as const, ...(slugChanged && { newSlug }) };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

// ============================================================
// ORGANIZER PROFILE ACTIONS
// ============================================================

const CreateOrganizerSchema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long"),
  organizerType: z.enum(
    ["INDIVIDUAL", "COMPANY", "VENUE", "AGENCY", "FESTIVAL"],
    { errorMap: () => ({ message: "Please select an organizer type" }) },
  ),
});

const UpdateOrganizerSchema = z.object({
  displayName: z.string().min(2).max(80).optional(),
  organizerType: z
    .enum(["INDIVIDUAL", "COMPANY", "VENUE", "AGENCY", "FESTIVAL"])
    .optional(),
  bio: z
    .string()
    .max(600, "Bio must be under 600 characters")
    .optional()
    .nullable(),
  website: z.string().url("Must be a valid URL").max(200).optional().nullable(),
  contactEmail: z.string().email("Invalid email address").optional().nullable(),
  phone: z
    .string()
    .max(30)
    .regex(/^[+\d\s()./-]*$/, "Invalid phone format")
    .optional()
    .nullable(),
  logoUrl: z.string().url().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
  countryId: z.number().int().positive().optional(),
  cityId: z.number().int().positive().optional(),
  socialLinks: z
    .array(
      z.object({
        platform: z.enum([
          "instagram",
          "linkedin",
          "facebook",
          "tiktok",
          "youtube",
          "website",
        ]),
        url: z.string().url("Invalid social link URL"),
      }),
    )
    .max(6, "Maximum 6 social links")
    .optional(),
});

export type UpdateOrganizerInput = z.infer<typeof UpdateOrganizerSchema>;

export async function createOrganizerProfile(
  _prevState: { success: boolean; error: string | null },
  formData: FormData,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const rawCountryId = parseInt(formData.get("countryId") as string, 10);
  const rawCityId = parseInt(formData.get("cityId") as string, 10);
  const countryId = isNaN(rawCountryId) ? undefined : rawCountryId;
  const cityId = isNaN(rawCityId) ? undefined : rawCityId;

  if (!countryId || !cityId) {
    return { success: false, error: "Country and city are required." };
  }

  const parsed = CreateOrganizerSchema.safeParse({
    displayName: formData.get("displayName"),
    organizerType: formData.get("organizerType"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  let slug: string;
  try {
    slug = await makeUniqueOrganizerSlug(parsed.data.displayName, user.id);
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Invalid display name.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.organizerProfile.upsert({
        where: { userId: user.id },
        update: {
          displayName: parsed.data.displayName,
          slug,
          organizerType: parsed.data.organizerType,
          status: "ACTIVE",
          deletedAt: null,
        },
        create: {
          userId: user.id,
          displayName: parsed.data.displayName,
          slug,
          organizerType: parsed.data.organizerType,
          status: "ACTIVE",
          countryId,
          cityId,
        },
      });

      // Grant ORGANIZER role only now — after the profile is fully saved.
      await tx.userRole.upsert({
        where: { userId_role: { userId: user.id, role: "ORGANIZER" } },
        update: {},
        create: { userId: user.id, role: "ORGANIZER" },
      });
    });

    return { success: true, error: null };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateOrganizerProfile(
  input: unknown,
): Promise<{ success: true; newSlug?: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = UpdateOrganizerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error:
        "Validation failed: " +
        parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const existing = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      displayName: true,
      slug: true,
      countryId: true,
      status: true,
      deletedAt: true,
    },
  });
  if (!existing) return { error: "Organizer profile not found" };
  if (existing.status !== "ACTIVE" || existing.deletedAt !== null)
    return { error: "Your organizer profile is not active." };

  const data = parsed.data;

  let newSlug = existing.slug;
  if (data.displayName && data.displayName !== existing.displayName) {
    try {
      newSlug = await makeUniqueOrganizerSlug(data.displayName, user.id);
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "Invalid display name.",
      };
    }
  }

  const effectiveCountryId = data.countryId ?? existing.countryId;
  if (data.cityId && effectiveCountryId) {
    const city = await prisma.city.findFirst({
      where: { id: data.cityId, countryId: effectiveCountryId },
      select: { id: true },
    });
    if (!city)
      return {
        error: "The selected city does not belong to the selected country.",
      };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.organizerProfile.update({
        where: { userId: user.id },
        data: {
          ...(data.displayName !== undefined && {
            displayName: data.displayName,
            slug: newSlug,
          }),
          ...(data.organizerType !== undefined && {
            organizerType: data.organizerType,
          }),
          ...(data.bio !== undefined && { bio: data.bio }),
          ...(data.website !== undefined && { website: data.website }),
          ...(data.contactEmail !== undefined && {
            contactEmail: data.contactEmail,
          }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
          ...(data.coverImageUrl !== undefined && {
            coverImageUrl: data.coverImageUrl,
          }),
          ...(data.countryId !== undefined && { countryId: data.countryId }),
          ...(data.cityId !== undefined && { cityId: data.cityId }),
        },
      });

      if (data.socialLinks !== undefined) {
        await tx.organizerSocialLink.deleteMany({
          where: { organizerProfileId: existing.id },
        });
        if (data.socialLinks.length > 0) {
          await tx.organizerSocialLink.createMany({
            data: data.socialLinks.map((link) => ({
              organizerProfileId: existing.id,
              platform: link.platform,
              url: link.url,
            })),
            skipDuplicates: true,
          });
        }
      }
    });

    const slugChanged = newSlug !== existing.slug;
    return { success: true as const, ...(slugChanged && { newSlug }) };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

export async function deleteOrganizerProfile(): Promise<
  { success: true } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.organizerProfile.update({
        where: { userId: user.id },
        data: { deletedAt: new Date(), status: "SUSPENDED" },
      });
      await tx.userRole.deleteMany({
        where: { userId: user.id, role: "ORGANIZER" },
      });
    });
    return { success: true as const };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

export async function setupFanProfile(
  _prevState: { success: boolean; error: string | null },
  formData: FormData,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { success: false, error: "Name is required" };
  if (name.length > 50)
    return { success: false, error: "Name is too long (max 50 characters)" };

  const bio = (formData.get("bio") as string)?.trim() || null;
  const rawCountryId = formData.get("countryId");
  const countryId =
    rawCountryId && rawCountryId !== ""
      ? parseInt(rawCountryId as string, 10)
      : null;

  try {
    await prisma.fanProfile.upsert({
      where: { userId: user.id },
      update: { name, bio, countryId },
      create: { userId: user.id, name, bio, countryId },
    });
    return { success: true, error: null };
  } catch {
    return {
      success: false,
      error: "Failed to save profile. Please try again.",
    };
  }
}
