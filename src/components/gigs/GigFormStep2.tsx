"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Check } from "lucide-react";
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

const MAX_GENRES = 5;

export function GigFormStep2({
  data,
  errors,
  onChange,
  onNext,
  onBack,
  genres,
}: StepProps) {
  const [genreOpen, setGenreOpen] = useState(false);
  const [langInput, setLangInput] = useState("");
  const genreDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        genreDropdownRef.current &&
        !genreDropdownRef.current.contains(e.target as Node)
      ) {
        setGenreOpen(false);
      }
    }
    if (genreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [genreOpen]);

  function toggleGenre(name: string) {
    const current = data.requiredGenres;
    if (current.includes(name)) {
      onChange(
        "requiredGenres",
        current.filter((g) => g !== name),
      );
    } else if (current.length < MAX_GENRES) {
      onChange("requiredGenres", [...current, name]);
    }
  }

  const gigType = data.gigType as GigType | "";
  const show = (field: GigFieldKey) =>
    !gigType || isFieldVisible(gigType as GigType, field);

  function addLang(input: string, setInput: (v: string) => void) {
    const val = input.trim();
    if (val && !data.languagesSpoken.includes(val)) {
      onChange("languagesSpoken", [...data.languagesSpoken, val]);
    }
    setInput("");
  }

  function removeLang(val: string) {
    onChange(
      "languagesSpoken",
      data.languagesSpoken.filter((x) => x !== val),
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
            <span className="font-normal text-gray-500">
              (optional, up to {MAX_GENRES})
            </span>
          </label>
          <div ref={genreDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setGenreOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={genreOpen}
              aria-controls="required-genres-listbox"
              className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white transition-colors hover:border-white/25 focus:outline-none"
            >
              <span
                className={
                  data.requiredGenres.length === 0
                    ? "text-gray-600"
                    : "text-white"
                }
              >
                {data.requiredGenres.length === 0
                  ? "Select genres…"
                  : `${data.requiredGenres.length} genre${data.requiredGenres.length > 1 ? "s" : ""} selected`}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform ${genreOpen ? "rotate-180" : ""}`}
              />
            </button>

            {genreOpen && (
              <div
                id="required-genres-listbox"
                role="listbox"
                aria-multiselectable="true"
                className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-white/10 bg-zinc-950 py-1 shadow-xl"
              >
                {genres.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-gray-500">
                    No genres available
                  </p>
                ) : (
                  genres.map((genre) => {
                    const selected = data.requiredGenres.includes(genre.name);
                    const atMax =
                      !selected && data.requiredGenres.length >= MAX_GENRES;
                    return (
                      <button
                        key={genre.id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        disabled={atMax}
                        onClick={() => toggleGenre(genre.name)}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                          atMax
                            ? "cursor-not-allowed opacity-40"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            selected
                              ? "border-white bg-white"
                              : "border-white/30 bg-transparent"
                          }`}
                        >
                          {selected && (
                            <Check className="h-2.5 w-2.5 text-black" />
                          )}
                        </span>
                        <span
                          className={selected ? "text-white" : "text-gray-400"}
                        >
                          {genre.name}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {data.requiredGenres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {data.requiredGenres.map((g) => (
                <span
                  key={g}
                  className="flex items-center gap-1 rounded-full bg-white/10 py-0.5 pr-1.5 pl-2.5 text-xs text-white"
                >
                  {g}
                  <button
                    type="button"
                    onClick={() => toggleGenre(g)}
                    aria-label={`Remove genre ${g}`}
                    className="hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {data.requiredGenres.length >= MAX_GENRES && (
            <p className="mt-1.5 text-xs text-gray-500">
              Maximum of {MAX_GENRES} genres reached.
            </p>
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

      {/* Set Duration / Set Hours */}
      {show("setDuration") &&
        (() => {
          const gigTypeStr = data.gigType as GigType | "";
          const useTimeRange =
            !!gigTypeStr &&
            (["CLUB", "RESTAURANT", "BAR", "LOUNGE"] as GigType[]).includes(
              gigTypeStr as GigType,
            );

          if (useTimeRange) {
            const totalMin = parseInt(data.setDurationMinutes) || 0;
            const dHrs = Math.floor(totalMin / 60);
            const dMins = totalMin % 60;

            function calcDiff(start: string, end: string) {
              const [sh, sm] = start.split(":").map(Number);
              const [eh, em] = end.split(":").map(Number);
              const s = sh * 60 + sm;
              const e = eh * 60 + em;
              return e >= s ? e - s : 24 * 60 - s + e;
            }

            return (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white">
                  Set Hours{" "}
                  <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-1 text-xs text-gray-500">Start Time</p>
                    <input
                      type="time"
                      value={data.setStartTime}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChange("setStartTime", val);
                        if (val && data.setEndTime) {
                          const diff = calcDiff(val, data.setEndTime);
                          onChange(
                            "setDurationMinutes",
                            diff > 0 ? String(diff) : "",
                          );
                        }
                      }}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-gray-500">End Time</p>
                    <input
                      type="time"
                      value={data.setEndTime}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChange("setEndTime", val);
                        if (data.setStartTime && val) {
                          const diff = calcDiff(data.setStartTime, val);
                          onChange(
                            "setDurationMinutes",
                            diff > 0 ? String(diff) : "",
                          );
                        }
                      }}
                      className={inputCls}
                    />
                  </div>
                </div>
                {totalMin > 0 && (
                  <p className="mt-1.5 text-xs text-gray-500">
                    Duration: {dHrs > 0 ? `${dHrs}h ` : ""}
                    {dMins > 0 ? `${dMins}min` : ""}
                    {data.setEndTime < data.setStartTime &&
                    data.setStartTime &&
                    data.setEndTime
                      ? " (overnight)"
                      : ""}
                  </p>
                )}
                {errors.setDurationMinutes && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.setDurationMinutes}
                  </p>
                )}
              </div>
            );
          }

          const totalMin = parseInt(data.setDurationMinutes) || 0;
          const dHrs = Math.floor(totalMin / 60);
          const dMins = totalMin % 60;

          function onHrsChange(val: string) {
            const h = Math.max(0, Math.min(23, parseInt(val) || 0));
            const total = h * 60 + dMins;
            onChange("setDurationMinutes", total > 0 ? String(total) : "");
          }

          function onMinsChange(val: string) {
            const m = Math.max(0, Math.min(59, parseInt(val) || 0));
            const total = dHrs * 60 + m;
            onChange("setDurationMinutes", total > 0 ? String(total) : "");
          }

          return (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Set Duration{" "}
                <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="number"
                    aria-label="Set duration hours"
                    min={0}
                    max={23}
                    value={dHrs === 0 ? "" : dHrs}
                    onChange={(e) => onHrsChange(e.target.value)}
                    placeholder="0"
                    className={`${inputCls} text-center`}
                  />
                  <span className="text-sm text-gray-400">hrs</span>
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="number"
                    aria-label="Set duration minutes"
                    min={0}
                    max={59}
                    value={dMins === 0 ? "" : dMins}
                    onChange={(e) => onMinsChange(e.target.value)}
                    placeholder="0"
                    className={`${inputCls} text-center`}
                  />
                  <span className="text-sm text-gray-400">min</span>
                </div>
              </div>
              {totalMin > 0 && (
                <p className="mt-1.5 text-xs text-gray-500">
                  Total: {totalMin} minutes
                </p>
              )}
              {errors.setDurationMinutes && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.setDurationMinutes}
                </p>
              )}
            </div>
          );
        })()}

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
                  addLang(langInput, setLangInput);
                }
              }}
              placeholder="e.g. English, Swedish…"
              className={`${inputCls} flex-1`}
            />
            <button
              type="button"
              onClick={() => addLang(langInput, setLangInput)}
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
                  className="flex items-center gap-1 rounded-full bg-white/10 py-0.5 pr-1.5 pl-2.5 text-xs text-white"
                >
                  {l}
                  <button
                    type="button"
                    onClick={() => removeLang(l)}
                    aria-label={`Remove language ${l}`}
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
