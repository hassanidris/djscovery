// oEmbed metadata fetcher for video/audio platforms
// No API keys required - uses public oEmbed endpoints

import { getVideoThumbnailUrl } from "@/lib/media-utils";

export interface OEmbedData {
  title?: string;
  thumbnail_url?: string;
  author_name?: string;
  duration?: number; // in seconds
  html?: string;
  type?: string;
}

// oEmbed endpoints for supported platforms
const OEMBED_ENDPOINTS: Record<string, string> = {
  youtube: "https://www.youtube.com/oembed",
  vimeo: "https://vimeo.com/api/oembed.json",
  soundcloud: "https://soundcloud.com/oembed",
  mixcloud: "https://www.mixcloud.com/oembed",
  instagram: "https://www.instagram.com/oembed",
  tiktok: "https://www.tiktok.com/oembed",
};

/**
 * Returns true when `hostname` is exactly `domain` or a subdomain of it.
 */
function isHostOrSubdomain(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

/**
 * Detect platform from URL
 */
function isHostOrSubdomain(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function detectPlatform(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    if (
      isHostOrSubdomain(hostname, "youtube.com") ||
      isHostOrSubdomain(hostname, "youtu.be")
    ) {
      return "youtube";
    }
    if (isHostOrSubdomain(hostname, "vimeo.com")) {
      return "vimeo";
    }
    if (isHostOrSubdomain(hostname, "soundcloud.com")) {
      return "soundcloud";
    }
    if (isHostOrSubdomain(hostname, "mixcloud.com")) {
      return "mixcloud";
    }
    if (isHostOrSubdomain(hostname, "instagram.com")) {
      return "instagram";
    }
    if (isHostOrSubdomain(hostname, "tiktok.com")) {
      return "tiktok";
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Format duration from seconds to human-readable string (e.g. "3:45")
 */
export function formatDuration(seconds?: number): string | null {
  if (!seconds) return null;

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Normalize SoundCloud URL to ensure it works with oEmbed API
 * Handles both regular URLs and share links
 */
function normalizeSoundCloudUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove tracking parameters from share links
    const paramsToRemove = [
      "si",
      "in",
      "from",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
    ];
    paramsToRemove.forEach((param) => urlObj.searchParams.delete(param));
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Fetch oEmbed metadata from a video/audio URL
 */
export async function fetchOEmbed(url: string): Promise<OEmbedData | null> {
  const platform = detectPlatform(url);
  if (!platform) {
    return null;
  }

  const endpoint = OEMBED_ENDPOINTS[platform];
  if (!endpoint) {
    return null;
  }

  // Normalize SoundCloud URLs
  const normalizedUrl =
    platform === "soundcloud" ? normalizeSoundCloudUrl(url) : url;

  try {
    const oembedUrl = `${endpoint}?url=${encodeURIComponent(normalizedUrl)}&format=json`;
    const response = await fetch(oembedUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`oEmbed fetch failed for ${platform}: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.warn(`oEmbed returned non-JSON for ${platform}: ${contentType}`);
      return null;
    }

    const data = await response.json();

    return {
      title: data.title,
      thumbnail_url: data.thumbnail_url,
      author_name: data.author_name,
      duration: data.duration || data.video?.duration,
      html: data.html,
      type: data.type,
    };
  } catch (error) {
    console.error("oEmbed fetch error:", error);
    return null;
  }
}

/**
 * Generate fallback metadata when oEmbed fails
 */
export function generateFallbackMetadata(
  url: string,
  type: "VIDEO" | "AUDIO",
): {
  title: string;
  thumbnail: string | null;
  duration: string | null;
} {
  const platform = detectPlatform(url) || "External";
  const title = `${platform} Media`;

  let thumbnail: string | null = null;
  if (type === "VIDEO") {
    thumbnail = getVideoThumbnailUrl(url);
  }

  return {
    title,
    thumbnail,
    duration: null,
  };
}
