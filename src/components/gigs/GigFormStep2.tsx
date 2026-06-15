"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { isFieldVisible } from "@/config/gig-type-fields";
import type { StepProps } from "./GigForm";
import type { ExperienceLevel, GigType } from "@prisma/client";
import type { GigFieldKey } from "@/config/gig-type-fields";

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "OPEN", label: "Open to all levels" },
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "PROFESSIONAL", label: "Professional" },
  { value: "EXPERT", label: "Expert / Top tier" },
];

export function GigFormStep2({
  data,
  errors,
  onChange,
  onNext,
  onBack,
}: StepProps) {
  const [genreInput, setGenreInput] = useState("");
  const [langInput, setLangInput] = useState("");

  const gigType = data.gigType as GigType | "";
  const show = (field: GigFieldKey) =>
    !gigType || isFieldVisible(gigType as GigType, field);

  function addChip(
    field: "requiredGenres" | "languagesSpoken",
    input: string,
    setInput: (v: string) => void,
  ) {
    const val = input.trim();
    if (val && !(data[field] as string[]).includes(val)) {
      onChange(field, [...(data[field] as string[]), val]);
    }
    setInput("");
  }

  function removeChip(
    field: "requiredGenres" | "languagesSpoken",
    val: string,
  ) {
    onChange(
      field,
      (data[field] as string[]).filter((x) => x !== val),
    );
  }

  const inputCls =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-white/25 focus:outline-none";
  const selectCls =
    "w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white focus:border-white/25 focus:outline-none";

  const visibleFields: GigFieldKey[] = [
    "genres",
    "experienceLevel",
    "setDuration",
    "guestCount",
    "dressCode",
    "mcRequired",
    "micRequired",
    "languages",
  ];
  const hasAnyField = !gigType || visibleFields.some((f) => show(f));

  return (
    <div className="flex flex-col gap-6">
      {!hasAnyField && (
        <div className="rounded-xl border border-white/8 bg-white/3 px-5 py-8 text-center">
          <p className="text-sm text-gray-500">
            No additional requirements for this gig type.
          </p>
        </div>
      )}

      {/* Genres */}
      {show("genres") && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white">
            Required Genres{" "}
            <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addChip("requiredGenres", genreInput, setGenreInput);
                }
              }}
              placeholder="e.g. House, Techno…"
              className={`${inputCls} flex-1`}
            />
            <button
              type="button"
              onClick={() => addChip("requiredGenres", genreInput, setGenreInput)}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-400 hover:text-white"
            >
              Add
            </button>
          </div>
          {data.requiredGenres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {data.requiredGenres.map((g) => (
                <span
                  key={g}
                  className="flex items-center gap-1 rounded-full bg-white/10 py-0.5 pl-2.5 pr-1.5 text-xs text-white"
                >
                  {g}
                  <button
                    type="button"
                    onClick={() => removeChip("requiredGenres", g)}
                    className="hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Experience Level */}
      {show("experienceLevel") && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white">
            Experience Level
          </label>
          <select
            value={data.requiredExperienceLevel}
            onChange={(e) =>
              onChange("requiredExperienceLevel", e.target.value)
            }
            className={selectCls}
          >
            {EXPERIENCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Set Duration */}
      {show("setDuration") && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white">
            Set Duration{" "}
            <span className="font-normal text-gray-500">(minutes)</span>
          </label>
          <input
            type="number"
            min={15}
            max={720}
            value={data.setDurationMinutes}
            onChange={(e) => onChange("setDurationMinutes", e.target.value)}
            placeholder="e.g. 90"
            className={inputCls}
          />
          {errors.setDurationMinutes && (
            <p className="mt-1 text-xs text-red-400">
              {errors.setDurationMinutes}
            </p>
          )}
        </div>
      )}

      {/* Guest Count */}
      {show("guestCount") && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white">
            Expected Guest Count
          </label>
          <input
            type="number"
            min={1}
            value={data.guestCount}
            onChange={(e) => onChange("guestCount", e.target.value)}
            placeholder="e.g. 150"
            className={inputCls}
          />
        </div>
      )}

      {/* Dress Code */}
      {show("dressCode") && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white">
            Dress Code
          </label>
          <input
            type="text"
            value={data.dressCode}
            onChange={(e) => onChange("dressCode", e.target.value)}
            placeholder="e.g. Smart casual"
            className={inputCls}
          />
        </div>
      )}

      {/* MC + Mic checkboxes */}
      {(show("mcRequired") || show("micRequired")) && (
        <div className="flex flex-col gap-3">
          {show("mcRequired") && (
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={data.mcRequired}
                onChange={(e) => onChange("mcRequired", e.target.checked)}
                className="h-4 w-4 rounded border-white/20 accent-white"
              />
              <span className="text-sm text-white">MC required</span>
            </label>
          )}
          {show("micRequired") && (
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={data.micRequired}
                onChange={(e) => onChange("micRequired", e.target.checked)}
                className="h-4 w-4 rounded border-white/20 accent-white"
              />
              <span className="text-sm text-white">Microphone required</span>
            </label>
          )}
        </div>
      )}

      {/* Languages Spoken */}
      {show("languages") && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white">
            Languages Spoken{" "}
            <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addChip("languagesSpoken", langInput, setLangInput);
                }
              }}
              placeholder="e.g. English, Swedish…"
              className={`${inputCls} flex-1`}
            />
            <button
              type="button"
              onClick={() => addChip("languagesSpoken", langInput, setLangInput)}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-400 hover:text-white"
            >
              Add
            </button>
          </div>
          {data.languagesSpoken.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {data.languagesSpoken.map((l) => (
                <span
                  key={l}
                  className="flex items-center gap-1 rounded-full bg-white/10 py-0.5 pl-2.5 pr-1.5 text-xs text-white"
                >
                  {l}
                  <button
                    type="button"
                    onClick={() => removeChip("languagesSpoken", l)}
                    className="hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-gray-400 transition-colors hover:text-white"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white/90"
        >
          Next: Budget &amp; Equipment →
        </button>
      </div>
    </div>
  );
}
