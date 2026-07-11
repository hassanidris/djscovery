"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { X, Upload, Link as LinkIcon, Headphones, Play, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createDjMedia, updateDjMediaItem } from "@/lib/actions/dj-media";
import type { MediaItem } from "@/lib/actions/dj-media";

export type MediaFormMode =
  | { mode: "create" }
  | { mode: "edit"; media: MediaItem };

type MediaFormProps = {
  open: boolean;
  onClose: () => void;
  mode: MediaFormMode;
  onSuccess: () => void;
};

const TYPE_OPTIONS: { value: MediaItem["type"]; label: string; icon: React.ElementType }[] = [
  { value: "AUDIO", label: "Mix", icon: Headphones },
  { value: "VIDEO", label: "Video", icon: Play },
  { value: "IMAGE", label: "Press", icon: ImageIcon },
];

export default function MediaForm({ open, onClose, mode, onSuccess }: MediaFormProps) {
  const isEdit = mode.mode === "edit";
  const initial = isEdit ? mode.media : null;

  const [type, setType] = useState<MediaItem["type"]>(initial?.type || "AUDIO");
  const [title, setTitle] = useState(initial?.title || "");
  const [url, setUrl] = useState(initial?.url || "");
  const [isSpotlight, setIsSpotlight] = useState(initial?.isSpotlight || false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initial?.type === "IMAGE" ? initial.url : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    setType(initial?.type || "AUDIO");
    setTitle(initial?.title || "");
    setUrl(initial?.url || "");
    setIsSpotlight(initial?.isSpotlight || false);
    setFile(null);
    setPreviewUrl(initial?.type === "IMAGE" ? initial.url : null);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (type !== "IMAGE" && !url.trim()) {
      setError("URL is required");
      return;
    }

    if (type === "IMAGE" && !isEdit && !file) {
      setError("Please upload an image");
      return;
    }

    const formData = new FormData();
    formData.append("type", type);
    formData.append("title", title.trim());
    formData.append("isSpotlight", String(isSpotlight));
    if (type !== "IMAGE") formData.append("url", url.trim());
    if (file) formData.append("file", file);

    startTransition(async () => {
      const result = isEdit
        ? await updateDjMediaItem(initial!.id, formData)
        : await createDjMedia(formData);

      if ("error" in result) {
        setError(result.error);
        return;
      }

      onSuccess();
      handleClose();
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-white/10 bg-h_black text-white">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Media" : "Add Media"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Type selector */}
          {!isEdit && (
            <Tabs
              value={type}
              onValueChange={(v) => setType(v as MediaItem["type"])}
              className="w-full"
            >
              <TabsList className="w-full bg-white/5">
                {TYPE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <TabsTrigger
                      key={option.value}
                      value={option.value}
                      className="flex-1 gap-1 data-active:bg-h_redDark data-active:text-white"
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Arabic Mix 2025"
              className="border-white/10 bg-white/5 text-white placeholder:text-gray-600"
            />
          </div>

          {/* URL input for video/audio */}
          {type !== "IMAGE" && (
            <div className="space-y-1.5">
              <Label htmlFor="url">URL</Label>
              <div className="relative">
                <LinkIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={
                    type === "VIDEO"
                      ? "YouTube, Vimeo, TikTok, Instagram..."
                      : "SoundCloud, Mixcloud..."
                  }
                  className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-gray-600"
                />
              </div>
              <p className="text-xs text-gray-500">
                {type === "VIDEO"
                  ? "Supported: YouTube, Vimeo, TikTok, Instagram"
                  : "Supported: SoundCloud, Mixcloud"}
              </p>
            </div>
          )}

          {/* File upload for images */}
          {type === "IMAGE" && (
            <div className="space-y-1.5">
              <Label>Image</Label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 p-6 transition-colors hover:border-white/40">
                {previewUrl ? (
                  <div className="relative h-32 w-full overflow-hidden rounded-lg">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                        setPreviewUrl(initial?.url || null);
                      }}
                      className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-500" />
                    <p className="text-sm text-gray-400">Click to upload image</p>
                    <p className="text-xs text-gray-600">JPEG, PNG, WebP up to 10MB</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            </div>
          )}

          {/* Spotlight toggle */}
          {type !== "IMAGE" && (
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="spotlight" className="cursor-pointer">
                  Spotlight
                </Label>
                <p className="text-xs text-gray-500">Show on your profile spotlight</p>
              </div>
              <Switch
                id="spotlight"
                checked={isSpotlight}
                onCheckedChange={setIsSpotlight}
              />
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-h_red hover:bg-h_redDark">
              {isPending ? "Saving..." : isEdit ? "Save Changes" : "Add Media"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
