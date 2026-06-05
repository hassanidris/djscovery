"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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
  { value: "", label: "Newest" },
  { value: "a-z", label: "A – Z" },
  { value: "z-a", label: "Z – A" },
  { value: "most-followed", label: "Most Followed" },
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

  const citiesForCountry = countryCities[currentCountry] ?? [];

  const selectedGenres = currentGenre
    ? currentGenre.split(",").filter(Boolean)
    : [];

  const toggleGenre = (genre: string) => {
    const updated = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];
    updateParam("genre", updated.join(","));
  };

  const genreLabel =
    selectedGenres.length === 0
      ? "All genres"
      : selectedGenres.length === 1
        ? selectedGenres[0]
        : `${selectedGenres.length} selected`;

  const [genreOpen, setGenreOpen] = useState(false);
  const genreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) {
        setGenreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="bg-h_blackLight/50 rounded-xl p-4 flex flex-col gap-6 sticky top-28">
      <h3 className="text-h_white font-semibold text-sm">Filters</h3>

      {/* Genre */}
      <div className="flex flex-col gap-2">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
          Genre
        </p>
        <div ref={genreRef} className="relative">
          <button
            type="button"
            onClick={() => setGenreOpen((o) => !o)}
            className="w-full flex items-center justify-between bg-h_black/50 text-xs rounded-md px-3 py-2 ring-1 ring-gray-700 focus:ring-h_red outline-none"
          >
            <span
              className={
                selectedGenres.length > 0 ? "text-h_white" : "text-gray-300"
              }
            >
              {genreLabel}
            </span>
            <svg
              className={`w-3 h-3 text-gray-400 transition-transform ${genreOpen ? "rotate-180" : ""}`}
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
            <div className="absolute z-20 top-full mt-1 w-full bg-h_blackLight border border-gray-700 rounded-md shadow-lg max-h-52 overflow-y-auto">
              <label className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 cursor-pointer border-b border-gray-800">
                <input
                  type="checkbox"
                  checked={selectedGenres.length === 0}
                  onChange={() => updateParam("genre", "")}
                  className="accent-h_red"
                />
                <span className="text-gray-300 text-xs">All genres</span>
              </label>
              {genres.map((genre) => (
                <label
                  key={genre}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre)}
                    onChange={() => toggleGenre(genre)}
                    className="accent-h_red"
                  />
                  <span className="text-gray-300 text-xs">{genre}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Country */}
      <div className="flex flex-col gap-2">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
          Country
        </p>
        <select
          value={currentCountry}
          onChange={(e) => updateCountry(e.target.value)}
          className="bg-h_black/50 text-gray-300 text-xs rounded-md px-3 py-2 outline-none ring-1 ring-gray-700 focus:ring-h_red"
        >
          <option value="">All countries</option>
          {availableCountries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* City — appears after country is selected */}
      {currentCountry && citiesForCountry.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
            City
          </p>
          <select
            value={currentCity}
            onChange={(e) => updateParam("city", e.target.value)}
            className="bg-h_black/50 text-gray-300 text-xs rounded-md px-3 py-2 outline-none ring-1 ring-gray-700 focus:ring-h_red"
          >
            <option value="">All cities</option>
            {citiesForCountry.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sort */}
      <div className="flex flex-col gap-2">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
          Sort By
        </p>
        <select
          value={currentSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="bg-h_black/50 text-gray-300 text-xs rounded-md px-3 py-2 outline-none ring-1 ring-gray-700 focus:ring-h_red"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
