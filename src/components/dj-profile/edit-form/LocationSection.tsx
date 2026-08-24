"use client";

import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/forms/SectionCard";
import type { Country, City } from "./types";

export function LocationSection({
  countries,
  cities,
  countryId,
  cityId,
  setCountryId,
  setCityId,
  submitted,
  countryError,
}: {
  countries: Country[];
  cities: City[];
  countryId: number | null;
  cityId: number | null;
  setCountryId: (v: number | null) => void;
  setCityId: (v: number | null) => void;
  submitted: boolean;
  countryError: boolean;
}) {
  return (
    <SectionCard title="Location" subtitle="Where you are based">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="text-xs text-gray-300">
              Country <span className="text-h_redLight">*</span>
            </Label>
            {submitted && countryError && (
              <span className="text-[11px] text-red-400">
                Country is required
              </span>
            )}
          </div>
          <select
            value={countryId ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setCountryId(val ? Number(val) : null);
              setCityId(null);
            }}
            className={`focus:border-h_red/50 w-full rounded-md border bg-white/5 px-3 py-2 text-sm text-white focus:outline-none ${
              submitted && countryError
                ? "border-red-500/60"
                : "border-white/10"
            }`}
          >
            <option value="" className="bg-zinc-900">
              Select country
            </option>
            {countries.map((c) => (
              <option key={c.id} value={c.id} className="bg-zinc-900">
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-gray-300">City</Label>
          <select
            value={cityId ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setCityId(val ? Number(val) : null);
            }}
            disabled={!countryId || cities.length === 0}
            className="focus:border-h_red/50 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none disabled:opacity-40"
          >
            <option value="" className="bg-zinc-900">
              {cities.length === 0 ? "Select country first" : "Select city"}
            </option>
            {cities.map((c) => (
              <option key={c.id} value={c.id} className="bg-zinc-900">
                {c.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-gray-400">
            Helps bookers find local DJs
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
