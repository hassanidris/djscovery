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
import {
  BUCKET,
  getPublicMediaUrl,
  validateImageFile,
  buildDjGalleryPath,
} from "@/lib/storage";
import { uploadDjGalleryImage } from "@/lib/actions/dj-upload";
import { revalidatePath } from "next/cache";

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
  playCount?: number;
  viewCount?: number;
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

// ── createDjMedia ───────────────────────────────────────────────────────────
// Unified create for IMAGE, VIDEO, and AUDIO. For IMAGE, expects a "file" field.
// For VIDEO/AUDIO, expects a "url" field. Auto-fetches oEmbed metadata.

export async function createDjMedia(
  formData: FormData,
): Promise<{ success: true; media: MediaItem } | { error: string }> {
  const session = await getCurrentUserDjProfile();
  if (!session) return { error: "Not authenticated or DJ profile not found" };

  const type = formData.get("type")?.toString();
  const title = formData.get("title")?.toString().trim();
  const isSpotlight = formData.get("isSpotlight") === "true";

  if (!type || !isMediaType(type)) return { error: "Invalid media type" };
  if (!title) return { error: "Title is required" };

  const plan = normalisePlan(session.profile.plan);

  // IMAGE: upload file via existing helper
  if (type === "IMAGE") {
    const result = await uploadDjGalleryImage(formData);
    if ("error" in result) return { error: result.error };

    const media = await prisma.media.update({
      where: { id: result.id },
      data: { title, isSpotlight },
    });

    return { success: true, media };
  }

  // VIDEO/AUDIO: validate external URL and plan limits
  const url = formData.get("url")?.toString();
  if (!url) return { error: "URL is required" };

  const parse = AddMediaUrlSchema.safeParse({ url, type });
  if (!parse.success) return { error: "Invalid URL or type" };

  const limit = getMediaLimit(plan, type.toLowerCase() as "videos" | "audio");
  if (limit !== Infinity) {
    const currentCount = await prisma.media.count({
      where: {
        djProfileId: session.profile.id,
        type: { in: ["VIDEO", "AUDIO"] },
      },
    });
    if (currentCount >= limit) {
      return {
        error: `Your ${plan} plan allows up to ${limit} video/audio items. Upgrade to Premium for unlimited.`,
      };
    }
  }

  let finalIsSpotlight = isSpotlight;
  if (isSpotlight) {
    const currentSpotlightCount = await prisma.media.count({
      where: {
        djProfileId: session.profile.id,
        isSpotlight: true,
        type: { in: ["VIDEO", "AUDIO"] },
      },
    });
    if (plan === "FREE") {
      // Free plan: auto-spotlight if under limit, otherwise silently disable
      finalIsSpotlight = currentSpotlightCount < MAX_SPOTLIGHT_ITEMS;
    } else if (currentSpotlightCount >= MAX_SPOTLIGHT_ITEMS) {
      return {
        error: `You can only spotlight up to ${MAX_SPOTLIGHT_ITEMS} items`,
      };
    }
  }

  const oembed = await fetchOEmbed(url);
  const fallback = generateFallbackMetadata(url, type);

  const maxOrder = await prisma.media.findFirst({
    where: { djProfileId: session.profile.id },
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
      thumbnail: oembed?.thumbnail_url || fallback.thumbnail || null,
      duration: formatDuration(oembed?.duration) || fallback.duration,
      djProfileId: session.profile.id,
      isSpotlight: finalIsSpotlight,
      sortOrder: nextSortOrder,
    },
  });

  return { success: true, media };
}

// ── updateDjMediaItem ───────────────────────────────────────────────────────
// Updates title, spotlight, URL (video/audio), and file (image) for a media item.

export async function updateDjMediaItem(
  mediaId: number,
  formData: FormData,
): Promise<{ success: true; media: MediaItem } | { error: string }> {
  const session = await getCurrentUserDjProfile();
  if (!session) return { error: "Not authenticated or DJ profile not found" };

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    include: { djProfile: { select: { userId: true, plan: true } } },
  });
  if (!media) return { error: "Media not found" };
  if (media.djProfile?.userId !== session.user.id)
    return { error: "Unauthorized" };

  const title = formData.get("title")?.toString().trim();
  const isSpotlight = formData.get("isSpotlight") === "true";

  if (!title) return { error: "Title is required" };

  const updateData: {
    title: string;
    url?: string;
    path?: string;
    bucket?: string;
    thumbnail?: string | null;
    duration?: string | null;
    isSpotlight?: boolean;
  } = { title };

  // Spotlight toggle (only for video/audio in current schema)
  if (isSpotlight !== media.isSpotlight && media.type !== "IMAGE") {
    const plan = normalisePlan(media.djProfile?.plan);
    if (plan === "FREE") {
      return { error: "Spotlight selection is available on Premium plan only" };
    }
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
    updateData.isSpotlight = isSpotlight;
  }

  // URL update for video/audio
  if (media.type === "VIDEO" || media.type === "AUDIO") {
    const url = formData.get("url")?.toString();
    if (url && url !== media.url) {
      const parse = AddMediaUrlSchema.safeParse({ url, type: media.type });
      if (!parse.success) return { error: "Invalid URL" };

      const oembed = await fetchOEmbed(url);
      const fallback = generateFallbackMetadata(url, media.type);

      updateData.url = url;
      updateData.path = url;
      updateData.thumbnail =
        oembed?.thumbnail_url || fallback.thumbnail || null;
      updateData.duration =
        formatDuration(oembed?.duration) || fallback.duration;
    }
  }

  // File replacement for image
  if (media.type === "IMAGE") {
    const file = formData.get("file");
    if (file instanceof File && file.size > 0) {
      const validationError = validateImageFile(file, 10 * 1024 * 1024);
      if (validationError) return validationError;

      const supabase = await createClient();
      const path = buildDjGalleryPath(session.user.id, file);

      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type });

      if (uploadError)
        return { error: `Upload failed: ${uploadError.message}` };

      updateData.url = getPublicMediaUrl(data.path);
      updateData.path = data.path;
      updateData.bucket = BUCKET;

      if (media.bucket !== "external" && media.path) {
        await supabase.storage
          .from(media.bucket)
          .remove([media.path])
          .catch(() => {});
      }
    }
  }

  const updatedMedia = await prisma.media.update({
    where: { id: mediaId },
    data: updateData,
  });

  // Revalidate cached DJ profile page
  const slug = await getCurrentDjSlug();
  if ("slug" in slug) {
    revalidatePath(`/djs/${slug.slug}`);
  }

  return { success: true, media: updatedMedia };
}

// ── getCurrentDjSlug ──────────────────────────────────────────────────────────
// Returns the current user's DJ profile slug.

export async function getCurrentDjSlug(): Promise<
  { slug: string } | { error: string }
> {
  const session = await getCurrentUserDjProfile();
  if (!session) return { error: "Not authenticated or DJ profile not found" };

  const profile = await prisma.djProfile.findUnique({
    where: { id: session.profile.id },
    select: { slug: true },
  });

  if (!profile?.slug) return { error: "DJ profile not found" };
  return { slug: profile.slug };
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
