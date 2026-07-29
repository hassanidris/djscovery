"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { ReportButton } from "@/components/reporting/ReportButton";

type Photo = { id: number; url: string };

type Props = {
  photos: Photo[];
  className?: string;
};

export default function MediaGalleryLightbox({ photos, className }: Props) {
  const [index, setIndex] = useState<number | null>(null);

  const open = (i: number) => setIndex(i);
  const close = () => setIndex(null);
  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => (i !== null ? (i - 1 + photos.length) % photos.length : 0));
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => (i !== null ? (i + 1) % photos.length : 0));
  };

  return (
    <>
      <div className={`grid grid-cols-3 gap-2 ${className ?? ""}`}>
        {photos.map((m, i) => (
          <button
            type="button"
            key={m.id}
            onClick={() => open(i)}
            aria-label={`Open photo ${i + 1}`}
            className="hover:ring-h_red/40 group relative aspect-square cursor-pointer overflow-hidden rounded-lg ring-1 ring-white/5 transition-all"
          >
            <Image
              src={m.url}
              alt="DJ photo"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {index !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={close}
        >
          <div
            className="absolute top-4 right-4 z-10 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <ReportButton
              targetType="MEDIA"
              targetId={String(photos[index].id)}
              variant="ghost"
              size="icon"
              className="size-10 text-gray-400 hover:text-white"
            />
            <button
              onClick={close}
              aria-label="Close lightbox"
              className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="absolute top-5 left-1/2 -translate-x-1/2 text-sm text-gray-400 select-none">
            {index + 1} / {photos.length}
          </p>

          <button
            onClick={prev}
            aria-label="Previous photo"
            className="absolute left-3 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 sm:left-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            className="relative mx-16 aspect-4/3 max-h-[85vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[index].url}
              alt="DJ photo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <button
            onClick={next}
            aria-label="Next photo"
            className="absolute right-3 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 sm:right-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
}
