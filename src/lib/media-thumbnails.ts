"use client";

import { useEffect, useState } from "react";

type MediaProvider = "youtube" | "vimeo" | "soundcloud" | "unknown";

export function getMediaProvider(url: string): MediaProvider {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be" || host.endsWith("youtube.com")) return "youtube";
    if (host.endsWith("vimeo.com")) return "vimeo";
    if (host.includes("soundcloud.com")) return "soundcloud";
  } catch {
    return "unknown";
  }
  return "unknown";
}

export function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const segments = parsed.pathname.split("/").filter(Boolean);

    if (host === "youtu.be") return segments[0] ?? null;
    if (host.endsWith("youtube.com")) {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      if (parsed.pathname.startsWith("/embed/") || parsed.pathname.startsWith("/shorts/")) {
        return segments[1] ?? null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function getVideoThumbnailUrl(url: string): string | null {
  const provider = getMediaProvider(url);
  if (provider === "youtube") {
    const videoId = getYouTubeVideoId(url);
    if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return null;
}

export function getVimeoVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    return segments.find((s) => /^\d+$/.test(s)) ?? null;
  } catch {
    return null;
  }
}

export function useAudioThumbnail(audioUrl: string | undefined): string | null {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    if (!audioUrl) return;
    const provider = getMediaProvider(audioUrl);

    if (provider === "soundcloud") {
      let cancelled = false;
      fetch(
        `https://soundcloud.com/oembed?url=${encodeURIComponent(audioUrl)}&format=json`,
      )
        .then((res) => res.json())
        .then((data: { thumbnail_url?: string }) => {
          if (!cancelled && data.thumbnail_url) setThumbnail(data.thumbnail_url);
        })
        .catch(() => {
          // Ignore fetch failures; keep null so caller can fall back.
        });
      return () => {
        cancelled = true;
      };
    }
  }, [audioUrl]);

  return thumbnail;
}
