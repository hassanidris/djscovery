"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { VALID_EVENT_CATEGORIES } from "@/lib/event-categories";

const CATEGORY_LABELS: Record<string, string> = {
  CLUB_NIGHT: "Club Night",
  FESTIVAL: "Festival",
  WEDDING: "Wedding",
  BIRTHDAY: "Birthday",
  CORPORATE: "Corporate",
  BEACH_PARTY: "Beach Party",
  LOUNGE: "Lounge",
  RESTAURANT_SET: "Restaurant Set",
  PRIVATE_PARTY: "Private Party",
  OPEN_AIR: "Open Air",
  LUXURY_EVENT: "Luxury Event",
  OTHER: "Other",
};

export function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "all";

  function handleCategoryChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.push(`/events?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-4">
      <label htmlFor="category-filter" className="text-sm text-zinc-400">
        Category:
      </label>
      <select
        id="category-filter"
        value={currentCategory}
        onChange={(e) => handleCategoryChange(e.target.value)}
        className="border-zinc-700 bg-zinc-900 text-sm text-white focus:border-h_red focus:ring-h_red rounded-md border px-3 py-2"
      >
        <option value="all">All Categories</option>
        {VALID_EVENT_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {CATEGORY_LABELS[category] || category}
          </option>
        ))}
      </select>
    </div>
  );
}
