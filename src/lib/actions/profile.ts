"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email/sendEmail";
import {
  BUCKET,
  buildUserAvatarPath,
  getPublicMediaUrl,
  validateImageFile,
} from "@/lib/storage";
import {
  adminDjRegistrationSubject,
  adminDjRegistrationHtml,
} from "@/lib/email/templates/adminDjRegistration";
import { updateReputationScore } from "@/lib/reputation/update";

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

const DjProfileInputSchema = z
  .object({
    stageName: z.string().min(2).max(60),
    bio: z.string().max(800).optional(),
    experienceYears: z.number().int().min(0).max(50).optional(),
    // experienceLevel is auto-calculated from experienceYears
    feeMin: z.number().int().min(0).optional(),
    feeMax: z.number().int().min(0).optional(),
    feeCurrency: z.string().max(3).optional(),
    avatarUrl: z.string().url().optional(),
    coverImageUrl: z.string().url().optional(),
    countryId: z.number().int().positive({ message: "Country is required" }),
    cityId: z.number().int().positive(),
    genreNames: z
      .array(z.string().min(1).max(50))
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
    // Where I've Played (venues)
    venues: z
      .array(
        z.object({
          venueName: z.string().min(1).max(100),
          eventDate: z.string().max(20).optional(),
          description: z.string().max(300).optional(),
          countryId: z.number().int().positive(),
          cityId: z.number().int().positive(),
        }),
      )
      .max(20, "Up to 20 venues allowed")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.feeMin == null || data.feeMax == null) return true;
      return data.feeMax >= data.feeMin;
    },
    {
      message: "Maximum fee must be greater than or equal to minimum fee",
      path: ["feeMax"],
    },
  );

const UpdateDjProfileSchema = z
  .object({
    stageName: z
      .string()
      .min(2, "Stage name must be at least 2 characters")
      .max(60)
      .optional(),
    bio: z.string().max(800).optional().nullable(),
    experienceYears: z.number().int().min(0).max(50).optional().nullable(),
    // experienceLevel is auto-calculated from experienceYears
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
    bookingEmail: z
      .string()
      .email("Invalid email address")
      .optional()
      .nullable(),
    bookingPhone: z.string().max(30).optional().nullable(),
    feeMin: z.number().int().nonnegative().optional().nullable(),
    feeMax: z.number().int().nonnegative().optional().nullable(),
    feeCurrency: z.string().max(3).optional().nullable(),

    // Team contacts
    managerName: z.string().max(60).optional().nullable(),
    managerEmail: z.string().email().optional().nullable(),
    managerPhone: z.string().max(30).optional().nullable(),
    agentName: z.string().max(60).optional().nullable(),
    agentAgency: z.string().max(60).optional().nullable(),
    agentEmail: z.string().email().optional().nullable(),

    // Availability
    availabilityTimezone: z.string().max(50).optional().nullable(),
    availabilityMonth: z.string().max(7).optional().nullable(),

    // Featured performance
    featuredPerformanceUrl: z.string().url().max(500).optional().nullable(),
    featuredPerformanceContext: z.string().max(200).optional().nullable(),
    availabilityDays: z
      .array(
        z.object({
          day: z.number().int().min(1).max(31),
          status: z.enum(["available", "booked", "tentative", "free"]),
        }),
      )
      .optional(),

    // Where I've Played (venues)
    venues: z
      .array(
        z.object({
          venueName: z.string().min(1).max(100).optional().nullable(),
          eventDate: z.string().optional().nullable(),
          description: z.string().max(300).optional().nullable(),
          countryId: z.number().int().positive().optional().nullable(),
          cityId: z.number().int().positive().optional().nullable(),
        }),
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.feeMin == null || data.feeMax == null) return true;
      return data.feeMax >= data.feeMin;
    },
    {
      message: "Maximum fee must be greater than or equal to minimum fee",
      path: ["feeMax"],
    },
  );

export type UpdateDjProfileInput = z.infer<typeof UpdateDjProfileSchema>;

// Helper function to calculate experience level from years
function calculateExperienceLevel(
  years: number | null | undefined,
): "OPEN" | "BEGINNER" | "INTERMEDIATE" | "PROFESSIONAL" | "EXPERT" | null {
  if (years == null || years < 0) return null;
  if (years === 0) return "OPEN";
  if (years <= 2) return "BEGINNER";
  if (years <= 5) return "INTERMEDIATE";
  if (years <= 10) return "PROFESSIONAL";
  return "EXPERT";
}

export async function createDjProfile(
  input: unknown,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const parsed = DjProfileInputSchema.safeParse(input);
    if (!parsed.success) {
      return {
        error:
          "Invalid data: " +
          parsed.error.issues.map((i) => i.message).join(", "),
      };
    }

    const {
      stageName,
      bio,
      experienceYears,
      avatarUrl,
      coverImageUrl,
      countryId,
      cityId,
      genreNames,
      socialLinks,
      djTypes,
      media,
      bookingEmail,
      bookingPhone,
      feeMin,
      feeMax,
      feeCurrency,
      venues,
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

    let isNewProfile = false;
    let adminEmailsForNotify: string[] = [];

    await prisma.$transaction(async (tx) => {
      const effectiveBookingEmail = bookingEmail ?? user.email;

      const profileData = {
        stageName,
        bio: bio ?? null,
        experienceYears: experienceYears ?? null,
        experienceLevel: calculateExperienceLevel(experienceYears),
        avatar: avatarUrl ?? null,
        coverImage: coverImageUrl ?? null,
        countryId: countryId,
        cityId: cityId,
        bookingEmail: effectiveBookingEmail,
        bookingPhone: bookingPhone ?? null,
        feeMin: feeMin ?? null,
        feeMax: feeMax ?? null,
        feeCurrency: feeCurrency ?? null,
      };
      let profile;
      try {
        profile = await tx.djProfile.create({
          data: { userId: user.id, slug, ...profileData },
        });
        isNewProfile = true;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          // Unique constraint on userId — profile already exists, update instead.
          profile = await tx.djProfile.update({
            where: { userId: user.id },
            data: profileData,
          });
        } else {
          throw error;
        }
      }

      if (djTypes.length > 0) {
        await tx.djProfileType.createMany({
          data: djTypes.map((type) => ({ djProfileId: profile.id, type })),
          skipDuplicates: true,
        });
      }

      if (genreNames.length > 0) {
        const genres = await Promise.all(
          genreNames.map((name) => getOrCreateGenre(name, tx)),
        );
        await tx.djGenre.createMany({
          data: genres.map((genre) => ({
            djProfileId: profile.id,
            genreId: genre.id,
          })),
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

      if (venues && venues.length > 0) {
        const validCities = await tx.city.findMany({
          where: {
            OR: venues.map((v) => ({ id: v.cityId, countryId: v.countryId })),
          },
          select: { id: true, countryId: true },
        });
        const isValid = (v: (typeof venues)[number]) =>
          validCities.some(
            (c) => c.id === v.cityId && c.countryId === v.countryId,
          );
        await tx.djVenue.createMany({
          data: venues.filter(isValid).map((v) => ({
            venueName: v.venueName,
            eventDate: v.eventDate,
            description: v.description,
            countryId: v.countryId,
            cityId: v.cityId,
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

      await tx.user.update({
        where: { id: user.id },
        data: { onboardingComplete: true },
      });

      if (isNewProfile) {
        const admins = await tx.userRole.findMany({
          where: { role: "ADMIN" },
          select: { userId: true, user: { select: { email: true } } },
        });
        adminEmailsForNotify = admins
          .map((a) => a.user.email)
          .filter((email): email is string => Boolean(email));
        if (admins.length > 0) {
          await tx.notification.createMany({
            data: admins.map((a) => ({
              type: "DJ_REGISTRATION" as const,
              recipientId: a.userId,
              senderId: user.id,
              data: { djProfileId: profile.id, stageName },
            })),
            skipDuplicates: true,
          });
        }
      }
    });

    if (isNewProfile && adminEmailsForNotify.length > 0) {
      const adminUrl = `${
        process.env.NEXT_PUBLIC_BASE_URL ?? "https://djcovery.com"
      }/admin/djs`;
      const uniqueEmails = Array.from(new Set(adminEmailsForNotify));
      await Promise.all(
        uniqueEmails.map((email) =>
          sendEmail({
            to: email,
            emailType: "ADMIN_DJ_REGISTRATION",
            subject: adminDjRegistrationSubject,
            html: adminDjRegistrationHtml({ stageName, adminUrl }),
          }),
        ),
      );
    }

    if (isNewProfile) {
      revalidatePath("/admin/djs");
      revalidatePath("/admin");
    }

    return { success: true as const };
  } catch (error) {
    console.error("createDjProfile failed", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
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
          ...(data.experienceYears !== undefined && {
            experienceYears: data.experienceYears,
            experienceLevel: calculateExperienceLevel(data.experienceYears),
          }),
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

          // Team contacts
          ...(data.managerName !== undefined && {
            managerName: data.managerName,
          }),
          ...(data.managerEmail !== undefined && {
            managerEmail: data.managerEmail,
          }),
          ...(data.managerPhone !== undefined && {
            managerPhone: data.managerPhone,
          }),
          ...(data.agentName !== undefined && {
            agentName: data.agentName,
          }),
          ...(data.agentAgency !== undefined && {
            agentAgency: data.agentAgency,
          }),
          ...(data.agentEmail !== undefined && {
            agentEmail: data.agentEmail,
          }),

          // Availability
          ...(data.availabilityTimezone !== undefined && {
            availabilityTimezone: data.availabilityTimezone,
          }),
          ...(data.availabilityMonth !== undefined && {
            availabilityMonth: data.availabilityMonth,
          }),
          ...(data.availabilityDays !== undefined && {
            availabilityDays: data.availabilityDays,
          }),

          // Featured performance
          ...(data.featuredPerformanceUrl !== undefined && {
            featuredPerformanceUrl: data.featuredPerformanceUrl,
          }),
          ...(data.featuredPerformanceContext !== undefined && {
            featuredPerformanceContext: data.featuredPerformanceContext,
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

      if (data.venues !== undefined) {
        await tx.djVenue.deleteMany({ where: { djProfileId: existing.id } });
        if (data.venues.length > 0) {
          const validVenues = data.venues.filter(
            (
              v,
            ): v is {
              venueName: string;
              eventDate?: string | null;
              description?: string | null;
              countryId: number;
              cityId: number;
            } => v.venueName != null && v.countryId != null && v.cityId != null,
          );
          if (validVenues.length > 0) {
            // Validate city/country consistency
            const validCities = await tx.city.findMany({
              where: {
                OR: validVenues.map((v) => ({
                  id: v.cityId,
                  countryId: v.countryId,
                })),
              },
              select: { id: true, countryId: true },
            });
            const isValid = (v: (typeof validVenues)[number]) =>
              validCities.some(
                (c) => c.id === v.cityId && c.countryId === v.countryId,
              );
            const validatedVenues = validVenues.filter(isValid);
            if (validatedVenues.length > 0) {
              await tx.djVenue.createMany({
                data: validatedVenues.map((v) => ({
                  venueName: v.venueName,
                  eventDate: v.eventDate ?? null,
                  description: v.description ?? null,
                  countryId: v.countryId,
                  cityId: v.cityId,
                  djProfileId: existing.id,
                })),
              });
            }
          }
        }
      }
    });

    const slugChanged = newSlug !== existing.slug;
    try {
      await updateReputationScore(existing.id, "PROFILE_UPDATED");
    } catch (error) {
      console.error("Failed to refresh DJ reputation after profile update", {
        djProfileId: existing.id,
        error,
      });
    }
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

      await tx.user.update({
        where: { id: user.id },
        data: { onboardingComplete: true },
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
  const rawCityId = formData.get("cityId");
  const cityId =
    rawCityId && rawCityId !== "" ? parseInt(rawCityId as string, 10) : null;

  if (!countryId) return { success: false, error: "Country is required" };
  if (!cityId) return { success: false, error: "City is required" };

  const city = await prisma.city.findFirst({
    where: { id: cityId, countryId },
    select: { id: true },
  });
  if (!city) {
    return {
      success: false,
      error: "Please select a valid city for that country.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.fanProfile.upsert({
        where: { userId: user.id },
        update: { name, bio, countryId, cityId },
        create: { userId: user.id, name, bio, countryId, cityId },
      });
      await tx.user.update({
        where: { id: user.id },
        data: { name, countryId, cityId, onboardingComplete: true },
      });
      await tx.userRole.upsert({
        where: { userId_role: { userId: user.id, role: "FAN" } },
        update: {},
        create: { userId: user.id, role: "FAN" },
      });
    });
    return { success: true, error: null };
  } catch {
    return {
      success: false,
      error: "Failed to save profile. Please try again.",
    };
  }
}

export async function uploadFanAvatar(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };

  const validationError = validateImageFile(file, 5 * 1024 * 1024);
  if (validationError) return validationError;

  const existing = await prisma.fanProfile.findUnique({
    where: { userId: user.id },
    select: { avatarPath: true },
  });

  const path = buildUserAvatarPath(user.id, file);

  const { data, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  const url = getPublicMediaUrl(data.path);

  try {
    await prisma.fanProfile.update({
      where: { userId: user.id },
      data: { avatar: url, avatarPath: data.path },
    });
  } catch {
    await supabase.storage.from(BUCKET).remove([data.path]);
    return { error: "Image uploaded but failed to save. Please try again." };
  }

  if (existing?.avatarPath) {
    await supabase.storage.from(BUCKET).remove([existing.avatarPath]);
  }

  revalidatePath("/fan/profile");
  revalidatePath("/fan/settings");
  revalidatePath("/account");
  return { url };
}

// ── Venue CRUD Operations ─────────────────────────────────────────────────────

const VenueInputSchema = z.object({
  djProfileId: z.number().int().positive(),
  venueName: z.string().min(1).max(100),
  eventDate: z.string().max(20).nullable().optional(),
  description: z.string().max(300).nullable().optional(),
  countryId: z.number().int().positive(),
  cityId: z.number().int().positive(),
});

const VenueUpdateSchema = z.object({
  id: z.number().int().positive(),
  venueName: z.string().min(1).max(100),
  eventDate: z.string().max(20).nullable().optional(),
  description: z.string().max(300).nullable().optional(),
  countryId: z.number().int().positive(),
  cityId: z.number().int().positive(),
});

export async function addVenue(input: {
  djProfileId: number;
  venueName: string;
  eventDate: string | null;
  description: string | null;
  countryId: number;
  cityId: number;
}): Promise<{ success: true; venue: { id: number } } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // Validate input
  const parsed = VenueInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error:
        "Validation failed: " +
        parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const djProfile = await prisma.djProfile.findUnique({
    where: { id: input.djProfileId },
    select: { userId: true },
  });
  if (!djProfile || djProfile.userId !== user.id) {
    return { error: "Not authorized." };
  }

  // Validate city/country consistency
  const city = await prisma.city.findFirst({
    where: { id: input.cityId, countryId: input.countryId },
    select: { id: true },
  });
  if (!city) {
    return {
      error: "The selected city does not belong to the selected country.",
    };
  }

  try {
    const venue = await prisma.djVenue.create({
      data: {
        djProfileId: input.djProfileId,
        venueName: input.venueName,
        eventDate: input.eventDate,
        description: input.description,
        countryId: input.countryId,
        cityId: input.cityId,
      },
      select: { id: true },
    });

    revalidatePath(`/djs`);
    revalidatePath(`/djs/[slug]`);
    return { success: true, venue };
  } catch (error) {
    console.error("Failed to add venue:", error);
    return { error: "Failed to add venue. Please try again." };
  }
}

export async function updateVenue(input: {
  id: number;
  venueName: string;
  eventDate: string | null;
  description: string | null;
  countryId: number;
  cityId: number;
}): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // Validate input
  const parsed = VenueUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error:
        "Validation failed: " +
        parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const venue = await prisma.djVenue.findUnique({
    where: { id: input.id },
    select: { djProfile: { select: { userId: true } } },
  });
  if (!venue || venue.djProfile.userId !== user.id) {
    return { error: "Not authorized." };
  }

  // Validate city/country consistency
  const city = await prisma.city.findFirst({
    where: { id: input.cityId, countryId: input.countryId },
    select: { id: true },
  });
  if (!city) {
    return {
      error: "The selected city does not belong to the selected country.",
    };
  }

  try {
    await prisma.djVenue.update({
      where: { id: input.id },
      data: {
        venueName: input.venueName,
        eventDate: input.eventDate,
        description: input.description,
        countryId: input.countryId,
        cityId: input.cityId,
      },
    });

    revalidatePath(`/djs`);
    revalidatePath(`/djs/[slug]`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update venue:", error);
    return { error: "Failed to update venue. Please try again." };
  }
}

export async function deleteVenue(
  venueId: number,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const venue = await prisma.djVenue.findUnique({
    where: { id: venueId },
    select: { djProfile: { select: { userId: true } } },
  });
  if (!venue || venue.djProfile.userId !== user.id) {
    return { error: "Not authorized." };
  }

  try {
    await prisma.djVenue.delete({
      where: { id: venueId },
    });

    revalidatePath(`/djs`);
    revalidatePath(`/djs/[slug]`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete venue:", error);
    return { error: "Failed to delete venue. Please try again." };
  }
}
