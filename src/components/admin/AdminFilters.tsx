"use client";

import { useRouter, usePathname } from "next/navigation";
import { useRef, useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export type FilterConfig = {
  key: string;
  placeholder: string;
  options: { value: string; label: string }[];
};

type DateRangeConfig = {
  startDateKey: string;
  endDateKey: string;
};

type RatingRangeConfig = {
  minKey: string;
  maxKey: string;
};

type Props = {
  filters: FilterConfig[];
  currentValues: Record<string, string>;
  searchKey?: string;
  searchPlaceholder?: string;
  currentSearch?: string;
  dateRange?: DateRangeConfig;
  ratingRange?: RatingRangeConfig;
};

export default function AdminFilters({
  filters,
  currentValues,
  searchKey,
  searchPlaceholder = "Search...",
  currentSearch = "",
  dateRange,
  ratingRange,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [searchValue, setSearchValue] = useState(currentSearch);
  const [prevSearch, setPrevSearch] = useState(currentSearch);

  if (prevSearch !== currentSearch) {
    setPrevSearch(currentSearch);
    setSearchValue(currentSearch);
  }

  const buildUrl = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams();
      // Merge current values with updates, drop "all" sentinel and cursor
      const merged = { ...currentValues, ...updates };
      if (searchKey && currentSearch) merged[searchKey] = currentSearch;
      delete merged["cursor"];
      Object.entries(merged).forEach(([k, v]) => {
        if (v && v !== "all") params.set(k, v);
      });
      Object.entries(updates).forEach(([k, v]) => {
        if (!v || v === "all") params.delete(k);
      });
      return `${pathname}?${params.toString()}`;
    },
    [currentValues, currentSearch, searchKey, pathname],
  );

  function handleSelectChange(key: string, value: string) {
    router.push(buildUrl({ [key]: value, cursor: "" }));
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!searchKey) return;
      const params = new URLSearchParams();
      Object.entries(currentValues).forEach(([k, v]) => {
        if (v && v !== "all") params.set(k, v);
      });
      if (value) params.set(searchKey, value);
      params.delete("cursor");
      router.push(`${pathname}?${params.toString()}`);
    }, 400);
  }

  function handleDateChange(key: string, value: string) {
    const params = new URLSearchParams();
    Object.entries(currentValues).forEach(([k, v]) => {
      if (v && v !== "all") params.set(k, v);
    });
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("cursor");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleRatingChange(key: string, value: string) {
    const params = new URLSearchParams();
    Object.entries(currentValues).forEach(([k, v]) => {
      if (v && v !== "all") params.set(k, v);
    });
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("cursor");
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasActiveFilters =
    Object.values(currentValues).some((v) => v && v !== "all") ||
    !!currentSearch;

  function clearAll() {
    router.push(pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {searchKey && (
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={handleSearchChange}
          className="h-9 w-full border-white/10 bg-white/5 text-white placeholder:text-gray-400 focus-visible:ring-white/20 sm:w-52"
        />
      )}
      {filters.map((f) => (
        <Select
          key={f.key}
          value={currentValues[f.key] || "all"}
          onValueChange={(v) => handleSelectChange(f.key, v)}
        >
          <SelectTrigger className="h-9 w-44 border-white/10 bg-white/5 text-white">
            <SelectValue placeholder={f.placeholder} />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-zinc-900 text-white">
            <SelectItem value="all">{f.placeholder}</SelectItem>
            {f.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {dateRange && (
        <>
          <Input
            type="date"
            placeholder="Start Date"
            value={currentValues[dateRange.startDateKey] || ""}
            onChange={(e) =>
              handleDateChange(dateRange.startDateKey, e.target.value)
            }
            className="h-9 w-36 border-white/10 bg-white/5 text-white placeholder:text-gray-400 focus-visible:ring-white/20"
          />
          <Input
            type="date"
            placeholder="End Date"
            value={currentValues[dateRange.endDateKey] || ""}
            onChange={(e) =>
              handleDateChange(dateRange.endDateKey, e.target.value)
            }
            className="h-9 w-36 border-white/10 bg-white/5 text-white placeholder:text-gray-400 focus-visible:ring-white/20"
          />
        </>
      )}
      {ratingRange && (
        <>
          <Input
            type="number"
            min="1"
            max="5"
            placeholder="Min Rating"
            value={currentValues[ratingRange.minKey] || ""}
            onChange={(e) =>
              handleRatingChange(ratingRange.minKey, e.target.value)
            }
            className="h-9 w-28 border-white/10 bg-white/5 text-white placeholder:text-gray-400 focus-visible:ring-white/20"
          />
          <Input
            type="number"
            min="1"
            max="5"
            placeholder="Max Rating"
            value={currentValues[ratingRange.maxKey] || ""}
            onChange={(e) =>
              handleRatingChange(ratingRange.maxKey, e.target.value)
            }
            className="h-9 w-28 border-white/10 bg-white/5 text-white placeholder:text-gray-400 focus-visible:ring-white/20"
          />
        </>
      )}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="h-9 gap-1.5 text-gray-400 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
