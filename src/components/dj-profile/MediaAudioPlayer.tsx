"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

type Props = {
  audioUrl: string;
  title: string;
  thumbnailUrl?: string;
  children: React.ReactNode;
};

export default function MediaAudioPlayer({
  audioUrl,
  title,
  thumbnailUrl,
  children,
}: Props) {
  const [open, setOpen] = useState(false);

  const isSoundCloud = audioUrl.includes("soundcloud.com");
  const embedUrl = isSoundCloud
    ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(audioUrl)}&auto_play=true&color=%23ff2200&buying=false&sharing=false&show_artwork=true&show_user=false`
    : null;

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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/88 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {thumbnailUrl && (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={thumbnailUrl}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="truncate text-sm font-semibold text-white">
                  {title}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close audio player"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4">
              {embedUrl ? (
                <iframe
                  width="100%"
                  height="120"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  src={embedUrl}
                  title={title}
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="py-6 text-center">
                  <p className="mb-3 text-sm text-gray-400">
                    This track is hosted on an external platform.
                  </p>
                  <a
                    href={audioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-h_red text-sm underline"
                  >
                    Open in player →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
