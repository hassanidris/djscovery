"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tag } from "lucide-react";
import { GenreSelector } from "@/components/forms/GenreSelector";
import { createGenre } from "@/lib/actions/genre";

export function DetailsSection({
  data,
  set,
  availableGenres,
  setAvailableGenres,
}: {
  data: {
    description: string;
    genres: string[];
  };
  set: (field: "description" | "genres", value: unknown) => void;
  availableGenres: string[];
  setAvailableGenres: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-widest text-zinc-400 uppercase">
        <Tag className="h-4 w-4" /> Details
      </h2>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-zinc-300">
          Description
        </Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Tell fans what to expect…"
          rows={4}
          maxLength={1000}
          className="resize-none border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 focus:border-zinc-500"
        />
        <p className="text-right text-xs text-zinc-600">
          {data.description.length}/1000
        </p>
      </div>

      {/* Genres */}
      <GenreSelector
        selectedGenres={data.genres}
        onChange={(genres) => set("genres", genres)}
        availableGenres={availableGenres}
        onAvailableGenresChange={(updated) => setAvailableGenres(updated)}
        maxGenres={8}
        allowCreate
        createGenreFn={createGenre}
        showSimilaritySuggestion
        variant="zinc"
        label="Genres"
        subtitle="Select up to 8 genres to help fans find this event."
      />
    </section>
  );
}
