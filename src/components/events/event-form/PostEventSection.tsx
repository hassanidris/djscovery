"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Camera, ImageIcon, Link2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  uploadEventGalleryImage,
  deleteEventGalleryImage,
} from "@/lib/actions/event-upload";
import type { EventFormErrors, GalleryImage } from "./types";

export function PostEventSection({
  data,
  set,
  errors,
  eventId,
  gallery,
  setGallery,
}: {
  data: { recap: string; audioLink: string };
  set: (field: "recap" | "audioLink", value: unknown) => void;
  errors: EventFormErrors;
  eventId: number;
  gallery: GalleryImage[];
  setGallery: React.Dispatch<React.SetStateAction<GalleryImage[]>>;
}) {
  const [isUploadingGallery, setIsUploadingGallery] = useGalleryUploadState();

  async function handleGalleryUpload(file: File | undefined) {
    if (!file) return;
    setIsUploadingGallery(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("eventId", String(eventId));
      const res = await uploadEventGalleryImage(fd);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        setGallery((prev) => [...prev, { id: res.id, url: res.url }]);
        toast.success("Photo added to gallery");
      }
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setIsUploadingGallery(false);
    }
  }

  async function handleGalleryDelete(id: number) {
    const res = await deleteEventGalleryImage(id);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      setGallery((prev) => prev.filter((g) => g.id !== id));
      toast.success("Photo removed");
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-widest text-zinc-400 uppercase">
        <Link2 className="h-4 w-4" /> Post-Event
      </h2>
      <p className="text-xs text-zinc-400">
        Add a recap and audio link now the event is completed.
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="recap" className="text-zinc-300">
          Event Recap
        </Label>
        <Textarea
          id="recap"
          value={data.recap}
          onChange={(e) => set("recap", e.target.value)}
          placeholder="How did the night go? Share a summary…"
          rows={4}
          maxLength={2000}
          className="resize-none border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 focus:border-zinc-500"
        />
        <p className="text-right text-xs text-zinc-600">
          {data.recap.length}/2000
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="audioLink" className="text-zinc-300">
          Audio Link
        </Label>
        <Input
          id="audioLink"
          value={data.audioLink}
          onChange={(e) => set("audioLink", e.target.value)}
          placeholder="SoundCloud or Mixcloud link"
          className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 focus:border-zinc-500"
        />
        {errors.audioLink && (
          <p className="text-xs text-red-400">{errors.audioLink}</p>
        )}
      </div>

      {/* Gallery */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-zinc-300">
          <ImageIcon className="h-3.5 w-3.5" /> Event Photos
        </Label>
        {gallery.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {gallery.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square overflow-hidden rounded-lg bg-zinc-900"
              >
                <Image
                  src={img.url}
                  alt="Gallery"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleGalleryDelete(img.id)}
                  className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-900/80 hover:text-red-400"
                  aria-label="Delete photo"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          id="gallery-upload"
          onChange={(e) => {
            handleGalleryUpload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploadingGallery}
          onClick={() => document.getElementById("gallery-upload")?.click()}
          className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          {isUploadingGallery ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Camera className="mr-1.5 h-3.5 w-3.5" />
          )}
          Add Photo
        </Button>
      </div>
    </section>
  );
}

// Local hook kept here to avoid an extra file for a single boolean.
function useGalleryUploadState(): [
  boolean,
  React.Dispatch<React.SetStateAction<boolean>>,
] {
  return useState(false);
}
