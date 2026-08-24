"use client";

import Image from "next/image";
import { Camera, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VALID_EVENT_CATEGORIES } from "@/lib/event-categories";
import { CATEGORY_LABELS } from "./types";
import type { EventFormErrors } from "./types";

export function BasicInfoSection({
  data,
  set,
  errors,
  posterUrl,
  isUploadingPoster,
  posterInputRef,
  onPosterUpload,
  isCreateMode,
}: {
  data: {
    title: string;
    eventType: "PUBLIC" | "PRIVATE";
    category: string;
  };
  set: (field: "title" | "eventType" | "category", value: unknown) => void;
  errors: EventFormErrors;
  posterUrl: string | null;
  isUploadingPoster: boolean;
  posterInputRef: React.RefObject<HTMLInputElement | null>;
  onPosterUpload: (file: File | undefined) => void;
  isCreateMode: boolean;
}) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-widest text-zinc-400 uppercase">
        <FileText className="h-4 w-4" /> Basic Info
      </h2>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-zinc-300">
          Event Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Sunset Grooves Lisbon"
          className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 focus:border-zinc-500"
        />
        {errors.title && (
          <p className="text-xs text-red-400">{errors.title}</p>
        )}
      </div>

      {/* Event Type toggle */}
      <div className="space-y-1.5">
        <Label className="text-zinc-300">
          Event Type <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-3">
          {(["PUBLIC", "PRIVATE"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => set("eventType", type)}
              className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                data.eventType === type
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-white"
              }`}
            >
              {type === "PUBLIC" ? "🌐 Public" : "🔒 Private"}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-400">
          {data.eventType === "PUBLIC"
            ? "Visible to everyone. Ticket URL can be added."
            : "Only you can see the full details. Location is hidden."}
        </p>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label htmlFor="category" className="text-zinc-300">
          Category <span className="text-red-500">*</span>
        </Label>
        <Select
          value={data.category}
          onValueChange={(v) => set("category", v)}
        >
          <SelectTrigger
            id="category"
            className="w-full border-zinc-700 bg-zinc-900 text-white focus:border-zinc-500"
          >
            <SelectValue placeholder="Select category…" />
          </SelectTrigger>
          <SelectContent className="border-zinc-700 bg-zinc-900">
            {VALID_EVENT_CATEGORIES.map((cat) => (
              <SelectItem
                key={cat}
                value={cat}
                className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
              >
                {CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-xs text-red-400">{errors.category}</p>
        )}
      </div>

      {/* Poster */}
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Event Poster</Label>
        {posterUrl && (
          <div className="relative mb-2 h-40 w-full overflow-hidden rounded-lg bg-zinc-900">
            <Image
              src={posterUrl}
              alt="Event poster"
              fill
              className="object-cover"
            />
          </div>
        )}
        <input
          ref={posterInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            onPosterUpload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploadingPoster}
          onClick={() => posterInputRef.current?.click()}
          className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          {isUploadingPoster ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Camera className="mr-1.5 h-3.5 w-3.5" />
          )}
          {posterUrl ? "Change Poster" : "Upload Poster"}
        </Button>
        {isCreateMode && (
          <p className="text-xs text-zinc-400">
            Poster will be uploaded after the event is created.
          </p>
        )}
      </div>
    </section>
  );
}
