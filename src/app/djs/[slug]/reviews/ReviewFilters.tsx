"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewFiltersProps {
  currentSort: string;
  currentType: string;
}

export function ReviewFilters({ currentSort, currentType }: ReviewFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Sort By
        </label>
        <Select
          value={currentSort}
          onValueChange={(value) => updateFilter("sort", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
            <SelectItem value="highest">Highest Rated</SelectItem>
            <SelectItem value="lowest">Lowest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Review Type
        </label>
        <Select
          value={currentType}
          onValueChange={(value) => updateFilter("type", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="direct">Direct Reviews</SelectItem>
            <SelectItem value="event">Event Reviews</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
