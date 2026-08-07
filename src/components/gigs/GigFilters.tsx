"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { GIG_TYPE_OPTIONS } from "@/config/gig-type-fields";

export function GigFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeType = searchParams.get("type") ?? "";
  const activeQ = searchParams.get("q") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function clearAll() {
    router.replace(pathname, { scroll: false });
  }

  const hasFilters = !!(activeType || activeQ);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-48 flex-1">
        <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={activeQ}
          onChange={(e) => updateParam("q", e.target.value)}
          placeholder="Search gigs…"
          className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pr-3 pl-9 text-sm text-white placeholder:text-gray-400 focus:border-white/25 focus:outline-none"
        />
      </div>

      {/* Gig type filter */}
      <select
        value={activeType}
        onChange={(e) => updateParam("type", e.target.value)}
        className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:border-white/25 focus:outline-none"
      >
        <option value="">All types</option>
        {GIG_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
