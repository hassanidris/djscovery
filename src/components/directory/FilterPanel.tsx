"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

// Renders dropdown content in a portal attached to document.body so it can
// never be trapped inside a sibling's stacking context (which happens when
// multiple `position: relative` + `z-index` wrappers sit next to each other).
function DropdownPortal({
  anchorRef,
  open,
  contentRef,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  contentRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  const [rect, setRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    const updateRect = () => {
      if (anchorRef.current) {
        const r = anchorRef.current.getBoundingClientRect();
        setRect({ top: r.bottom + 4, left: r.left, width: r.width });
      }
    };
    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [open, anchorRef]);

  if (!open || !rect || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={contentRef}
      className="bg-h_blackLight fixed z-9999 max-h-52 overflow-y-auto rounded-md border border-gray-700 shadow-lg"
      style={{ top: rect.top, left: rect.left, width: rect.width }}
    >
      {children}
    </div>,
    document.body,
  );
}

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
  const genreContentRef = useRef<HTMLDivElement>(null);
  const [djTypeOpen, setDjTypeOpen] = useState(false);
  const djTypeRef = useRef<HTMLDivElement>(null);
  const djTypeContentRef = useRef<HTMLDivElement>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const countryContentRef = useRef<HTMLDivElement>(null);
  const [cityOpen, setCityOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);
  const cityContentRef = useRef<HTMLDivElement>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const sortContentRef = useRef<HTMLDivElement>(null);

  const closeAllExcept = (
    keep?: "genre" | "country" | "city" | "djType" | "sort",
  ) => {
    if (keep !== "genre") setGenreOpen(false);
    if (keep !== "country") setCountryOpen(false);
    if (keep !== "city") setCityOpen(false);
    if (keep !== "djType") setDjTypeOpen(false);
    if (keep !== "sort") setSortOpen(false);
  };

  useEffect(() => {
    const isOutside = (
      triggerRef: React.RefObject<HTMLElement | null>,
      contentRef: React.RefObject<HTMLElement | null>,
      target: Node,
    ) => {
      const inTrigger = triggerRef.current?.contains(target) ?? false;
      const inContent = contentRef.current?.contains(target) ?? false;
      return !inTrigger && !inContent;
    };

    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (isOutside(genreRef, genreContentRef, target)) setGenreOpen(false);
      if (isOutside(djTypeRef, djTypeContentRef, target)) setDjTypeOpen(false);
      if (isOutside(countryRef, countryContentRef, target))
        setCountryOpen(false);
      if (isOutside(cityRef, cityContentRef, target)) setCityOpen(false);
      if (isOutside(sortRef, sortContentRef, target)) setSortOpen(false);
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
          <div ref={genreRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setGenreOpen((o) => !o);
                closeAllExcept("genre");
              }}
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

            <DropdownPortal
              anchorRef={genreRef}
              open={genreOpen}
              contentRef={genreContentRef}
            >
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
            </DropdownPortal>
          </div>
        </div>

        {/* Country */}
        <div className="flex w-[calc(50%-6px)] flex-col gap-2 xl:w-full">
          <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
            Country
          </p>
          <div ref={countryRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setCountryOpen((o) => !o);
                closeAllExcept("country");
              }}
              className="bg-h_black/50 focus:ring-h_red flex w-full items-center justify-between rounded-md px-3 py-2 text-xs ring-1 ring-gray-700 outline-none"
            >
              <span
                className={currentCountry ? "text-h_white" : "text-gray-300"}
              >
                {currentCountry || "All countries"}
              </span>
              <svg
                className={`h-3 w-3 text-gray-400 transition-transform ${countryOpen ? "rotate-180" : ""}`}
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

            <DropdownPortal
              anchorRef={countryRef}
              open={countryOpen}
              contentRef={countryContentRef}
            >
              <div
                className="cursor-pointer border-b border-gray-800 px-3 py-2 hover:bg-white/5"
                onClick={() => {
                  updateCountry("");
                  setCountryOpen(false);
                }}
              >
                <span className="text-xs text-gray-300">All countries</span>
              </div>
              {availableCountries.map((c) => (
                <div
                  key={c}
                  className="cursor-pointer px-3 py-2 hover:bg-white/5"
                  onClick={() => {
                    updateCountry(c);
                    setCountryOpen(false);
                  }}
                >
                  <span className="text-xs text-gray-300">{c}</span>
                </div>
              ))}
            </DropdownPortal>
          </div>
        </div>

        {/* City — appears after country is selected */}
        {currentCountry && citiesForCountry.length > 0 && (
          <div className="flex w-[calc(50%-6px)] flex-col gap-2 xl:w-full">
            <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
              City
            </p>
            <div ref={cityRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setCityOpen((o) => !o);
                  closeAllExcept("city");
                }}
                className="bg-h_black/50 focus:ring-h_red flex w-full items-center justify-between rounded-md px-3 py-2 text-xs ring-1 ring-gray-700 outline-none"
              >
                <span
                  className={currentCity ? "text-h_white" : "text-gray-300"}
                >
                  {currentCity || "All cities"}
                </span>
                <svg
                  className={`h-3 w-3 text-gray-400 transition-transform ${cityOpen ? "rotate-180" : ""}`}
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

              <DropdownPortal
                anchorRef={cityRef}
                open={cityOpen}
                contentRef={cityContentRef}
              >
                <div
                  className="cursor-pointer border-b border-gray-800 px-3 py-2 hover:bg-white/5"
                  onClick={() => {
                    updateParam("city", "");
                    setCityOpen(false);
                  }}
                >
                  <span className="text-xs text-gray-300">All cities</span>
                </div>
                {citiesForCountry.map((c) => (
                  <div
                    key={c}
                    className="cursor-pointer px-3 py-2 hover:bg-white/5"
                    onClick={() => {
                      updateParam("city", c);
                      setCityOpen(false);
                    }}
                  >
                    <span className="text-xs text-gray-300">{c}</span>
                  </div>
                ))}
              </DropdownPortal>
            </div>
          </div>
        )}

        {/* DJ Type */}
        <div className="flex w-[calc(50%-6px)] flex-col gap-2 xl:w-full">
          <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
            DJ Type
          </p>
          <div ref={djTypeRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setDjTypeOpen((o) => !o);
                closeAllExcept("djType");
              }}
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

            <DropdownPortal
              anchorRef={djTypeRef}
              open={djTypeOpen}
              contentRef={djTypeContentRef}
            >
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
            </DropdownPortal>
          </div>
        </div>

        {/* Sort */}
        <div className="flex w-[calc(50%-6px)] flex-col gap-2 xl:w-full">
          <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
            Sort By
          </p>
          <div ref={sortRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setSortOpen((o) => !o);
                closeAllExcept("sort");
              }}
              className="bg-h_black/50 focus:ring-h_red flex w-full items-center justify-between rounded-md px-3 py-2 text-xs ring-1 ring-gray-700 outline-none"
            >
              <span className={currentSort ? "text-h_white" : "text-gray-300"}>
                {SORT_OPTIONS.find((o) => o.value === currentSort)?.label ||
                  "Recommended"}
              </span>
              <svg
                className={`h-3 w-3 text-gray-400 transition-transform ${sortOpen ? "rotate-180" : ""}`}
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

            <DropdownPortal
              anchorRef={sortRef}
              open={sortOpen}
              contentRef={sortContentRef}
            >
              {SORT_OPTIONS.map((o) => (
                <div
                  key={o.value}
                  className="cursor-pointer px-3 py-2 hover:bg-white/5"
                  onClick={() => {
                    updateParam("sort", o.value);
                    setSortOpen(false);
                  }}
                >
                  <span className="text-xs text-gray-300">{o.label}</span>
                </div>
              ))}
            </DropdownPortal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
