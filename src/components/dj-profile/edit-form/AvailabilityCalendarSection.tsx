"use client";

import { Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/forms/SectionCard";
import {
  isValidMonthFormat,
  daysInMonth,
  firstDayOffset,
} from "./availability-utils";
import type { AvailabilityDay } from "./types";

export function AvailabilityCalendarSection({
  isPremium,
  availabilityMonth,
  setAvailabilityMonth,
  availabilityTimezone,
  setAvailabilityTimezone,
  availabilityDays,
  setAvailabilityDays,
}: {
  isPremium: boolean;
  availabilityMonth: string;
  setAvailabilityMonth: (v: string) => void;
  availabilityTimezone: string;
  setAvailabilityTimezone: (v: string) => void;
  availabilityDays: AvailabilityDay[];
  setAvailabilityDays: React.Dispatch<React.SetStateAction<AvailabilityDay[]>>;
}) {
  function getDayStatus(day: number): string {
    const found = availabilityDays.find((d) => d.day === day);
    return found?.status ?? "free";
  }

  function cycleDayStatus(day: number) {
    const order = ["free", "available", "booked", "tentative"];
    const current = getDayStatus(day);
    const next = order[(order.indexOf(current) + 1) % order.length];
    setAvailabilityDays((prev) => {
      const filtered = prev.filter((d) => d.day !== day);
      if (next === "free") return filtered;
      return [...filtered, { day, status: next }];
    });
  }

  if (isPremium) {
    return (
      <SectionCard
        title="Availability Calendar"
        subtitle="Click days to set your schedule"
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs text-gray-300">
                Month (YYYY-MM)
              </Label>
              <Input
                value={availabilityMonth}
                onChange={(e) => setAvailabilityMonth(e.target.value)}
                placeholder="2025-09"
                maxLength={7}
                className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-gray-300">
                Timezone
              </Label>
              <Input
                value={availabilityTimezone}
                onChange={(e) => setAvailabilityTimezone(e.target.value)}
                placeholder="Europe/London"
                className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          {availabilityMonth && isValidMonthFormat(availabilityMonth) && (
            <div>
              <div className="mb-2 flex items-center gap-4">
                {[
                  { color: "bg-emerald-500", label: "Available" },
                  { color: "bg-h_red", label: "Booked" },
                  { color: "bg-amber-500", label: "Tentative" },
                  { color: "bg-white/10", label: "Free" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={`size-2.5 rounded-full ${l.color}`} />
                    <span className="text-xs text-gray-400">{l.label}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div
                    key={d}
                    className="pb-1 text-center text-[11px] font-semibold text-gray-400"
                  >
                    {d}
                  </div>
                ))}
                {Array.from({
                  length: firstDayOffset(availabilityMonth) ?? 0,
                }).map((_, i) => (
                  <div key={`e${i}`} />
                ))}
                {Array.from({
                  length: daysInMonth(availabilityMonth) ?? 0,
                }).map((_, i) => {
                  const day = i + 1;
                  const status = getDayStatus(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => cycleDayStatus(day)}
                      className={`flex h-9 items-center justify-center rounded-md text-xs font-medium transition-all ${
                        status === "booked"
                          ? "bg-h_red/20 text-h_redLight border-h_red/30 border"
                          : status === "tentative"
                            ? "border border-amber-500/30 bg-amber-500/20 text-amber-400"
                            : status === "available"
                              ? "border border-emerald-500/25 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                              : "text-gray-400 hover:bg-white/5"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Availability Calendar"
      subtitle="Click days to set your schedule — Premium only"
    >
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <Crown className="h-6 w-6 text-amber-500" />
        <p className="text-sm text-gray-400">
          Upgrade to Premium to set your availability calendar and let
          organizers know when you are free.
        </p>
      </div>
    </SectionCard>
  );
}
