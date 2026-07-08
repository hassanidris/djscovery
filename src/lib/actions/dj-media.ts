"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getMediaLimit, normalisePlan } from "@/lib/plan-features";
import {
  fetchOEmbed,
  formatDuration,
  generateFallbackMetadata,
} from "@/lib/oembed";
import { BUCKET } from "@/lib/storage";

const MAX_SPOTLIGHT_ITEMS = 2;

const MediaTypeEnum = z.enum(["IMAGE", "VIDEO", "AUDIO"]);

const AddMediaUrlSchema = z.object({
  url: z.string().url(),
  type: z.enum(["VIDEO", "AUDIO"]),
});

const ReorderMediaSchema = z.array(
  z.object({
    id: z.number(),
    sortOrder: z.number(),
  }),
);

const ToggleSpotlightSchema = z.object({
  mediaId: z.number(),
  isSpotlight: z.boolean(),
});

function isMediaType(type: string): type is "IMAGE" | "VIDEO" | "AUDIO" {
  return type === "IMAGE" || type === "VIDEO" || type === "AUDIO";
}

async function getCurrentUserDjProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, plan: true },
  });

  if (!profile) return null;
  return { user, profile };
}

// ── addDjMediaUrl ───────────────────────────────────────────────────────────
// Adds a video/audio URL from external platforms (YouTube, Vimeo, SoundCloud, etc.)
// Fetches oEmbed metadata and creates a Media record.

export async function addDjMediaUrl(
  formData: FormData,
): Promise<{ success: true; media: MediaItem } | { error: string }> {
  const session = await getCurrentUserDjProfile();
  if (!session) return { error: "Not authenticated or DJ profile not found" };
  const { profile } = session;

  const parse = AddMediaUrlSchema.safeParse({
    url: formData.get("url"),
    type: formData.get("type"),
  });
  if (!parse.success) return { error: "Invalid URL or type" };

  const { url, type } = parse.data;
  const plan = normalisePlan(profile.plan);
  const limit = getMediaLimit(plan, type.toLowerCase() as "videos" | "audio");

  if (limit !== Infinity) {
    const currentCount = await prisma.media.count({
      where: {
        djProfileId: profile.id,
        type: { in: ["VIDEO", "AUDIO"] },
      },
    });
    if (currentCount >= limit) {
      return {
        error: `Your ${plan} plan allows up to ${limit} video/audio items. Upgrade to Premium for unlimited.`,
      };
    }
  }

  const oembed = await fetchOEmbed(url);
  const fallback = generateFallbackMetadata(url, type);

  const title = oembed?.title || fallback.title;
  const thumbnail = oembed?.thumbnail_url || fallback.thumbnail || null;
  const duration = formatDuration(oembed?.duration) || fallback.duration;

  // Free plan: auto-mark as spotlight if under limit and no other spotlight items
  const existingSpotlightCount = await prisma.media.count({
    where: {
      djProfileId: profile.id,
      isSpotlight: true,
      type: { in: ["VIDEO", "AUDIO"] },
    },
  });
  const shouldAutoSpotlight =
    plan === "FREE" && existingSpotlightCount < MAX_SPOTLIGHT_ITEMS;

  const maxOrder = await prisma.media.findFirst({
    where: { djProfileId: profile.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const nextSortOrder = (maxOrder?.sortOrder ?? 0) + 1;

  const media = await prisma.media.create({
    data: {
      type,
      url,
      path: url,
      bucket: "external",
      title,
      thumbnail,
      duration,
      djProfileId: profile.id,
      isSpotlight: shouldAutoSpotlight,
      sortOrder: nextSortOrder,
    },
  });

  return { success: true, media };
}

export type MediaItem = {
  id: number;
  type: "IMAGE" | "VIDEO" | "AUDIO";
  url: string;
  bucket: string;
  path: string;
  sortOrder: number;
  isSpotlight: boolean;
  title: string | null;
  duration: string | null;
  thumbnail: string | null;
  createdAt: Date;
};

// ── deleteMediaItem ─────────────────────────────────────────────────────────
// Deletes any Media record (image, video, audio) and removes uploaded files from storage.

export async function deleteMediaItem(
  mediaId: number,
): Promise<{ success: true } | { error: string }> {
  const session = await getCurrentUserDjProfile();
  if (!session) return { error: "Not authenticated or DJ profile not found" };

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    include: { djProfile: { select: { userId: true } } },
  });
  if (!media) return { error: "Media not found" };
  if (media.djProfile?.userId !== session.user.id)
    return { error: "Unauthorized" };

  if (media.bucket !== "external" && media.path) {
    const supabase = await createClient();
    await supabase.storage
      .from(media.bucket)
      .remove([media.path])
      .catch(() => {});
  }

  await prisma.media.delete({ where: { id: mediaId } });
  return { success: true };
}

// ── reorderMediaItems ───────────────────────────────────────────────────────
// Updates sortOrder for media items. Expects { id, sortOrder } pairs in order.

export async function reorderMediaItems(
  items: { id: number; sortOrder: number }[],
): Promise<{ success: true } | { error: string }> {
  const session = await getCurrentUserDjProfile();
  if (!session) return { error: "Not authenticated or DJ profile not found" };

  const parse = ReorderMediaSchema.safeParse(items);
  if (!parse.success) return { error: "Invalid reorder data" };

  const ids = parse.data.map((i) => i.id);
  const media = await prisma.media.findMany({
    where: { id: { in: ids }, djProfileId: session.profile.id },
    select: { id: true },
  });
  if (media.length !== ids.length) return { error: "Unauthorized" };

  await prisma.$transaction(
    parse.data.map((item) =>
      prisma.media.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    ),
  );

  return { success: true };
}

// ── toggleSpotlight ─────────────────────────────────────────────────────────
// Toggles isSpotlight on a media item. Enforces max 2 spotlight items for premium.
// Free plan cannot manually toggle (auto-managed on add).

export async function toggleSpotlight(
  mediaId: number,
  isSpotlight: boolean,
): Promise<{ success: true } | { error: string }> {
  const session = await getCurrentUserDjProfile();
  if (!session) return { error: "Not authenticated or DJ profile not found" };

  const plan = normalisePlan(session.profile.plan);
  if (plan === "FREE") {
    return { error: "Spotlight selection is available on Premium plan only" };
  }

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    include: { djProfile: { select: { userId: true } } },
  });
  if (!media) return { error: "Media not found" };
  if (media.djProfile?.userId !== session.user.id)
    return { error: "Unauthorized" };
  if (!["VIDEO", "AUDIO"].includes(media.type))
    return { error: "Only video and audio can be spotlighted" };

  if (isSpotlight) {
    const currentSpotlightCount = await prisma.media.count({
      where: {
        djProfileId: session.profile.id,
        isSpotlight: true,
        type: { in: ["VIDEO", "AUDIO"] },
      },
    });
    if (currentSpotlightCount >= MAX_SPOTLIGHT_ITEMS) {
      return {
        error: `You can only spotlight up to ${MAX_SPOTLIGHT_ITEMS} items`,
      };
    }
  }

  await prisma.media.update({
    where: { id: mediaId },
    data: { isSpotlight },
  });

  return { success: true };
}

// ── getDjMedia ──────────────────────────────────────────────────────────────
// Returns all media for the current DJ's profile, sorted by sortOrder.

export async function getDjMedia(): Promise<
  { media: MediaItem[] } | { error: string }
> {
  const session = await getCurrentUserDjProfile();
  if (!session) return { error: "Not authenticated or DJ profile not found" };

  const media = await prisma.media.findMany({
    where: { djProfileId: session.profile.id },
    orderBy: { sortOrder: "asc" },
  });

  return { media };
}

// ── getDjSpotlightMedia ───────────────────────────────────────────────────
// Returns spotlight media for a DJ profile (public, no auth required).

export async function getDjSpotlightMedia(
  djProfileId: number,
): Promise<MediaItem[]> {
  const media = await prisma.media.findMany({
    where: {
      djProfileId,
      isSpotlight: true,
      type: { in: ["VIDEO", "AUDIO"] },
    },
    orderBy: { sortOrder: "asc" },
    take: MAX_SPOTLIGHT_ITEMS,
  });

  return media;
}

// ── getDjGalleryImages ────────────────────────────────────────────────────
// Returns image media for a DJ profile (public, no auth required).

export async function getDjGalleryImages(
  djProfileId: number,
): Promise<MediaItem[]> {
  const media = await prisma.media.findMany({
    where: {
      djProfileId,
      type: "IMAGE",
    },
    orderBy: { sortOrder: "asc" },
  });

  return media;
}
