"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

type VideoProvider =
  | "youtube"
  | "vimeo"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "unknown";

type VideoEmbedInfo = {
  provider: VideoProvider;
  embedUrl: string | null;
  iframeAllow?: string;
};

const PROVIDER_LABELS: Record<VideoProvider, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  unknown: "the original site",
};

function getVideoEmbedInfo(url: string): VideoEmbedInfo {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const segments = parsed.pathname.split("/").filter(Boolean);

    // YouTube (full + short links)
    if (host === "youtu.be") {
      const videoId = segments[0];
      if (videoId) {
        return {
          provider: "youtube",
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          iframeAllow: "autoplay; encrypted-media; fullscreen",
        };
      }
    }
    if (host.endsWith("youtube.com")) {
      let videoId: string | null = null;
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
      } else if (parsed.pathname.startsWith("/embed/")) {
        videoId = segments[1] ?? null;
      } else if (parsed.pathname.startsWith("/shorts/")) {
        videoId = segments[1] ?? null;
      }
      if (videoId) {
        return {
          provider: "youtube",
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          iframeAllow: "autoplay; encrypted-media; fullscreen",
        };
      }
    }

    // Vimeo
    if (host.includes("vimeo.com")) {
      const numericSegment = segments.find((segment) =>
        /^(\d+)$/.test(segment),
      );
      if (numericSegment) {
        return {
          provider: "vimeo",
          embedUrl: `https://player.vimeo.com/video/${numericSegment}`,
          iframeAllow: "autoplay; fullscreen; picture-in-picture",
        };
      }
    }

    // TikTok (@user/video/1234567890)
    if (host.includes("tiktok.com")) {
      const videoId = segments.find((segment) => /^(\d+)$/.test(segment));
      if (videoId) {
        return {
          provider: "tiktok",
          embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
          iframeAllow:
            "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
        };
      }
    }

    // Instagram (p/{code}, reel/{code}, tv/{code})
    if (host.includes("instagram.com") || host === "instagr.am") {
      if (segments.length >= 2 && ["p", "reel", "tv"].includes(segments[0])) {
        const mediaType = segments[0];
        const code = segments[1];
        if (code) {
          return {
            provider: "instagram",
            embedUrl: `https://www.instagram.com/${mediaType}/${code}/embed/`,
            iframeAllow:
              "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
          };
        }
      }
    }

    // Facebook (facebook.com/... or fb.watch short links)
    if (host.includes("facebook.com") || host === "fb.watch") {
      const canonicalUrl = encodeURIComponent(url);
      return {
        provider: "facebook",
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${canonicalUrl}&show_text=0&autoplay=1`,
        iframeAllow:
          "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
      };
    }
  } catch {
    return { provider: "unknown", embedUrl: null };
  }

  return { provider: "unknown", embedUrl: null };
}

type Props = {
  videoUrl: string;
  thumbnail: string;
  title: string;
  children: React.ReactNode;
};

export default function MediaVideoModal({
  videoUrl,
  thumbnail,
  title,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const embedInfo = getVideoEmbedInfo(videoUrl);
  const providerLabel = PROVIDER_LABELS[embedInfo.provider];

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="h-full cursor-pointer"
      >
        {children}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-3 truncate px-1 text-sm font-semibold text-white">
              {title}
            </p>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
              {embedInfo.embedUrl ? (
                <iframe
                  src={
                    embedInfo.provider === "youtube" ||
                    embedInfo.provider === "vimeo"
                      ? `${embedInfo.embedUrl}?autoplay=1`
                      : embedInfo.embedUrl
                  }
                  title={title}
                  allow={
                    embedInfo.iframeAllow ??
                    "autoplay; encrypted-media; fullscreen"
                  }
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              ) : (
                <>
                  <Image
                    src={thumbnail}
                    alt={title}
                    fill
                    className="object-cover opacity-40"
                  />
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
                    <FontAwesomeIcon
                      icon={faPlay}
                      className="h-10 w-10 text-white/40"
                    />
                    <p className="text-sm text-gray-400">
                      Cannot embed this video automatically
                    </p>
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-h_red text-sm underline"
                    >
                      Open on {providerLabel}
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
