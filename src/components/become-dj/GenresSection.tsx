"use client";

import { GenreSelector } from "@/components/forms/GenreSelector";
import { getOrCreateGenre } from "@/lib/actions/profile";
import { sectionCls } from "./constants";

export function GenresSection({
  genreNames,
  setGenres,
  availableGenres,
  setAvailableGenres,
  error,
}: {
  genreNames: string[];
  setGenres: (genres: string[]) => void;
  availableGenres: string[];
  setAvailableGenres: React.Dispatch<React.SetStateAction<string[]>>;
  error?: { message?: string } | undefined;
}) {
  // Adapt getOrCreateGenre (returns {id, name} or throws) to GenreSelector's
  // expected CreateResult shape ({success, name} | {error, message}).
  async function createGenreFn(
    name: string,
  ): Promise<{ success: true; name: string } | { error: string }> {
    try {
      const genre = await getOrCreateGenre(name);
      return { success: true as const, name: genre.name };
    } catch {
      return { error: "Failed to create genre" };
    }
  }

  return (
    <div className={`${sectionCls} ${error ? "border-red-500/40" : ""}`}>
      <GenreSelector
        selectedGenres={genreNames}
        onChange={setGenres}
        availableGenres={availableGenres}
        onAvailableGenresChange={(updated) => setAvailableGenres(updated)}
        maxGenres={5}
        allowCreate
        createGenreFn={createGenreFn}
        showSimilaritySuggestion
        required
        variant="dark"
        label="Genres"
        subtitle="Select up to 5 genres that apply to your style."
        hint="New genres are saved to the database and will appear for future DJs."
        error={error}
      />
    </div>
  );
}
