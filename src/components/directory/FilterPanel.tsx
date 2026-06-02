"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

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

const FilterPanel = ({ genres = GENRES }: { genres?: string[] }) => {
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

  const currentGenre = searchParams.get("genre") || "";
  const currentCountry = searchParams.get("country") || "";
  const currentSort = searchParams.get("sort") || "";
  const hasFilters = currentGenre || currentCountry || currentSort;

  return (
    <div className="bg-h_blackLight/50 rounded-xl p-4 flex flex-col gap-6 sticky top-28">
      <h3 className="text-h_white font-semibold text-sm">Filters</h3>

      {/* Genre */}
      <div className="flex flex-col gap-2">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
          Genre
        </p>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="genre"
              value=""
              checked={currentGenre === ""}
              onChange={() => updateParam("genre", "")}
              className="accent-h_cyan"
            />
            <span className="text-gray-300 text-xs">All</span>
          </label>
          {genres.map((genre) => (
            <label
              key={genre}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="genre"
                value={genre}
                checked={currentGenre === genre}
                onChange={() => updateParam("genre", genre)}
                className="accent-h_cyan"
              />
              <span className="text-gray-300 text-xs">{genre}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Country */}
      <div className="flex flex-col gap-2">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
          Country
        </p>
        <input
          type="text"
          placeholder="e.g. Sweden"
          value={currentCountry}
          onChange={(e) => updateParam("country", e.target.value)}
          className="bg-h_black/50 text-gray-300 text-xs rounded-md px-3 py-2 outline-none ring-1 ring-gray-700 focus:ring-h_cyan"
        />
      </div>

      {/* Sort */}
      <div className="flex flex-col gap-2">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
          Sort By
        </p>
        <select
          value={currentSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="bg-h_black/50 text-gray-300 text-xs rounded-md px-3 py-2 outline-none ring-1 ring-gray-700 focus:ring-h_cyan"
        >
          <option value="">Newest</option>
          <option value="a-z">A — Z</option>
        </select>
      </div>

      {/* Reset */}
      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="text-xs text-h_cyan hover:text-h_cyanDark text-left"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
};

export default FilterPanel;
