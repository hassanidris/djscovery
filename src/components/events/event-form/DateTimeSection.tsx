"use client";

import { CalendarDays, Clock, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { getTimezoneOffsetLabel } from "@/lib/timezones";
import type { EventFormErrors } from "./types";

export function DateTimeSection({
  data,
  set,
  errors,
}: {
  data: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  set: (
    field: "startDate" | "endDate" | "startTime" | "endTime" | "timezone",
    value: unknown,
  ) => void;
  errors: EventFormErrors;
}) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-widest text-zinc-400 uppercase">
        <CalendarDays className="h-4 w-4" /> Date &amp; Time
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="startDate" className="text-zinc-300">
            Start Date <span className="text-red-500">*</span>
          </Label>
          <DatePicker
            id="startDate"
            value={data.startDate}
            onChange={(v) => set("startDate", v)}
            placeholder="Select start date"
            className="border-zinc-700 bg-zinc-900 focus:border-zinc-500"
          />
          {errors.startDate && (
            <p className="text-xs text-red-400">{errors.startDate}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="endDate" className="text-zinc-300">
            End Date
          </Label>
          <DatePicker
            id="endDate"
            value={data.endDate}
            onChange={(v) => set("endDate", v)}
            placeholder="Select end date"
            className="border-zinc-700 bg-zinc-900 focus:border-zinc-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label
            htmlFor="startTime"
            className="flex items-center gap-1 text-zinc-300"
          >
            <Clock className="h-3.5 w-3.5" /> Start Time
          </Label>
          <TimePicker
            id="startTime"
            value={data.startTime}
            onChange={(v) => set("startTime", v)}
            placeholder="Select start time"
            className="border-zinc-700 bg-zinc-900 focus:border-zinc-500"
          />
          {errors.startTime && (
            <p className="text-xs text-red-400">{errors.startTime}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="endTime"
            className="flex items-center gap-1 text-zinc-300"
          >
            <Clock className="h-3.5 w-3.5" /> End Time
          </Label>
          <TimePicker
            id="endTime"
            value={data.endTime}
            onChange={(v) => set("endTime", v)}
            placeholder="Select end time"
            className="border-zinc-700 bg-zinc-900 focus:border-zinc-500"
          />
          {errors.endTime && (
            <p className="text-xs text-red-400">{errors.endTime}</p>
          )}
        </div>
      </div>

      {/* Timezone */}
      <div className="space-y-1.5">
        <Label
          htmlFor="timezone"
          className="flex items-center gap-1 text-zinc-300"
        >
          <Globe className="h-3.5 w-3.5" /> Timezone
        </Label>
        <Input
          id="timezone"
          value={data.timezone}
          onChange={(e) => set("timezone", e.target.value)}
          placeholder="Europe/Stockholm"
          className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 focus:border-zinc-500"
        />
        <p className="text-xs text-zinc-400">
          {data.timezone
            ? `Auto-detected from country — ${data.timezone} (UTC${getTimezoneOffsetLabel(data.timezone)}). Adjust if needed.`
            : "Auto-detected from country. Adjust if needed."}
        </p>
      </div>
    </section>
  );
}
