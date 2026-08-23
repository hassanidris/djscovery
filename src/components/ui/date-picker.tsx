"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

/**
 * Convert a "YYYY-MM-DD" string to a Date at local midnight (avoids
 * timezone off-by-one when the calendar renders).
 */
function parseDateString(value: string): Date | undefined {
  if (!value) return undefined;
  // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm" formats
  const datePart = value.split("T")[0];
  const d = parseISO(datePart);
  return isValid(d) ? d : undefined;
}

/**
 * Convert a Date back to a "YYYY-MM-DD" string.
 */
function toDateString(d: Date | undefined): string {
  if (!d) return "";
  return format(d, "yyyy-MM-dd");
}

export interface DatePickerProps {
  /** Current value as "YYYY-MM-DD" (optionally with THH:mm). */
  value?: string;
  /** Called with the selected date as "YYYY-MM-DD". */
  onChange: (value: string) => void;
  /** Placeholder text when empty. */
  placeholder?: string;
  /** Disable the picker. */
  disabled?: boolean;
  /** Optional id for the trigger button. */
  id?: string;
  /** Extra classes for the trigger button. */
  className?: string;
  /** Dates that should be disabled (e.g. past dates). */
  disabledDates?: Date[];
  /** Compact variant for filter bars (smaller height). */
  compact?: boolean;
}

/**
 * A shadcn-style date picker built on Popover + Calendar.
 *
 * Works with string dates ("YYYY-MM-DD") to match the existing form
 * state shape used across gig/event/venue forms.
 */
export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(
    {
      value,
      onChange,
      placeholder = "Pick a date",
      disabled,
      id,
      className,
      disabledDates,
      compact,
    },
    ref,
  ) {
    const [open, setOpen] = React.useState(false);
    const selected = parseDateString(value ?? "");

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            id={id}
            type="button"
            disabled={disabled}
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-md border text-sm transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              compact ? "h-9 px-3" : "h-10 px-3 py-2",
              "border-white/10 bg-white/5 text-white",
              !selected && "text-gray-400",
              "focus:border-white/25",
              "hover:bg-white/10",
              className,
            )}
          >
            <span className={cn(!selected && "text-gray-400")}>
              {selected ? format(selected, "MMM d, yyyy") : placeholder}
            </span>
            <CalendarIcon className="size-4 shrink-0 opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto border-white/10 bg-zinc-900 p-0"
          align="start"
        >
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => {
              onChange(toDateString(d ?? undefined));
              setOpen(false);
            }}
            disabled={disabledDates}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    );
  },
);
