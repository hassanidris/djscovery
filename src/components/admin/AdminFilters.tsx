"use client";

import { useRouter, usePathname } from "next/navigation";
import { useRef, useCallback, useEffect, useState } from "react";
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

type Props = {
  filters: FilterConfig[];
  currentValues: Record<string, string>;
  searchKey?: string;
  searchPlaceholder?: string;
  currentSearch?: string;
};

export default function AdminFilters({
  filters,
  currentValues,
  searchKey,
  searchPlaceholder = "Search...",
  currentSearch = "",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [searchValue, setSearchValue] = useState(currentSearch);

  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

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
          className="h-9 w-52 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus-visible:ring-white/20"
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
