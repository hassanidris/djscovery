"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  filterGenres,
  findGenreByNormalized,
  findSimilarGenre,
} from "@/lib/genre-utils";

/** Result of a genre creation attempt. */
type CreateResult = { success: true; name: string } | { error: string };

export interface GenreSelectorProps {
  /** Currently selected genre names. */
  selectedGenres: string[];
  /** Callback when the selection changes. */
  onChange: (genres: string[]) => void;
  /** All known genre names (fetched from DB). */
  availableGenres: string[];
  /** Callback to update the available genres list when a new one is created. */
  onAvailableGenresChange?: (genres: string[]) => void;

  /** Max number of selectable genres. Default: 5. */
  maxGenres?: number;

  /**
   * Whether the user can create genres that don't exist yet via the
   * custom-add input. Default: true.
   */
  allowCreate?: boolean;

  /**
   * Genre creation function, called when the user adds a name that isn't
   * an existing genre. If omitted, custom names are added locally only
   * (useful when the parent's submit handler persists new genres itself).
   */
  createGenreFn?: (name: string) => Promise<CreateResult>;

  /**
   * Show a "did you mean?" suggestion when the typed name closely matches
   * an existing genre, instead of creating a near-duplicate. Default: true.
   */
  showSimilaritySuggestion?: boolean;

  /** Validation error from the parent form. */
  error?: { message?: string } | undefined;

  /** Whether at least one genre is required. Shows the asterisk. */
  required?: boolean;

  /** Visual variant — matches the host form's theme. */
  variant?: "dark" | "zinc";

  /** Field label. Default: "Genres". */
  label?: string;

  /** Subtitle shown under the label (e.g. "Select up to 5 genres..."). */
  subtitle?: string;

  /** Helper text shown below the custom-add input. */
  hint?: string;
}

/**
 * Canonical genre picker: a searchable pill grid.
 *
 * All available genres render as toggleable pills so users can pick without
 * typing — best practice for a bounded, moderate-size vocabulary. Typing in
 * the filter input narrows the grid; if no match exists, a custom genre can
 * be added (optionally persisted via `createGenreFn`).
 */
export function GenreSelector({
  selectedGenres,
  onChange,
  availableGenres,
  onAvailableGenresChange,
  maxGenres = 5,
  allowCreate = true,
  createGenreFn,
  showSimilaritySuggestion = true,
  error,
  required = false,
  variant = "dark",
  label = "Genres",
  subtitle,
  hint,
}: GenreSelectorProps) {
  const [filter, setFilter] = useState("");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const atLimit = selectedGenres.length >= maxGenres;

  // Show selected genres first, then the rest — filtered by search text.
  const visibleGenres = filterGenres(
    availableGenres,
    filter,
    [],
    availableGenres.length,
  ).sort((a, b) => {
    const aSelected = selectedGenres.includes(a);
    const bSelected = selectedGenres.includes(b);
    if (aSelected === bSelected) return 0;
    return aSelected ? -1 : 1;
  });

  function toggleGenre(genre: string) {
    if (selectedGenres.includes(genre)) {
      onChange(selectedGenres.filter((g) => g !== genre));
    } else if (selectedGenres.length < maxGenres) {
      onChange([...selectedGenres, genre]);
    }
  }

  async function handleAddCustom() {
    const trimmed = filter.trim();
    if (!trimmed || atLimit) return;

    // 1. Exact normalized match? Just select it.
    const exact = findGenreByNormalized(trimmed, availableGenres);
    if (exact) {
      if (!selectedGenres.includes(exact)) toggleGenre(exact);
      setFilter("");
      setSuggestion(null);
      return;
    }

    // 2. Similar (possible misspelling)?
    if (showSimilaritySuggestion) {
      const similar = findSimilarGenre(trimmed, availableGenres);
      if (similar && !selectedGenres.includes(similar)) {
        setSuggestion(similar);
        return;
      }
    }

    if (!allowCreate) {
      setFilter("");
      return;
    }

    // 3a. Local-only add (parent persists new genres on submit).
    if (!createGenreFn) {
      if (selectedGenres.length < maxGenres) {
        onChange([...selectedGenres, trimmed]);
      }
      setFilter("");
      setSuggestion(null);
      return;
    }

    // 3b. Create via server action immediately.
    setIsCreating(true);
    const toastId = toast.loading("Adding genre...");
    try {
      const res = await createGenreFn(trimmed);
      if ("error" in res) {
        toast.error(res.error, { id: toastId });
        return;
      }
      if (onAvailableGenresChange) {
        onAvailableGenresChange(
          availableGenres.includes(res.name)
            ? availableGenres
            : [...availableGenres, res.name].sort((a, b) => a.localeCompare(b)),
        );
      }
      if (
        !selectedGenres.includes(res.name) &&
        selectedGenres.length < maxGenres
      ) {
        onChange([...selectedGenres, res.name]);
      }
      toast.success(`"${res.name}" added`, { id: toastId });
      setFilter("");
      setSuggestion(null);
    } catch {
      toast.error("Failed to add genre", { id: toastId });
    } finally {
      setIsCreating(false);
    }
  }

  function acceptSuggestion() {
    if (suggestion) toggleGenre(suggestion);
    setSuggestion(null);
    setFilter("");
  }

  // ── Styling per variant ──────────────────────────────────────────────
  const pillBase =
    "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40";
  const pillUnselected =
    variant === "zinc"
      ? "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-white"
      : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10";
  const pillSelected =
    variant === "zinc"
      ? "border-h_red bg-h_red/15 text-h_redLight"
      : "border-h_red bg-h_redDark text-white";

  const inputClassName =
    variant === "zinc"
      ? "border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 focus:border-zinc-500"
      : "focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-400";

  const addBtnClassName =
    variant === "zinc"
      ? "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
      : "border-white/15 text-gray-400 hover:bg-white/5";

  return (
    <div className="flex flex-col gap-3">
      {/* Label + subtitle + counter */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span
            className={variant === "zinc" ? "text-zinc-300" : "text-gray-300"}
          >
            <span className="text-sm font-medium">
              {label} {required && <span className="text-h_redLight">*</span>}
            </span>
          </span>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
        <span
          className={`shrink-0 text-xs font-medium ${
            atLimit ? "text-amber-400" : "text-gray-400"
          }`}
        >
          {error ? (
            <span className="text-red-400">{error.message}</span>
          ) : (
            `${selectedGenres.length}/${maxGenres}`
          )}
        </span>
      </div>

      {/* Filter input — narrows the pill grid below */}
      <Input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAddCustom();
          }
        }}
        placeholder="Search genres…"
        className={inputClassName}
        maxLength={50}
      />

      {/* Pill grid — all genres visible, click to toggle */}
      <div className="flex flex-wrap gap-2">
        {visibleGenres.map((genre) => {
          const selected = selectedGenres.includes(genre);
          return (
            <button
              key={genre}
              type="button"
              onClick={() => toggleGenre(genre)}
              disabled={!selected && atLimit}
              className={`${pillBase} ${selected ? pillSelected : pillUnselected}`}
            >
              {genre}
            </button>
          );
        })}
        {visibleGenres.length === 0 && (
          <p className="text-xs text-gray-400">No genres match your search.</p>
        )}
      </div>

      {/* "Did you mean?" suggestion */}
      {suggestion && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2">
          <span className="text-xs text-amber-300">
            Did you mean{" "}
            <button
              type="button"
              onClick={acceptSuggestion}
              className="font-semibold text-amber-200 underline hover:text-white"
            >
              {suggestion}
            </button>
            ?
          </span>
          <button
            type="button"
            onClick={() => setSuggestion(null)}
            className="ml-auto text-[10px] text-amber-400/70 hover:text-amber-300"
          >
            No, add new
          </button>
        </div>
      )}

      {/* Custom-add fallback for genres not in the list */}
      {allowCreate && filter.trim() && !suggestion && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddCustom}
          disabled={atLimit || isCreating}
          className={`w-fit ${addBtnClassName}`}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          {isCreating ? "Adding..." : `Add "${filter.trim()}"`}
        </Button>
      )}

      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
