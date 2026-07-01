"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CalendarRange, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
] as const;

type DashboardRange = (typeof RANGE_OPTIONS)[number]["value"];

function getLabel(range: string): string {
  const match = RANGE_OPTIONS.find((option) => option.value === range);
  return match ? match.label : RANGE_OPTIONS[0].label;
}

export function DashboardRangePicker({
  currentRange,
}: {
  currentRange: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (value: DashboardRange) => {
    const params = new URLSearchParams(searchParams ?? undefined);
    params.set("range", value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-10 rounded-xl border-white/10 bg-white/5 text-xs font-medium text-white hover:bg-white/10"
        >
          <CalendarRange className="mr-2 h-4 w-4" aria-hidden />
          {getLabel(currentRange)}
          <ChevronDown className="ml-2 h-3 w-3 text-gray-400" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-40 bg-[#131622] text-white"
        align="end"
      >
        {RANGE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => handleSelect(option.value)}
            className={cn(
              "focus:bg-h_red/20 cursor-pointer px-2 py-2 text-sm text-gray-300 focus:text-white",
              option.value === currentRange && "bg-h_red/10 text-white",
            )}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type { DashboardRange };
