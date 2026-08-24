"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionCard } from "@/components/forms/SectionCard";
import { GenreSelector } from "@/components/forms/GenreSelector";
import { DJ_TYPE_LABELS } from "@/config/dj-type-labels";

export function GenresSpecialtiesSection({
  genreNames,
  setGenreNames,
  availableGenres,
  djTypes,
  toggleDjType,
  submitted,
  genresError,
  djTypesError,
}: {
  genreNames: string[];
  setGenreNames: React.Dispatch<React.SetStateAction<string[]>>;
  availableGenres: string[];
  djTypes: string[];
  toggleDjType: (type: string) => void;
  submitted: boolean;
  genresError: boolean;
  djTypesError: boolean;
}) {
  return (
    <SectionCard
      title="Genres & Specialties"
      subtitle="What you play and where you perform"
    >
      <div className="flex flex-col gap-5">
        <GenreSelector
          selectedGenres={genreNames}
          onChange={(genres) => setGenreNames(genres)}
          availableGenres={availableGenres}
          maxGenres={5}
          allowCreate
          showSimilaritySuggestion
          required
          variant="dark"
          label="Genres"
          subtitle="What you play and where you perform"
          error={
            submitted && genresError
              ? { message: "Add at least one genre" }
              : undefined
          }
        />

        <div>
          <div className="mb-3 flex items-center justify-between">
            <Label className="text-xs text-gray-300">
              DJ Type <span className="text-h_redLight">*</span>
            </Label>
            {submitted && djTypesError && (
              <span className="text-[11px] text-red-400">
                Select at least one
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(DJ_TYPE_LABELS).map(([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 rounded-md p-2 transition-colors hover:bg-white/3"
              >
                <Checkbox
                  checked={djTypes.includes(value)}
                  onCheckedChange={() => toggleDjType(value)}
                  className="data-[state=checked]:bg-h_red data-[state=checked]:border-h_red border-white/20"
                />
                <span className="text-xs text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
