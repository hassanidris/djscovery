"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";
import { sectionCls, sectionTitleCls } from "./constants";

export function CoverImageSection({
  coverFile,
  setCoverFile,
  coverPreview,
  setCoverPreview,
}: {
  coverFile: File | null;
  setCoverFile: (f: File | null) => void;
  coverPreview: string | null;
  setCoverPreview: (url: string | null) => void;
}) {
  const coverInputRef = useRef<HTMLInputElement>(null);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Cover image must be a JPG, PNG, or WEBP file.");
      setCoverFile(null);
      setCoverPreview(null);
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Cover image must be 10 MB or smaller.");
      setCoverFile(null);
      setCoverPreview(null);
      e.target.value = "";
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  return (
    <div className={sectionCls}>
      <h2 className={sectionTitleCls}>
        Cover Image{" "}
        <span className="text-sm font-normal text-gray-400">(optional)</span>
      </h2>
      <p className="-mt-2 text-xs text-gray-400">
        A banner image for your profile header.
      </p>

      <div className="flex flex-col items-start gap-4">
        <label className="hover:border-h_red relative flex h-32 w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-white/30 bg-white/10 transition-all">
          {coverPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverPreview.startsWith("blob:") ? coverPreview : ""}
              alt="Cover preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Camera className="h-8 w-8 text-gray-400" />
              <span className="text-xs text-gray-400">
                16:9 ratio recommended
              </span>
            </div>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleCoverChange}
          />
        </label>
        <div>
          <p className="text-sm text-gray-300">Upload cover image</p>
          <p className="mt-1 text-xs text-gray-400">
            JPG, PNG or WEBP · Max 10 MB
          </p>
          {coverFile && (
            <button
              type="button"
              onClick={() => {
                setCoverFile(null);
                setCoverPreview(null);
              }}
              className="text-h_redLight mt-2 flex items-center gap-1 text-xs hover:underline"
            >
              <X className="h-3 w-3" /> Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
