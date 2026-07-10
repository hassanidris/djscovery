"use server";

import { getYouTubeVideoId } from "@/lib/media-utils";

type YouTubeOEmbedResponse = {
  title?: string;
  author_name?: string;
  author_url?: string;
  type?: string;
  height?: number;
  width?: number;
  version?: string;
  provider_name?: string;
  provider_url?: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  html?: string;
};

export async function fetchYouTubeOEmbed(
  videoUrl: string,
): Promise<{ title?: string; thumbnailUrl?: string } | { error: string }> {
  const videoId = getYouTubeVideoId(videoUrl);
  if (!videoId) {
    return { error: "Invalid YouTube URL" };
  }

  try {
    const encodedUrl = encodeURIComponent(videoUrl);
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodedUrl}&format=json`,
      { next: { revalidate: 86400 } },
    );

    if (!res.ok) {
      return { error: `YouTube oEmbed failed: ${res.status}` };
    }

    const data = (await res.json()) as YouTubeOEmbedResponse;
    return {
      title: data.title,
      thumbnailUrl: data.thumbnail_url,
    };
  } catch {
    return { error: "Failed to fetch YouTube oEmbed data" };
  }
}
