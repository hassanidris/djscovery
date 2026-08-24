"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";
import { sectionCls, sectionTitleCls } from "./constants";

export function AvatarSection({
  avatarFile,
  setAvatarFile,
  avatarPreview,
  setAvatarPreview,
}: {
  avatarFile: File | null;
  setAvatarFile: (f: File | null) => void;
  avatarPreview: string | null;
  setAvatarPreview: (url: string | null) => void;
}) {
  const avatarInputRef = useRef<HTMLInputElement>(null);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Avatar must be a JPG, PNG, or WEBP file.");
      setAvatarFile(null);
      setAvatarPreview(null);
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar must be 5 MB or smaller.");
      setAvatarFile(null);
      setAvatarPreview(null);
      e.target.value = "";
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  return (
    <div className={sectionCls}>
      <h2 className={sectionTitleCls}>Profile Photo</h2>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <label className="hover:border-h_red relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-white/30 bg-white/10 transition-all">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPreview.startsWith("blob:") ? avatarPreview : ""}
              alt="Avatar preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <Camera className="h-8 w-8 text-gray-400" />
          )}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleAvatarChange}
          />
        </label>
        <div>
          <p className="text-sm text-gray-300">Upload your DJ photo</p>
          <p className="mt-1 text-xs text-gray-400">
            JPG, PNG or WEBP · Max 5 MB
          </p>
          {avatarFile && (
            <button
              type="button"
              onClick={() => {
                setAvatarFile(null);
                setAvatarPreview(null);
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
