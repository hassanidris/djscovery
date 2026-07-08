"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  X,
  Plus,
  Music,
  Video,
  GripVertical,
  Loader2,
  Star,
  Trash,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  addDjMediaUrl,
  deleteMediaItem,
  reorderMediaItems,
  toggleSpotlight,
  type MediaItem,
} from "@/lib/actions/dj-media";
import { uploadDjGalleryImage } from "@/lib/actions/dj-upload";

type Props = {
  profileId: number;
  plan: "FREE" | "PREMIUM";
  initialMedia: MediaItem[];
};

export default function MediaLibrary({ profileId, plan, initialMedia }: Props) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [imageLoading, setImageLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = media.filter((m) => m.type === "IMAGE");
  const videoAudio = media.filter(
    (m) => m.type === "VIDEO" || m.type === "AUDIO",
  );
  const spotlightCount = videoAudio.filter((m) => m.isSpotlight).length;

  const photoLimit = plan === "FREE" ? 6 : Infinity;
  const videoAudioLimit = plan === "FREE" ? 2 : Infinity;
  const photoCount = images.length;
  const videoAudioCount = videoAudio.length;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photoCount >= photoLimit) {
      toast.error(`Your ${plan} plan allows up to ${photoLimit} images.`);
      return;
    }

    setImageLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadDjGalleryImage(formData);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      const newMedia: MediaItem = {
        id: result.id,
        type: "IMAGE",
        url: result.url,
        path: result.path,
        bucket: result.bucket,
        sortOrder: result.sortOrder ?? 0,
        isSpotlight: false,
        title: null,
        duration: null,
        thumbnail: null,
        createdAt: new Date(),
      };
      setMedia((prev) => [...prev, newMedia]);
      toast.success("Image uploaded");
    }
    setImageLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddUrl = async (type: "VIDEO" | "AUDIO") => {
    const url = type === "VIDEO" ? videoUrl : audioUrl;
    if (!url.trim()) return;

    if (videoAudioCount >= videoAudioLimit) {
      toast.error(
        `Your ${plan} plan allows up to ${videoAudioLimit} video/audio items.`,
      );
      return;
    }

    const setter = type === "VIDEO" ? setVideoLoading : setAudioLoading;
    setter(true);

    const formData = new FormData();
    formData.append("url", url);
    formData.append("type", type);

    const result = await addDjMediaUrl(formData);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      setMedia((prev) => [...prev, result.media]);
      toast.success(`${type === "VIDEO" ? "Video" : "Audio"} added`);
      if (type === "VIDEO") setVideoUrl("");
      else setAudioUrl("");
    }
    setter(false);
  };

  const handleDelete = async (id: number) => {
    const result = await deleteMediaItem(id);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      setMedia((prev) => prev.filter((m) => m.id !== id));
      toast.success("Item deleted");
    }
  };

  const handleSpotlightToggle = async (id: number, checked: boolean) => {
    if (plan === "FREE") {
      toast.error("Spotlight selection is available on Premium plan only");
      return;
    }
    if (checked && spotlightCount >= 2) {
      // Auto-remove the oldest spotlighted item
      const oldestSpotlight = videoAudio.find((m) => m.isSpotlight);
      if (oldestSpotlight) {
        await toggleSpotlight(oldestSpotlight.id, false);
        setMedia((prev) =>
          prev.map((m) =>
            m.id === oldestSpotlight.id ? { ...m, isSpotlight: false } : m,
          ),
        );
        toast.info("Replaced oldest spotlight item");
      }
    }

    const result = await toggleSpotlight(id, checked);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      setMedia((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isSpotlight: checked } : m)),
      );
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (isNaN(dragIndex) || dragIndex === dropIndex) return;

    const reordered = [...videoAudio];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    const items = reordered.map((m, i) => ({ id: m.id, sortOrder: i + 1 }));
    setReordering(true);

    const result = await reorderMediaItems(items);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      // Update media state by replacing video/audio items with reordered array
      const imageItems = media.filter((m) => m.type === "IMAGE");
      setMedia([...imageItems, ...reordered]);
    }
    setReordering(false);
  };

  return (
    <div className="space-y-8">
      {/* Images Gallery */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Photo Gallery</h3>
          <span className="text-sm text-gray-400">
            {photoCount}/{photoLimit === Infinity ? "∞" : photoLimit} images
          </span>
        </div>

        <div className="relative">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative w-28 shrink-0 overflow-hidden rounded-lg bg-zinc-900 sm:w-32"
              >
                <div className="relative aspect-square">
                  <Image
                    src={img.url}
                    alt="Gallery image"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90"
                  aria-label="Delete image"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}

            {photoCount < photoLimit && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={imageLoading}
                className="flex w-28 shrink-0 items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-white sm:w-32"
              >
                <div className="flex aspect-square items-center justify-center">
                  {imageLoading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Plus className="size-6" />
                  )}
                </div>
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      {/* Video / Audio URLs */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Video & Audio</h3>
          <span className="text-sm text-gray-400">
            {videoAudioCount}/
            {videoAudioLimit === Infinity ? "∞" : videoAudioLimit} items
          </span>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-zinc-300">Add Video URL</Label>
            <div className="flex gap-2">
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="YouTube, Vimeo, Instagram, TikTok"
                className="border-zinc-700 bg-zinc-900"
              />
              <Button
                onClick={() => handleAddUrl("VIDEO")}
                disabled={videoLoading || !videoUrl.trim()}
                size="icon"
              >
                {videoLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Video className="size-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Add Audio URL</Label>
            <div className="flex gap-2">
              <Input
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="SoundCloud, Mixcloud"
                className="border-zinc-700 bg-zinc-900"
              />
              <Button
                onClick={() => handleAddUrl("AUDIO")}
                disabled={audioLoading || !audioUrl.trim()}
                size="icon"
              >
                {audioLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Music className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Video/Audio List */}
        <div className="space-y-1.5">
          {videoAudio.map((item, index) => (
            <Card
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`flex items-center gap-2 border-zinc-800 bg-zinc-900 px-2 py-1.5 transition-all ${
                dragOverIndex === index
                  ? "border-2 border-yellow-400 opacity-50"
                  : ""
              }`}
            >
              <div className="flex w-full items-center justify-start gap-2">
                <GripVertical className="size-4 shrink-0 cursor-grab text-zinc-500 active:cursor-grabbing" />
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-zinc-800">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.title || "Media thumbnail"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-500">
                      {item.type === "VIDEO" ? (
                        <Video className="size-3.5" />
                      ) : (
                        <Music className="size-3.5" />
                      )}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-white">
                    {item.title || "Untitled"}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    {item.type === "VIDEO" ? "Video" : "Audio"}
                    {item.duration ? ` · ${item.duration}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {plan === "PREMIUM" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSpotlightToggle(item.id, !item.isSpotlight)
                      }
                      className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-zinc-800"
                      title={
                        item.isSpotlight
                          ? "Remove from spotlight"
                          : "Add to spotlight"
                      }
                    >
                      {item.isSpotlight && (
                        <span className="text-[10px] font-medium text-yellow-400">
                          Spotlight
                        </span>
                      )}
                      <Star
                        className={`size-3.5 ${
                          item.isSpotlight
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-zinc-500"
                        }`}
                      />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="flex size-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-white"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            </Card>
          ))}

          {videoAudio.length === 0 && (
            <p className="text-sm text-zinc-500">
              Add video or audio links to showcase your work.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
