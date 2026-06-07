"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return u.pathname.split("/").filter(Boolean)[0] ?? null;
    }
    if (host.endsWith("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/embed/"))
        return u.pathname.split("/")[2] ?? null;
      if (u.pathname.startsWith("/shorts/"))
        return u.pathname.split("/")[2] ?? null;
    }
  } catch {
    return null;
  }
  return null;
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
  const youtubeId = getYouTubeId(videoUrl);

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
        className="cursor-pointer h-full"
      >
        {children}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/92"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className="w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white font-semibold mb-3 text-sm truncate px-1">
              {title}
            </p>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
              {youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                  title={title}
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <>
                  <Image
                    src={thumbnail}
                    alt={title}
                    fill
                    className="object-cover opacity-40"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                    <FontAwesomeIcon
                      icon={faPlay}
                      className="h-10 w-10 text-white/40"
                    />
                    <p className="text-gray-400 text-sm">
                      Cannot embed this video
                    </p>
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-h_red text-sm underline"
                    >
                      Watch on YouTube →
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
