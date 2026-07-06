"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import {
  BUCKET,
  getPublicMediaUrl,
  validateImageFile,
  buildEventPosterPath,
  buildEventGalleryPath,
} from "@/lib/storage";
import { requireEventOwner } from "@/lib/auth/require-owner";

const MAX_POSTER_BYTES_FREE = 5 * 1024 * 1024; // 5 MB
const MAX_POSTER_BYTES_PREMIUM = 10 * 1024 * 1024; // 10 MB
const MAX_GALLERY_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_GALLERY_BYTES_PREMIUM = 10 * 1024 * 1024; // 10 MB
const GALLERY_LIMIT_FREE = 12;
const GALLERY_LIMIT_PREMIUM = 40;

// ── uploadEventPoster ─────────────────────────────────────────────────────────
// Validates, uploads to events/{eventId}/poster/, updates Event.posterUrl
// + Event.posterPath, and deletes the previous poster from storage.

export async function uploadEventPoster(
  formData: FormData,
): Promise<{ url: string; path: string } | { error: string }> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };

  const eventIdRaw = formData.get("eventId");
  const eventId = Number(eventIdRaw);
  if (!eventId || isNaN(eventId)) return { error: "Invalid event ID." };

  const { djProfileId } = await requireEventOwner(eventId);

  const djProfile = await prisma.djProfile.findUnique({
    where: { id: djProfileId },
    select: { plan: true },
  });
  if (!djProfile) return { error: "DJ profile not found." };

  const event = await prisma.event.findUnique({
    where: { id: eventId, deletedAt: null },
    select: { posterPath: true },
  });
  if (!event) return { error: "Event not found." };

  const maxBytes =
    djProfile.plan === "PREMIUM"
      ? MAX_POSTER_BYTES_PREMIUM
      : MAX_POSTER_BYTES_FREE;

  const validationError = validateImageFile(file, maxBytes);
  if (validationError) return validationError;

  const path = buildEventPosterPath(String(eventId), file);

  const supabase = await createClient();
  const { data, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  const url = getPublicMediaUrl(data.path);

  try {
    await prisma.event.update({
      where: { id: eventId },
      data: { posterUrl: url, posterPath: data.path },
    });
  } catch {
    await supabase.storage.from(BUCKET).remove([data.path]);
    return { error: "Image uploaded but failed to save. Please try again." };
  }

  if (event.posterPath && event.posterPath !== data.path) {
    await supabase.storage
      .from(BUCKET)
      .remove([event.posterPath])
      .catch(() => {});
  }

  return { url, path: data.path };
}

// ── uploadEventGalleryImage ───────────────────────────────────────────────────
// Validates, checks plan gallery limit, uploads to events/{eventId}/gallery/,
// and creates an EventMedia record.
// Only allowed when event status is COMPLETED.

export async function uploadEventGalleryImage(
  formData: FormData,
): Promise<{ id: number; url: string; path: string } | { error: string }> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };

  const eventIdRaw = formData.get("eventId");
  const eventId = Number(eventIdRaw);
  if (!eventId || isNaN(eventId)) return { error: "Invalid event ID." };

  const { djProfileId } = await requireEventOwner(eventId);

  const djProfile = await prisma.djProfile.findUnique({
    where: { id: djProfileId },
    select: { plan: true },
  });
  if (!djProfile) return { error: "DJ profile not found." };

  const event = await prisma.event.findUnique({
    where: { id: eventId, deletedAt: null },
    select: { status: true },
  });
  if (!event) return { error: "Event not found." };
  if (event.status !== "COMPLETED") {
    return {
      error: "Gallery uploads are only allowed after the event is completed.",
    };
  }

  const isPremium = djProfile.plan === "PREMIUM";
  const limit = isPremium ? GALLERY_LIMIT_PREMIUM : GALLERY_LIMIT_FREE;
  const maxBytes = isPremium ? MAX_GALLERY_BYTES_PREMIUM : MAX_GALLERY_BYTES;

  const existingCount = await prisma.eventMedia.count({
    where: { eventId },
  });
  if (existingCount >= limit) {
    return {
      error: `Gallery limit reached (${limit} photos on your current plan).`,
    };
  }

  const validationError = validateImageFile(file, maxBytes);
  if (validationError) return validationError;

  const path = buildEventGalleryPath(String(eventId), file);

  const supabase = await createClient();
  const { data, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  const url = getPublicMediaUrl(data.path);

  try {
    const media = await prisma.eventMedia.create({
      data: {
        eventId,
        url,
        path: data.path,
        sortOrder: existingCount,
      },
      select: { id: true, url: true, path: true },
    });
    return { id: media.id, url: media.url, path: media.path };
  } catch {
    await supabase.storage.from(BUCKET).remove([data.path]);
    return { error: "Image uploaded but failed to save. Please try again." };
  }
}

// ── deleteEventGalleryImage ───────────────────────────────────────────────────
// Verifies ownership via EventMedia → Event → ownerDjId chain,
// removes the file from Supabase Storage (best-effort),
// and deletes the EventMedia record.

export async function deleteEventGalleryImage(
  mediaId: number,
): Promise<{ success: true } | { error: string }> {
  const media = await prisma.eventMedia.findUnique({
    where: { id: mediaId },
    select: { eventId: true, path: true },
  });

  if (!media) return { error: "Gallery image not found." };

  await requireEventOwner(media.eventId);

  const supabase = await createClient();
  await supabase.storage
    .from(BUCKET)
    .remove([media.path])
    .catch(() => {});

  await prisma.eventMedia.delete({ where: { id: mediaId } });

  return { success: true as const };
}
