"use client";

import { Check } from "lucide-react";
import { DJ_TYPES } from "@/config/dj-types";
import { sectionCls, sectionTitleCls } from "./constants";

export function DjTypeSection({
  djTypes,
  toggleDjType,
  error,
}: {
  djTypes: string[];
  toggleDjType: (value: string) => void;
  error?: { message?: string } | undefined;
}) {
  return (
    <div className={`${sectionCls} ${error ? "border-red-500/40" : ""}`}>
      <h2 className={sectionTitleCls}>
        DJ Type <span className="text-h_redLight">*</span>
      </h2>
      <p className="-mt-2 text-xs text-gray-400">
        Select all that apply — this will be used for search filters.
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {DJ_TYPES.map((t) => {
          const checked = djTypes.includes(t.value);
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => toggleDjType(t.value)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                checked
                  ? "bg-h_red/15 border-h_red text-white"
                  : "border-white/15 bg-white/5 text-gray-400 hover:border-white/30 hover:text-gray-200"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                  checked ? "bg-h_red border-h_red" : "border-white/30"
                }`}
              >
                {checked && <Check className="h-3 w-3 text-white" />}
              </span>
              <span>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {error && <p className="-mt-1 text-xs text-red-400">{error.message}</p>}
    </div>
  );
}
