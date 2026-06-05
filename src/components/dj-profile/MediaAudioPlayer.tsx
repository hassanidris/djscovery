"use client";

import { useState } from "react";
import { X } from "lucide-react";

type Props = {
  audioUrl: string;
  title: string;
  children: React.ReactNode;
};

export default function MediaAudioPlayer({ audioUrl, title, children }: Props) {
  const [open, setOpen] = useState(false);

  const isSoundCloud = audioUrl.includes("soundcloud.com");
  const embedUrl = isSoundCloud
    ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(audioUrl)}&auto_play=true&color=%23ff2200&buying=false&sharing=false&show_artwork=true&show_user=false`
    : null;

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/88"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-[#111] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <p className="text-white text-sm font-semibold truncate flex-1 mr-4">
                {title}
              </p>
              <button
                onClick={() => setOpen(false)}
                className="size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
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
                  className="rounded-lg w-full"
                />
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm mb-3">
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
