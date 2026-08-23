"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateDjProfile } from "@/lib/actions/profile";
import type { ProfileData, SocialLink } from "./types";

const DJ_TYPES = [
  { value: "CLUB", label: "Club Night" },
  { value: "WEDDING", label: "Wedding" },
  { value: "FESTIVAL", label: "Festival" },
  { value: "CORPORATE", label: "Corporate Event" },
  { value: "BAR_LOUNGE", label: "Bar / Lounge" },
  { value: "PRIVATE_PARTY", label: "Private Party" },
  { value: "BIRTHDAY", label: "Birthday" },
  { value: "CULTURAL_EVENT", label: "Cultural Event" },
] as const;

const SOCIAL_PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "spotify", label: "Spotify" },
  { value: "soundcloud", label: "SoundCloud" },
  { value: "mixcloud", label: "Mixcloud" },
  { value: "website", label: "Website" },
] as const;

export default function MusicTab({
  profile,
  allGenres,
}: {
  profile: ProfileData;
  allGenres: string[];
}) {
  const [isPending, startTransition] = useTransition();

  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    profile.genres,
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(profile.djTypes);
  const [customGenre, setCustomGenre] = useState("");

  const [links, setLinks] = useState<SocialLink[]>(
    profile.socialLinks.length > 0
      ? profile.socialLinks
      : [{ platform: "instagram", url: "" }],
  );

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre].slice(0, 5),
    );
  }

  function toggleType(type: string) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  async function handleAddCustomGenre() {
    const trimmed = customGenre.trim();
    if (!trimmed) return;
    if (selectedGenres.includes(trimmed)) {
      setCustomGenre("");
      return;
    }
    const { createGenre } = await import("@/lib/actions/genre");
    const result = await createGenre(trimmed);
    if ("error" in result) toast.error(result.error);
    else {
      setSelectedGenres((prev) => [...prev, result.name].slice(0, 5));
      setCustomGenre("");
    }
  }

  function addLink() {
    if (links.length >= 7) return;
    const used = new Set(links.map((l) => l.platform));
    const next = SOCIAL_PLATFORMS.find((p) => !used.has(p.value));
    setLinks((prev) => [
      ...prev,
      { platform: next?.value ?? "website", url: "" },
    ]);
  }

  function removeLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLink(index: number, field: "platform" | "url", value: string) {
    setLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
    );
  }

  function handleSave() {
    const valid = links.filter((l) => l.url.trim());
    startTransition(async () => {
      const result = await updateDjProfile({
        genreNames: selectedGenres,
        djTypes: selectedTypes as any,
        socialLinks: valid as any,
      });
      if ("error" in result) toast.error(result.error);
      else toast.success("Music & social links updated.");
    });
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Genres */}
      <section className="flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Genres</h3>
          <p className="text-xs text-gray-400">
            Select up to 5 genres that describe your sound.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {allGenres.map((genre) => (
            <label
              key={genre}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors ${
                selectedGenres.includes(genre)
                  ? "border-h_red bg-h_redDark text-white"
                  : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedGenres.includes(genre)}
                onChange={() => toggleGenre(genre)}
              />
              {genre}
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={customGenre}
            onChange={(e) => setCustomGenre(e.target.value)}
            placeholder="Add a custom genre"
            className="max-w-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCustomGenre}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* DJ Types */}
      <section className="flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-semibold text-white">DJ Types</h3>
          <p className="text-xs text-gray-400">
            What kind of events do you play?
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {DJ_TYPES.map((type) => (
            <label
              key={type.value}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors ${
                selectedTypes.includes(type.value)
                  ? "border-h_red bg-h_redDark text-white"
                  : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedTypes.includes(type.value)}
                onChange={() => toggleType(type.value)}
              />
              {type.label}
            </label>
          ))}
        </div>
      </section>

      {/* Social Links */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Social Links</h3>
            <p className="text-xs text-gray-400">
              Links shown on your public profile.
            </p>
          </div>
          {links.length < 7 && (
            <Button type="button" variant="outline" size="sm" onClick={addLink}>
              <Plus className="h-4 w-4" /> Add Link
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {links.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <Select
                value={link.platform}
                onValueChange={(v) => updateLink(i, "platform", v)}
              >
                <SelectTrigger className="w-36 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLink(i)}
                className="text-gray-400 hover:text-red-500"
                aria-label="Remove link"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={
            isPending ||
            selectedGenres.length === 0 ||
            selectedTypes.length === 0
          }
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Music & Social"}
        </Button>
      </div>
    </div>
  );
}
