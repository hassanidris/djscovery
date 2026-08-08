"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { DJ_TYPES } from "./FilterBottomSheet";

const GENRES = [
  "House",
  "Techno",
  "Trance",
  "Drum & Bass",
  "Hip Hop",
  "EDM",
  "Afrobeats",
  "Reggaeton",
];

const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "new", label: "Just Joined" },
  { value: "top-rated", label: "Top Rated" },
  { value: "trending", label: "Trending" },
  { value: "most-followed", label: "Most Followed" },
  { value: "a-z", label: "A – Z" },
  { value: "z-a", label: "Z – A" },
];

type FilterPanelProps = {
  genres?: string[];
  availableCountries?: string[];
  countryCities?: Record<string, string[]>;
};

const FilterPanel = ({
  genres = GENRES,
  availableCountries = [],
  countryCities = {},
}: FilterPanelProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  const updateCountry = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("country", value);
      else params.delete("country");
      params.delete("city");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  const currentGenre = searchParams.get("genre") || "";
  const currentCountry = searchParams.get("country") || "";
  const currentCity = searchParams.get("city") || "";
  const currentSort = searchParams.get("sort") || "";
  const currentDjType = searchParams.get("djType") || "";

  const citiesForCountry = countryCities[currentCountry] ?? [];

  const selectedGenres = currentGenre
    ? currentGenre.split(",").filter(Boolean)
    : [];

  const selectedDjTypes = currentDjType
    ? currentDjType.split(",").filter(Boolean)
    : [];

  const toggleGenre = (genre: string) => {
    const updated = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];
    updateParam("genre", updated.join(","));
  };

  const toggleDjType = (type: string) => {
    const updated = selectedDjTypes.includes(type)
      ? selectedDjTypes.filter((t) => t !== type)
      : [...selectedDjTypes, type];
    updateParam("djType", updated.join(","));
  };

  const genreLabel =
    selectedGenres.length === 0
      ? "All genres"
      : selectedGenres.length === 1
        ? selectedGenres[0]
        : `${selectedGenres.length} selected`;

  const [genreOpen, setGenreOpen] = useState(false);
  const genreRef = useRef<HTMLDivElement>(null);
  const [djTypeOpen, setDjTypeOpen] = useState(false);
  const djTypeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) {
        setGenreOpen(false);
      }
      if (djTypeRef.current && !djTypeRef.current.contains(e.target as Node)) {
        setDjTypeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="bg-h_blackLight/50 flex flex-col gap-4 rounded-xl p-4 xl:sticky xl:top-28 xl:gap-6">
      <h3 className="text-h_white text-sm font-semibold">Filters</h3>
      <div className="xl:flex-colx flex flex-wrap gap-3">
        {/* Genre */}
        <div className="flex w-[calc(50%-6px)] flex-col gap-2 xl:w-full">
          <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
            Genre
          </p>
          <div ref={genreRef} className="relative z-50">
            <button
              type="button"
              onClick={() => setGenreOpen((o) => !o)}
              className="bg-h_black/50 focus:ring-h_red flex w-full items-center justify-between rounded-md px-3 py-2 text-xs ring-1 ring-gray-700 outline-none"
            >
              <span
                className={
                  selectedGenres.length > 0 ? "text-h_white" : "text-gray-300"
                }
              >
                {genreLabel}
              </span>
              <svg
                className={`h-3 w-3 text-gray-400 transition-transform ${genreOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {genreOpen && (
              <div className="bg-h_blackLight absolute top-full z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-gray-700 shadow-lg">
                <label className="flex cursor-pointer items-center gap-2 border-b border-gray-800 px-3 py-2 hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={selectedGenres.length === 0}
                    onChange={() => updateParam("genre", "")}
                    className="accent-h_red"
                  />
                  <span className="text-xs text-gray-300">All genres</span>
                </label>
                {genres.map((genre) => (
                  <label
                    key={genre}
                    className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genre)}
                      onChange={() => toggleGenre(genre)}
                      className="accent-h_red"
                    />
                    <span className="text-xs text-gray-300">{genre}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Country */}
        <div className="flex w-[calc(50%-6px)] flex-col gap-2 xl:w-full">
          <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
            Country
          </p>
          <select
            value={currentCountry}
            onChange={(e) => updateCountry(e.target.value)}
            aria-label="Select country"
            className="bg-h_black/50 focus:ring-h_red rounded-md px-3 py-2 text-xs text-gray-300 ring-1 ring-gray-700 outline-none"
          >
            <option value="" className="bg-h_blackLight hover:bg-white/5">
              All countries
            </option>
            {availableCountries.map((c) => (
              <option
                key={c}
                value={c}
                className="bg-h_blackLight hover:bg-white/5"
              >
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* City — appears after country is selected */}
        {currentCountry && citiesForCountry.length > 0 && (
          <div className="flex w-[calc(50%-6px)] flex-col gap-2 xl:w-full">
            <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
              City
            </p>
            <select
              value={currentCity}
              onChange={(e) => updateParam("city", e.target.value)}
              aria-label="Select city"
              className="bg-h_black/50 focus:ring-h_red rounded-md px-3 py-2 text-xs text-gray-300 ring-1 ring-gray-700 outline-none"
            >
              <option value="" className="bg-h_blackLight hover:bg-white/5">
                All cities
              </option>
              {citiesForCountry.map((c) => (
                <option
                  key={c}
                  value={c}
                  className="bg-h_blackLight hover:bg-white/5"
                >
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* DJ Type */}
        <div className="flex w-[calc(50%-6px)] flex-col gap-2 xl:w-full">
          <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
            DJ Type
          </p>
          <div ref={djTypeRef} className="relative z-40">
            <button
              type="button"
              onClick={() => setDjTypeOpen((o) => !o)}
              className="bg-h_black/50 focus:ring-h_red flex w-full items-center justify-between rounded-md px-3 py-2 text-xs ring-1 ring-gray-700 outline-none"
            >
              <span
                className={
                  selectedDjTypes.length > 0 ? "text-h_white" : "text-gray-300"
                }
              >
                {selectedDjTypes.length === 0
                  ? "All types"
                  : selectedDjTypes.length === 1
                    ? (DJ_TYPES.find((t) => t.value === selectedDjTypes[0])
                        ?.label ?? selectedDjTypes[0])
                    : `${selectedDjTypes.length} selected`}
              </span>
              <svg
                className={`h-3 w-3 text-gray-400 transition-transform ${djTypeOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {djTypeOpen && (
              <div className="bg-h_blackLight absolute top-full z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-gray-700 shadow-lg">
                <label className="flex cursor-pointer items-center gap-2 border-b border-gray-800 px-3 py-2 hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={selectedDjTypes.length === 0}
                    onChange={() => updateParam("djType", "")}
                    className="accent-h_red"
                  />
                  <span className="text-xs text-gray-300">All types</span>
                </label>
                {DJ_TYPES.map((t) => (
                  <label
                    key={t.value}
                    className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDjTypes.includes(t.value)}
                      onChange={() => toggleDjType(t.value)}
                      className="accent-h_red"
                    />
                    <span className="text-xs text-gray-300">{t.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sort */}
        <div className="flex w-[calc(50%-6px)] flex-col gap-2 xl:w-full">
          <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
            Sort By
          </p>
          <select
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            aria-label="Sort by"
            className="bg-h_black/50 focus:ring-h_red rounded-md px-3 py-2 text-xs text-gray-300 ring-1 ring-gray-700 outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option
                key={o.value}
                value={o.value}
                className="bg-h_blackLight hover:bg-white/5"
              >
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
