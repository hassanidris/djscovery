"use client";

import { UseFormRegister } from "react-hook-form";
import type { CreateDjProfileInput } from "@/lib/validations/dj-profile";
import { CURRENCIES } from "@/config/currencies";
import { inputCls, labelCls, sectionCls, sectionTitleCls } from "./constants";

export function FeePricingSection({
  register,
  errors,
}: {
  register: UseFormRegister<CreateDjProfileInput>;
  errors: {
    feeMin?: { message?: string };
    feeMax?: { message?: string };
    feeCurrency?: { message?: string };
  };
}) {
  return (
    <div className={sectionCls}>
      <h2 className={sectionTitleCls}>
        Fee/Pricing{" "}
        <span className="text-sm font-normal text-gray-400">(optional)</span>
      </h2>
      <p className="-mt-2 text-xs text-gray-400">
        Set your booking fee range. Currency auto-detected from your country.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Minimum Fee</label>
          <input
            {...register("feeMin", {
              setValueAs: (v) =>
                v === "" || isNaN(Number(v)) ? undefined : Number(v),
            })}
            type="number"
            min="0"
            placeholder="e.g. 500"
            className={inputCls}
          />
          {errors.feeMin && (
            <p className="text-xs text-red-400">{errors.feeMin.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Maximum Fee</label>
          <input
            {...register("feeMax", {
              setValueAs: (v) =>
                v === "" || isNaN(Number(v)) ? undefined : Number(v),
            })}
            type="number"
            min="0"
            placeholder="e.g. 2000"
            className={inputCls}
          />
          {errors.feeMax && (
            <p className="text-xs text-red-400">{errors.feeMax.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Currency</label>
          <select
            {...register("feeCurrency")}
            className={`${inputCls} cursor-pointer appearance-none`}
          >
            <option value="">Select currency...</option>
            {CURRENCIES.map((currency) => (
              <option
                key={currency.code}
                value={currency.code}
                className="bg-[#1a1a1a] text-white"
              >
                {currency.code} ({currency.symbol})
              </option>
            ))}
          </select>
          {errors.feeCurrency && (
            <p className="text-xs text-red-400">
              {errors.feeCurrency.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
