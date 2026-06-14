"use client";

import { useState, useEffect } from "react";
import { getCitiesForCountry } from "@/lib/actions/locations";
import { GIG_TYPE_OPTIONS } from "@/config/gig-type-fields";
import type { StepProps, CityOption } from "./GigForm";

export function GigFormStep1({
  data,
  errors,
  onChange,
  onNext,
  countries,
}: StepProps) {
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    if (!data.countryId) {
      setCities([]);
      if (data.cityId) onChange("cityId", "");
      return;
    }
    setLoadingCities(true);
    getCitiesForCountry(parseInt(data.countryId)).then((c) => {
      setCities(c);
      setLoadingCities(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.countryId]);

  const inputCls =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-white/25 focus:outline-none";
  const selectCls =
    "w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white focus:border-white/25 focus:outline-none";

  const typeDescription = GIG_TYPE_OPTIONS.find(
    (o) => o.value === data.gigType,
  )?.description;

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white">
          Gig Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="e.g. Club Night DJ for Saturday"
          className={inputCls}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-400">{errors.title}</p>
        )}
      </div>

      {/* Gig Type */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white">
          Gig Type <span className="text-red-400">*</span>
        </label>
        <select
          value={data.gigType}
          onChange={(e) => onChange("gigType", e.target.value)}
          className={selectCls}
        >
          <option value="">Select gig type…</option>
          {GIG_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {typeDescription && (
          <p className="mt-1.5 text-xs text-gray-500">{typeDescription}</p>
        )}
        {errors.gigType && (
          <p className="mt-1 text-xs text-red-400">{errors.gigType}</p>
        )}
      </div>

      {/* Event Date */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white">
          Event Date &amp; Time <span className="text-red-400">*</span>
        </label>
        <input
          type="datetime-local"
          value={data.eventDate}
          onChange={(e) => onChange("eventDate", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white scheme-dark focus:border-white/25 focus:outline-none"
        />
        {errors.eventDate && (
          <p className="mt-1 text-xs text-red-400">{errors.eventDate}</p>
        )}
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white">
            Country
          </label>
          <select
            value={data.countryId}
            onChange={(e) => onChange("countryId", e.target.value)}
            className={selectCls}
          >
            <option value="">Select country…</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white">
            City
          </label>
          <select
            value={data.cityId}
            onChange={(e) => onChange("cityId", e.target.value)}
            disabled={!data.countryId || loadingCities}
            className={`${selectCls} disabled:opacity-50`}
          >
            <option value="">
              {loadingCities
                ? "Loading…"
                : data.countryId
                  ? "Select city…"
                  : "Select country first"}
            </option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white">
          Description{" "}
          <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea
          value={data.description}
          onChange={(e) => onChange("description", e.target.value)}
          rows={4}
          placeholder="Describe the gig, atmosphere, and what you're looking for in a DJ…"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-white/25 focus:outline-none"
        />
      </div>

      {/* Nav */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white/90"
        >
          Next: Requirements →
        </button>
      </div>
    </div>
  );
}
