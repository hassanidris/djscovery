"use client";

import { Globe, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CountryOption, CityOption, EventFormErrors } from "./types";

export function LocationSection({
  countries,
  cities,
  data,
  set,
  onCountryChange,
  errors,
}: {
  countries: CountryOption[];
  cities: CityOption[];
  data: { countryId: string; cityId: string; venue: string };
  set: (field: "cityId" | "venue", value: unknown) => void;
  onCountryChange: (countryId: string) => void;
  errors: EventFormErrors;
}) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-widest text-zinc-400 uppercase">
        <MapPin className="h-4 w-4" /> Location
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label
            htmlFor="countryId"
            className="flex items-center gap-1 text-zinc-300"
          >
            <Globe className="h-3.5 w-3.5" /> Country{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.countryId}
            onValueChange={(v) => onCountryChange(v)}
          >
            <SelectTrigger
              id="countryId"
              className="w-full border-zinc-700 bg-zinc-900 text-white focus:border-zinc-500"
            >
              <SelectValue placeholder="Select country…" />
            </SelectTrigger>
            <SelectContent className="border-zinc-700 bg-zinc-900">
              {countries.map((c) => (
                <SelectItem
                  key={c.id}
                  value={String(c.id)}
                  className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
                >
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.countryId && (
            <p className="text-xs text-red-400">{errors.countryId}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cityId" className="text-zinc-300">
            City
          </Label>
          <Select
            value={data.cityId}
            onValueChange={(v) => set("cityId", v)}
            disabled={cities.length === 0}
          >
            <SelectTrigger
              id="cityId"
              className="w-full border-zinc-700 bg-zinc-900 text-white focus:border-zinc-500 disabled:opacity-40"
            >
              <SelectValue
                placeholder={
                  cities.length === 0
                    ? "Select country first"
                    : "Select city…"
                }
              />
            </SelectTrigger>
            <SelectContent className="border-zinc-700 bg-zinc-900">
              {cities.map((c) => (
                <SelectItem
                  key={c.id}
                  value={String(c.id)}
                  className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
                >
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="venue" className="text-zinc-300">
          Venue Name
        </Label>
        <Input
          id="venue"
          value={data.venue}
          onChange={(e) => set("venue", e.target.value)}
          placeholder="e.g. DC-10, Berghain, Avicii Arena"
          className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-400 focus:border-zinc-500"
        />
      </div>
    </section>
  );
}
