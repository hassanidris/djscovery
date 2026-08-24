"use client";

import { Loader2 } from "lucide-react";
import { UseFormRegister } from "react-hook-form";
import type { CreateDjProfileInput } from "@/lib/validations/dj-profile";
import { inputCls, labelCls, sectionCls, sectionTitleCls } from "./constants";

export type Country = { id: number; name: string; code: string };
export type City = { id: number; name: string };

export function LocationSection({
  register,
  countries,
  countryId,
  cities,
  loadingCities,
  handleCountryChange,
  errors,
}: {
  register: UseFormRegister<CreateDjProfileInput>;
  countries: Country[];
  countryId: number;
  cities: City[];
  loadingCities: boolean;
  handleCountryChange: (id: number) => void;
  errors: {
    countryId?: { message?: string };
    cityId?: { message?: string };
  };
}) {
  return (
    <div
      className={`${sectionCls} ${errors.countryId || errors.cityId ? "border-red-500/40" : ""}`}
    >
      <h2 className={sectionTitleCls}>Location</h2>

      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>
          Country <span className="text-h_redLight">*</span>
        </label>
        <select
          {...register("countryId", { valueAsNumber: true })}
          onChange={(e) => handleCountryChange(Number(e.target.value))}
          className={`${inputCls} cursor-pointer appearance-none`}
        >
          <option value="0">Select a country...</option>
          {countries.map((c) => (
            <option
              key={c.id}
              value={c.id}
              className="bg-[#1a1a1a] text-white"
            >
              {c.name}
            </option>
          ))}
        </select>
        {errors.countryId && (
          <p className="mt-1 text-xs text-red-400">
            {errors.countryId.message}
          </p>
        )}
      </div>

      {countryId > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            City <span className="text-h_redLight">*</span>
          </label>
          {loadingCities ? (
            <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading cities...
            </div>
          ) : (
            <select
              {...register("cityId", { valueAsNumber: true })}
              className={`${inputCls} cursor-pointer appearance-none ${errors.cityId ? "ring-red-500/50" : ""}`}
            >
              <option value="0">Select a city...</option>
              {cities.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                  className="bg-[#1a1a1a] text-white"
                >
                  {c.name}
                </option>
              ))}
            </select>
          )}
          {errors.cityId && (
            <p className="mt-1 text-xs text-red-400">
              {errors.cityId.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
