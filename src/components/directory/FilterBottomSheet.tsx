"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

const SORT_OPTIONS = [
  { value: "", label: "Newest" },
  { value: "a-z", label: "A – Z" },
  { value: "z-a", label: "Z – A" },
  { value: "most-followed", label: "Most Followed" },
];

export const DJ_TYPES = [
  { value: "WEDDING", label: "Wedding" },
  { value: "CLUB", label: "Club" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "FESTIVAL", label: "Festival" },
  { value: "PRIVATE_PARTY", label: "Private Party" },
  { value: "BAR_LOUNGE", label: "Lounge / Bar" },
  { value: "BIRTHDAY", label: "Birthday" },
  { value: "CULTURAL_EVENT", label: "Cultural Event" },
];

type DraftFilters = {
  genre: string[];
  country: string;
  city: string;
  sort: string;
  djType: string[];
};

const EMPTY_DRAFT: DraftFilters = {
  genre: [],
  country: "",
  city: "",
  sort: "",
  djType: [],
};

type Props = {
  genres?: string[];
  availableCountries?: string[];
  countryCities?: Record<string, string[]>;
};

const FilterBottomSheet = ({
  genres = [],
  availableCountries = [],
  countryCities = {},
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState<DraftFilters>(EMPTY_DRAFT);
  const sheetRef = useRef<HTMLDivElement>(null);

  const activeCount = [
    searchParams.get("genre"),
    searchParams.get("country"),
    searchParams.get("djType"),
  ].filter(Boolean).length;

  const openSheet = () => {
    setDraft({
      genre: searchParams.get("genre")?.split(",").filter(Boolean) ?? [],
      country: searchParams.get("country") ?? "",
      city: searchParams.get("city") ?? "",
      sort: searchParams.get("sort") ?? "",
      djType: searchParams.get("djType")?.split(",").filter(Boolean) ?? [],
    });
    setOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  };

  const closeSheet = () => {
    setVisible(false);
    setTimeout(() => setOpen(false), 300);
  };

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (draft.genre.length > 0) params.set("genre", draft.genre.join(","));
    else params.delete("genre");
    if (draft.country) {
      params.set("country", draft.country);
    } else params.delete("country");
    if (draft.city) {
      params.set("city", draft.city);
    } else params.delete("city");
    if (draft.sort) {
      params.set("sort", draft.sort);
    } else params.delete("sort");
    if (draft.djType.length > 0) params.set("djType", draft.djType.join(","));
    else params.delete("djType");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    closeSheet();
  };

  const reset = () => setDraft(EMPTY_DRAFT);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (visible && sheetRef.current) sheetRef.current.focus();
  }, [visible]);

  const citiesForCountry = countryCities[draft.country] ?? [];

  const toggleGenre = (g: string) =>
    setDraft((d) => ({
      ...d,
      genre: d.genre.includes(g)
        ? d.genre.filter((x) => x !== g)
        : [...d.genre, g],
    }));

  const toggleDjType = (t: string) =>
    setDraft((d) => ({
      ...d,
      djType: d.djType.includes(t)
        ? d.djType.filter((x) => x !== t)
        : [...d.djType, t],
    }));

  return (
    <>
      {/* Trigger — mobile only */}
      <div className="mb-3 flex items-center gap-2 xl:hidden">
        <button
          onClick={openSheet}
          aria-label="Open filters"
          className="bg-h_blackLight/60 hover:ring-h_red flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm text-gray-300 ring-1 ring-gray-700 transition-all hover:text-white"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="bg-h_red flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {open && (
        <>
          {/* Backdrop */}
          <div
            aria-hidden="true"
            onClick={closeSheet}
            className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
          />

          {/* Sheet */}
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filter DJs"
            tabIndex={-1}
            className={`bg-h_blackLight fixed right-0 bottom-0 left-0 z-50 flex max-h-[90dvh] flex-col rounded-t-2xl border-t border-gray-800 shadow-2xl transition-transform duration-300 ease-out outline-none ${visible ? "translate-y-0" : "translate-y-full"}`}
          >
            {/* Drag handle + header */}
            <div className="relative flex shrink-0 items-center justify-between border-b border-gray-800 px-5 pt-5 pb-4">
              <div className="absolute top-2.5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-gray-700" />
              <h2 className="text-h_white text-base font-semibold">Filters</h2>
              <button
                onClick={closeSheet}
                aria-label="Close filters"
                className="-mr-1 cursor-pointer rounded-md p-1 text-gray-400 transition-colors hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-5 py-5">
              {/* Genre */}
              {genres.length > 0 && (
                <section>
                  <p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Genre
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGenre(g)}
                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                          draft.genre.includes(g)
                            ? "bg-h_red/20 border-h_red text-h_red"
                            : "border-gray-700 bg-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* DJ Type */}
              <section>
                <p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  DJ Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {DJ_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => toggleDjType(t.value)}
                      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        draft.djType.includes(t.value)
                          ? "bg-h_red/20 border-h_red text-h_red"
                          : "border-gray-700 bg-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Country */}
              {availableCountries.length > 0 && (
                <section>
                  <p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Country
                  </p>
                  <select
                    value={draft.country}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        country: e.target.value,
                        city: "",
                      }))
                    }
                    className="bg-h_black/60 focus:ring-h_red w-full rounded-lg px-3 py-2.5 text-sm text-gray-300 ring-1 ring-gray-700 outline-none"
                  >
                    <option value="" className="bg-h_blackLight">
                      All countries
                    </option>
                    {availableCountries.map((c) => (
                      <option key={c} value={c} className="bg-h_blackLight">
                        {c}
                      </option>
                    ))}
                  </select>
                </section>
              )}

              {/* City — always visible, disabled until country is chosen */}
              <section>
                <p
                  className={`mb-3 text-xs font-semibold tracking-wider uppercase ${
                    draft.country ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  City
                </p>
                <select
                  value={draft.city}
                  disabled={!draft.country}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, city: e.target.value }))
                  }
                  className={`w-full rounded-lg px-3 py-2.5 text-sm ring-1 transition-colors outline-none ${
                    draft.country
                      ? "bg-h_black/60 focus:ring-h_red text-gray-300 ring-gray-700"
                      : "bg-h_black/30 cursor-not-allowed text-gray-600 ring-gray-800"
                  }`}
                >
                  <option value="" className="bg-h_blackLight">
                    {draft.country ? "All cities" : "Select a country first"}
                  </option>
                  {citiesForCountry.map((c) => (
                    <option key={c} value={c} className="bg-h_blackLight">
                      {c}
                    </option>
                  ))}
                </select>
              </section>

              {/* Sort */}
              <section>
                <p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Sort By
                </p>
                <select
                  value={draft.sort}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, sort: e.target.value }))
                  }
                  className="bg-h_black/60 focus:ring-h_red w-full rounded-lg px-3 py-2.5 text-sm text-gray-300 ring-1 ring-gray-700 outline-none"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option
                      key={o.value}
                      value={o.value}
                      className="bg-h_blackLight"
                    >
                      {o.label}
                    </option>
                  ))}
                </select>
              </section>
            </div>

            {/* Actions */}
            <div className="grid shrink-0 grid-cols-[1fr_2fr] gap-3 border-t border-gray-800 px-5 py-4">
              <button
                onClick={reset}
                className="cursor-pointer rounded-xl bg-gray-800 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
              >
                Reset
              </button>
              <button
                onClick={apply}
                className="bg-h_red cursor-pointer rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FilterBottomSheet;
