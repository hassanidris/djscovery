"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const SORT_LABELS: Record<string, string> = {
  "a-z": "A – Z",
  "z-a": "Z – A",
  "most-followed": "Most Followed",
};

const ActiveFilterBadges = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const genre = searchParams.get("genre") || "";
  const country = searchParams.get("country") || "";
  const city = searchParams.get("city") || "";
  const sort = searchParams.get("sort") || "";

  const selectedGenres = genre ? genre.split(",").filter(Boolean) : [];

  const removeParam = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  const removeGenre = (g: string) => {
    const updated = selectedGenres.filter((sg) => sg !== g).join(",");
    const params = new URLSearchParams(searchParams.toString());
    if (updated) params.set("genre", updated);
    else params.delete("genre");
    router.push(`${pathname}?${params.toString()}`);
  };

  const removeCountry = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("country");
    params.delete("city");
    router.push(`${pathname}?${params.toString()}`);
  };

  type Badge = { label: string; onRemove: () => void };

  const badges: Badge[] = [
    ...selectedGenres.map((g) => ({
      label: g,
      onRemove: () => removeGenre(g),
    })),
    ...(country ? [{ label: country, onRemove: removeCountry }] : []),
    ...(city ? [{ label: city, onRemove: () => removeParam("city") }] : []),
    ...(sort
      ? [
          {
            label: SORT_LABELS[sort] ?? sort,
            onRemove: () => removeParam("sort"),
          },
        ]
      : []),
  ];

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {badges.map((badge, i) => (
        <span
          key={i}
          className="flex items-center gap-1.5 bg-h_red/10 text-red-400 text-xs px-2.5 py-1 rounded-full border border-h_red/50"
        >
          {badge.label}
          <button
            onClick={badge.onRemove}
            className="hover:text-white transition-colors leading-none cursor-pointer"
            aria-label={`Remove ${badge.label} filter`}
          >
            ×
          </button>
        </span>
      ))}
      <button
        onClick={() => router.push(pathname)}
        className="text-xs text-gray-400 hover:text-white underline underline-offset-2 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
};

export default ActiveFilterBadges;
