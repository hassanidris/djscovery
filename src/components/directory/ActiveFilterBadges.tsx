"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DJ_TYPES } from "./FilterBottomSheet";

const SORT_LABELS: Record<string, string> = {
  "a-z": "A – Z",
  "z-a": "Z – A",
  "most-followed": "Most Followed",
};

const DJ_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  DJ_TYPES.map((t) => [t.value, t.label]),
);

const ActiveFilterBadges = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const genre = searchParams.get("genre") || "";
  const country = searchParams.get("country") || "";
  const city = searchParams.get("city") || "";
  const sort = searchParams.get("sort") || "";
  const djType = searchParams.get("djType") || "";

  const selectedGenres = genre ? genre.split(",").filter(Boolean) : [];
  const selectedDjTypes = djType ? djType.split(",").filter(Boolean) : [];

  const removeParam = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const removeGenre = (g: string) => {
    const updated = selectedGenres.filter((sg) => sg !== g).join(",");
    const params = new URLSearchParams(searchParams.toString());
    if (updated) params.set("genre", updated);
    else params.delete("genre");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const removeDjType = (t: string) => {
    const updated = selectedDjTypes.filter((st) => st !== t).join(",");
    const params = new URLSearchParams(searchParams.toString());
    if (updated) params.set("djType", updated);
    else params.delete("djType");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const removeCountry = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("country");
    params.delete("city");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  type Badge = { label: string; onRemove: () => void };

  const badges: Badge[] = [
    ...selectedGenres.map((g) => ({
      label: `Genre: ${g}`,
      onRemove: () => removeGenre(g),
    })),
    ...selectedDjTypes.map((t) => ({
      label: `DJ Type: ${DJ_TYPE_LABEL[t] ?? t}`,
      onRemove: () => removeDjType(t),
    })),
    ...(country
      ? [{ label: `Country: ${country}`, onRemove: removeCountry }]
      : []),
    ...(city
      ? [{ label: `City: ${city}`, onRemove: () => removeParam("city") }]
      : []),
    ...(sort
      ? [
          {
            label: `Sort: ${SORT_LABELS[sort] ?? sort}`,
            onRemove: () => removeParam("sort"),
          },
        ]
      : []),
  ];

  if (badges.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {badges.map((badge, i) => (
        <span
          key={i}
          className="bg-h_red/10 border-h_red/50 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-red-400"
        >
          {badge.label}
          <button
            onClick={badge.onRemove}
            className="cursor-pointer leading-none transition-colors hover:text-white"
            aria-label={`Remove ${badge.label} filter`}
          >
            ×
          </button>
        </span>
      ))}
      <button
        onClick={() => router.push(pathname)}
        className="cursor-pointer text-xs text-gray-400 underline underline-offset-2 transition-colors hover:text-white"
      >
        Clear all
      </button>
    </div>
  );
};

export default ActiveFilterBadges;
