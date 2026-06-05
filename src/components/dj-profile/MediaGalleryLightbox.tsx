"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

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
          <div
            key={m.id}
            onClick={() => open(i)}
            className="relative aspect-square rounded-lg overflow-hidden ring-1 ring-white/5 hover:ring-h_red/40 transition-all cursor-pointer group"
          >
            <Image
              src={m.url}
              alt="DJ photo"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      {index !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <p className="absolute top-5 left-1/2 -translate-x-1/2 text-gray-400 text-sm select-none">
            {index + 1} / {photos.length}
          </p>

          <button
            onClick={prev}
            className="absolute left-3 sm:left-6 size-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            className="relative w-full max-w-4xl mx-16 max-h-[85vh] aspect-4/3"
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
            className="absolute right-3 sm:right-6 size-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  );
}
