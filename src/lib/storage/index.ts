// ============================================================
// DJcovery Storage Utility Layer
// Bucket: djscovery-media (single public bucket)
//
// Folder structure:
//   djs/{userId}/avatar/
//   djs/{userId}/cover/
//   djs/{userId}/gallery/
//   organizers/{userId}/logo/
//   organizers/{userId}/cover/
//   events/{eventId}/poster/
//   events/{eventId}/gallery/
//
// All uploads go through server actions in:
//   src/lib/actions/dj-upload.ts
//   src/lib/actions/organizer-upload.ts
//
// NOTE: userId (Supabase Auth UUID) is used as the folder identifier
// for both DJ and Organizer paths. This avoids a chicken-and-egg problem
// during initial profile creation (DB integer id does not exist yet) and
// remains stable across profile recreations.
// ============================================================

export const BUCKET = "djscovery-media" as const;

// ── Public URL helper ─────────────────────────────────────────────────────────

export function getPublicMediaUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${path}`;
}

// ── Allowed MIME types ────────────────────────────────────────────────────────

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

// ── File validation ───────────────────────────────────────────────────────────

export function validateImageFile(
  file: File,
  maxBytes: number,
): { error: string } | null {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return { error: "Only JPEG, PNG, and WebP images are allowed." };
  }
  if (file.size > maxBytes) {
    const maxMB = Math.round(maxBytes / (1024 * 1024));
    return { error: `Image must be under ${maxMB} MB.` };
  }
  return null;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function fileExt(file: File): string {
  return file.name.split(".").pop()?.toLowerCase() ?? "jpg";
}

// ── Path builders ─────────────────────────────────────────────────────────────

export function buildDjAvatarPath(userId: string, file: File): string {
  return `djs/${userId}/avatar/avatar-${crypto.randomUUID()}.${fileExt(file)}`;
}

export function buildDjCoverPath(userId: string, file: File): string {
  return `djs/${userId}/cover/cover-${crypto.randomUUID()}.${fileExt(file)}`;
}

export function buildDjGalleryPath(userId: string, file: File): string {
  return `djs/${userId}/gallery/gallery-${crypto.randomUUID()}.${fileExt(file)}`;
}

export function buildOrganizerLogoPath(userId: string, file: File): string {
  return `organizers/${userId}/logo/logo-${crypto.randomUUID()}.${fileExt(file)}`;
}

export function buildOrganizerCoverPath(userId: string, file: File): string {
  return `organizers/${userId}/cover/cover-${crypto.randomUUID()}.${fileExt(file)}`;
}

export function buildUserAvatarPath(userId: string, file: File): string {
  return `users/${userId}/avatar/avatar-${crypto.randomUUID()}.${fileExt(file)}`;
}

export function buildEventPosterPath(eventId: string, file: File): string {
  return `events/${eventId}/poster/poster-${crypto.randomUUID()}.${fileExt(file)}`;
}

export function buildEventGalleryPath(eventId: string, file: File): string {
  return `events/${eventId}/gallery/gallery-${crypto.randomUUID()}.${fileExt(file)}`;
}
