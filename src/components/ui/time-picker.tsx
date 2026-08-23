"use client";

import * as React from "react";
import { ClockIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

/**
 * Generate time slots in "HH:mm" format at a given step (minutes).
 */
function generateTimeSlots(stepMinutes = 15): string[] {
  const slots: string[] = [];
  for (let m = 0; m < 24 * 60; m += stepMinutes) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(
      `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
    );
  }
  return slots;
}

/**
 * Convert "HH:mm" to a 12-hour display string like "2:30 PM".
 */
function format12h(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export interface TimePickerProps {
  /** Current value as "HH:mm" (24-hour). */
  value?: string;
  /** Called with the selected time as "HH:mm". */
  onChange: (value: string) => void;
  /** Placeholder text when empty. */
  placeholder?: string;
  /** Disable the picker. */
  disabled?: boolean;
  /** Optional id for the trigger button. */
  id?: string;
  /** Extra classes for the trigger button. */
  className?: string;
  /** Step between time slots in minutes (default 15). */
  step?: number;
  /** Compact variant for filter bars (smaller height). */
  compact?: boolean;
}

/**
 * A shadcn-style time picker built on Popover + Command.
 *
 * Works with "HH:mm" (24-hour) strings to match the existing form
 * state shape. Displays times in 12-hour format with AM/PM for
 * readability, with a searchable list.
 */
export const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
  function TimePicker(
    {
      value,
      onChange,
      placeholder = "Pick a time",
      disabled,
      id,
      className,
      step = 15,
      compact,
    },
    ref,
  ) {
    const [open, setOpen] = React.useState(false);
    const slots = React.useMemo(() => generateTimeSlots(step), [step]);

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
              !value && "text-gray-400",
              "focus:border-white/25",
              "hover:bg-white/10",
              className,
            )}
          >
            <span className={cn(!value && "text-gray-400")}>
              {value ? format12h(value) : placeholder}
            </span>
            <ClockIcon className="size-4 shrink-0 opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-48 border-white/10 bg-zinc-900 p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search time…" />
            <CommandList>
              <CommandEmpty>No time found.</CommandEmpty>
              <CommandGroup>
                {slots.map((slot) => (
                  <CommandItem
                    key={slot}
                    value={slot}
                    onSelect={() => {
                      onChange(slot);
                      setOpen(false);
                    }}
                    className={cn(
                      "text-white data-selected:bg-white/10",
                      value === slot && "bg-white/10",
                    )}
                  >
                    {format12h(slot)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);
