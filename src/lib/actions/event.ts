"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { z } from "zod";
import { VALID_EVENT_CATEGORIES } from "@/lib/event-categories";
import { isValidTimezone } from "@/lib/timezones";
import { requireEventOwner } from "@/lib/auth/require-owner";
import { sendEmail } from "@/lib/email/send";
import type { NewEventData } from "@/lib/email/types";
import { revalidatePath } from "next/cache";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://djscovery.com";

// ── Slug helpers ──────────────────────────────────────────────────────────────

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

async function makeUniqueEventSlug(
  djSlug: string,
  title: string,
  excludeId?: number,
): Promise<string> {
  const base = `${djSlug}-${slugifyTitle(title)}`;
  const existing = await prisma.event.findMany({
    where: {
      slug: { startsWith: base },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { slug: true },
  });
  const taken = new Set(existing.map((e) => e.slug));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

// ── Auth + ownership helpers ──────────────────────────────────────────────────

async function getAuthUserAndDjProfile(): Promise<
  | { error: string }
  | {
      djProfile: {
        id: number;
        slug: string;
        plan: string;
        userId: string;
        stageName: string;
      };
    }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const djProfile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, slug: true, plan: true, userId: true, stageName: true },
  });
  if (!djProfile) return { error: "DJ profile not found" };

  return { djProfile };
}

// ── Zod schemas ───────────────────────────────────────────────────────────────

const CreateEventSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  eventType: z.enum(["PUBLIC", "PRIVATE"]),
  category: z.enum(VALID_EVENT_CATEGORIES),
  startDate: z.coerce.date({
    errorMap: () => ({ message: "Invalid start date" }),
  }),
  endDate: z.coerce.date().optional().nullable(),
  countryId: z.number().int().positive({ message: "Country is required" }),
  cityId: z.number().int().positive().optional().nullable(),
  venue: z.string().max(100).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format")
    .optional()
    .nullable(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format")
    .optional()
    .nullable(),
  ticketUrl: z.string().url("Invalid ticket URL").optional().nullable(),
  genres: z.array(z.string().min(1).max(50)).max(8).default([]),
  timezone: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .refine((tz) => !tz || isValidTimezone(tz), "Invalid timezone"),
});

const UpdateEventSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  eventType: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  category: z.enum(VALID_EVENT_CATEGORIES).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  countryId: z.number().int().positive().optional(),
  cityId: z.number().int().positive().optional().nullable(),
  venue: z.string().max(100).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .nullable(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .nullable(),
  timezone: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .refine((tz) => !tz || isValidTimezone(tz), "Invalid timezone"),
  ticketUrl: z.string().url().optional().nullable(),
  genres: z.array(z.string().min(1).max(50)).max(8).optional(),
  recap: z.string().max(2000).optional().nullable(),
  audioLink: z.string().url("Invalid audio link URL").optional().nullable(),
  videoLink: z.string().url("Invalid video link URL").optional().nullable(),
  featured: z.boolean().optional(),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;

// ── Actions ───────────────────────────────────────────────────────────────────

export async function createEvent(
  input: unknown,
): Promise<{ error: string } | { success: true; id: number; slug: string }> {
  const auth = await getAuthUserAndDjProfile();
  if ("error" in auth) return auth;
  const { djProfile } = auth;

  const parsed = CreateEventSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const {
    title,
    eventType,
    category,
    startDate,
    endDate,
    countryId,
    cityId,
    venue,
    description,
    startTime,
    endTime,
    timezone,
    ticketUrl,
    genres,
  } = parsed.data;

  if (cityId) {
    const city = await prisma.city.findFirst({
      where: { id: cityId, countryId },
      select: { id: true },
    });
    if (!city)
      return { error: "Selected city does not belong to selected country." };
  }

  const slug = await makeUniqueEventSlug(djProfile.slug, title);

  const event = await prisma.event.create({
    data: {
      slug,
      title,
      eventType,
      category,
      startDate,
      endDate: endDate ?? null,
      countryId,
      cityId: cityId ?? null,
      venue: venue ?? null,
      description: description ?? null,
      startTime: startTime ?? null,
      endTime: endTime ?? null,
      timezone: timezone ?? null,
      ticketUrl: eventType === "PUBLIC" ? (ticketUrl ?? null) : null,
      genres,
      status: "DRAFT",
      ownerDjId: djProfile.id,
    },
    select: { id: true, slug: true },
  });

  return { success: true, id: event.id, slug: event.slug };
}

// ─────────────────────────────────────────────────────────────────────────────

export async function updateEvent(
  eventId: number,
  input: unknown,
): Promise<{ error: string } | { success: true; slug: string }> {
  const auth = await getAuthUserAndDjProfile();
  if ("error" in auth) return auth;
  const { djProfile } = auth;

  const ownership = await requireEventOwner(eventId);
  if ("error" in ownership) return ownership;
  const { djProfileId } = ownership;

  const event = await prisma.event.findUnique({
    where: { id: eventId, deletedAt: null },
    select: { status: true, startDate: true, featured: true },
  });
  if (!event) return { error: "Event not found" };

  const parsed = UpdateEventSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const isPast = event.startDate < new Date();

  // Fields locked once the event has passed
  const lockedFields: Array<keyof UpdateEventInput> = [
    "startDate",
    "eventType",
    "countryId",
    "cityId",
  ];

  if (isPast) {
    for (const field of lockedFields) {
      if (parsed.data[field] !== undefined) {
        return {
          error: `Cannot change "${field}" after the event date has passed.`,
        };
      }
    }
  }

  // Featured cap: Free plan max 3 featured events
  if (parsed.data.featured === true && !event.featured) {
    const featuredCount = await prisma.event.count({
      where: {
        ownerDjId: djProfileId,
        featured: true,
        deletedAt: null,
        status: { in: ["PUBLISHED", "COMPLETED"] },
      },
    });
    if (featuredCount >= 3) {
      return {
        error:
          "You already have 3 featured performances. Unfeature one before adding another.",
      };
    }
  }

  // Regenerate slug if title changed and event is still a DRAFT
  let newSlug: string | undefined;
  if (parsed.data.title && event.status === "DRAFT") {
    newSlug = await makeUniqueEventSlug(
      djProfile.slug,
      parsed.data.title,
      eventId,
    );
  }

  const { featured, ...rest } = parsed.data;

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...rest,
      ...(newSlug ? { slug: newSlug } : {}),
      // Wipe ticketUrl if event type is being changed to PRIVATE
      ...(parsed.data.eventType === "PRIVATE" ? { ticketUrl: null } : {}),
      ...(parsed.data.featured !== undefined
        ? { featured: parsed.data.featured }
        : {}),
    },
    select: { slug: true },
  });

  // Revalidate cached pages
  revalidatePath(`/events/${updated.slug}`);
  revalidatePath("/events");
  revalidatePath("/");

  return { success: true, slug: updated.slug };
}

// ─────────────────────────────────────────────────────────────────────────────

export async function publishEvent(
  eventId: number,
): Promise<{ error: string } | { success: true; slug: string }> {
  const auth = await getAuthUserAndDjProfile();
  if ("error" in auth) return auth;
  const { djProfile } = auth;

  const ownership = await requireEventOwner(eventId);
  if ("error" in ownership) return ownership;
  const { djProfileId } = ownership;

  const event = await prisma.event.findUnique({
    where: { id: eventId, deletedAt: null },
    select: { status: true },
  });
  if (!event) return { error: "Event not found" };

  if (event.status === "PUBLISHED")
    return { error: "Event is already published." };
  if (event.status === "ARCHIVED")
    return { error: "Restore the event to draft before publishing." };

  // Fetch full event to validate required fields
  const full = await prisma.event.findUnique({
    where: { id: eventId },
    select: { title: true, category: true, startDate: true, countryId: true },
  });
  if (!full) return { error: "Event not found." };
  if (!full.title || !full.category || !full.startDate || !full.countryId) {
    return { error: "Please fill in all required fields before publishing." };
  }

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: { status: "PUBLISHED" },
    select: { slug: true },
  });

  // Fan-out DJ_NEW_EVENT notifications to all followers (non-blocking)
  try {
    const followers = await prisma.follower.findMany({
      where: { followingId: djProfile.userId },
      select: { followerId: true },
    });

    if (followers.length > 0) {
      await prisma.notification.createMany({
        data: followers.map((f) => ({
          type: "DJ_NEW_EVENT" as const,
          recipientId: f.followerId,
          senderId: djProfile.userId,
          data: {
            eventId,
            eventSlug: updated.slug,
            djSlug: djProfile.slug,
            djName: djProfile.stageName,
          },
        })),
        skipDuplicates: true,
      });

      // Send email notifications to followers (non-blocking)
      const followersWithEmails = await prisma.user.findMany({
        where: { id: { in: followers.map((f) => f.followerId) } },
        select: { id: true, email: true, name: true },
      });

      const eventDate = full.startDate.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // Send emails in parallel (failures don't block publish)
      await Promise.allSettled(
        followersWithEmails.map(async (follower) => {
          if (follower.email) {
            try {
              const emailData: NewEventData = {
                djName: djProfile.stageName,
                eventTitle: full.title,
                eventDate,
                eventCategory: full.category,
                eventUrl: `${SITE_URL}/events/${updated.slug}`,
              };
              await sendEmail(follower.email, "NEW_EVENT", emailData);
            } catch (emailError) {
              console.error("Failed to send new event email:", emailError);
            }
          }
        }),
      );
    }
  } catch {
    // Notification failures must never block publish
  }

  // Revalidate cached pages
  revalidatePath(`/events/${updated.slug}`);
  revalidatePath("/events");
  revalidatePath("/");
  revalidatePath("/sitemap");

  return { success: true, slug: updated.slug };
}

// ─────────────────────────────────────────────────────────────────────────────

export async function unpublishEvent(
  eventId: number,
): Promise<{ error: string } | { success: true }> {
  const auth = await getAuthUserAndDjProfile();
  if ("error" in auth) return auth;

  const ownership = await requireEventOwner(eventId);
  if ("error" in ownership) return ownership;

  await prisma.event.update({
    where: { id: eventId },
    data: { status: "DRAFT" },
  });

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────

export async function cancelEvent(
  eventId: number,
): Promise<{ error: string } | { success: true }> {
  const auth = await getAuthUserAndDjProfile();
  if ("error" in auth) return auth;

  const ownership = await requireEventOwner(eventId);
  if ("error" in ownership) return ownership;
  const { djProfileId } = ownership;

  const event = await prisma.event.findUnique({
    where: { id: eventId, deletedAt: null },
    select: { status: true },
  });
  if (!event) return { error: "Event not found" };

  if (event.status !== "PUBLISHED") {
    return { error: "Only published events can be cancelled." };
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { status: "CANCELLED" },
  });

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────

export async function archiveEvent(
  eventId: number,
): Promise<{ error: string } | { success: true }> {
  const auth = await getAuthUserAndDjProfile();
  if ("error" in auth) return auth;

  const ownership = await requireEventOwner(eventId);
  if ("error" in ownership) return ownership;
  const { djProfileId } = ownership;

  const event = await prisma.event.findUnique({
    where: { id: eventId, deletedAt: null },
    select: { status: true },
  });
  if (!event) return { error: "Event not found" };

  if (event.status === "PUBLISHED") {
    return { error: "Unpublish the event before archiving." };
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { status: "ARCHIVED" },
  });

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────

export async function deleteEvent(
  eventId: number,
): Promise<{ error: string } | { success: true }> {
  const auth = await getAuthUserAndDjProfile();
  if ("error" in auth) return auth;

  const ownership = await requireEventOwner(eventId);
  if ("error" in ownership) return ownership;

  await prisma.event.update({
    where: { id: eventId },
    data: { deletedAt: new Date(), featured: false },
  });

  return { success: true };
}
