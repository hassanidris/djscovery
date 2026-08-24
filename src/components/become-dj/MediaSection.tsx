"use client";

import { Image as ImageIcon, Video, Mic } from "lucide-react";
import {
  MediaUploadSection,
} from "@/components/forms/MediaUploadSection";
import { LinkInputSection } from "@/components/forms/LinkInputSection";
import { sectionCls, sectionTitleCls } from "./constants";

export function MediaSection({
  galleryFiles,
  setGalleryFiles,
  videoLinks,
  setVideoLinks,
  audioLinks,
  setAudioLinks,
}: {
  galleryFiles: File[];
  setGalleryFiles: React.Dispatch<React.SetStateAction<File[]>>;
  videoLinks: string[];
  setVideoLinks: React.Dispatch<React.SetStateAction<string[]>>;
  audioLinks: string[];
  setAudioLinks: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  return (
    <div className={sectionCls}>
      <h2 className={sectionTitleCls}>
        Media{" "}
        <span className="text-sm font-normal text-gray-400">(optional)</span>
      </h2>
      <p className="-mt-2 text-xs text-gray-400">
        Showcase your work — photos, video sets, and audio samples.
      </p>

      <MediaUploadSection
        label="Gallery Images"
        icon={<ImageIcon className="h-4 w-4" />}
        accept="image/*"
        hint="JPG, PNG, WEBP"
        files={galleryFiles}
        onAdd={(files) => setGalleryFiles((prev) => [...prev, ...files])}
        onRemove={(i) =>
          setGalleryFiles((prev) => prev.filter((_, idx) => idx !== i))
        }
      />

      <div className="border-t border-white/5 pt-4">
        <LinkInputSection
          label="Video Links"
          icon={<Video className="h-4 w-4" />}
          placeholder="https://youtube.com/watch?v=..."
          hint="YouTube, Vimeo, TikTok, Instagram, Facebook"
          links={videoLinks}
          onChange={setVideoLinks}
        />
      </div>

      <div className="border-t border-white/5 pt-4">
        <LinkInputSection
          label="Audio Sample Links"
          icon={<Mic className="h-4 w-4" />}
          placeholder="https://soundcloud.com/..."
          hint="SoundCloud, Mixcloud, Spotify..."
          links={audioLinks}
          onChange={setAudioLinks}
        />
      </div>
    </div>
  );
}
