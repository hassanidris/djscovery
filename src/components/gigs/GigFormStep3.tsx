"use client";

import { EQUIPMENT_ITEMS } from "@/config/gig-type-fields";
import type { StepProps } from "./GigForm";
import type { BudgetType } from "@prisma/client";

const BUDGET_OPTIONS: { value: BudgetType; label: string; hint: string }[] = [
  { value: "TBA", label: "TBA", hint: "Not decided yet" },
  { value: "NEGOTIABLE", label: "Negotiable", hint: "Open to discussion" },
  { value: "FIXED", label: "Fixed rate", hint: "Single set price" },
  { value: "RANGE", label: "Range", hint: "Min and max amount" },
];

function EquipmentAssignmentList({
  venueProvides,
  djMustBring,
  onChange,
}: {
  venueProvides: string[];
  djMustBring: string[];
  onChange: (field: "venueProvides" | "djMustBring", value: string[]) => void;
}) {
  function toggle(field: "venueProvides" | "djMustBring", item: string) {
    const current = field === "venueProvides" ? venueProvides : djMustBring;
    const opposite =
      field === "venueProvides" ? "djMustBring" : "venueProvides";
    const oppositeList =
      field === "venueProvides" ? djMustBring : venueProvides;

    if (current.includes(item)) {
      onChange(
        field,
        current.filter((x) => x !== item),
      );
    } else {
      onChange(field, [...current, item]);
      if (oppositeList.includes(item)) {
        onChange(
          opposite,
          oppositeList.filter((x) => x !== item),
        );
      }
    }
  }

  const allItems = [...EQUIPMENT_ITEMS];

  return (
    <div>
      {/* Quick actions */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500">Quick assign:</span>
        <button
          type="button"
          onClick={() => {
            onChange("venueProvides", allItems);
            onChange("djMustBring", []);
          }}
          className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-400 transition-colors hover:border-white/20 hover:text-white"
        >
          All → Venue
        </button>
        <button
          type="button"
          onClick={() => {
            onChange("venueProvides", []);
            onChange("djMustBring", allItems);
          }}
          className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-400 transition-colors hover:border-white/20 hover:text-white"
        >
          All → DJ
        </button>
        <button
          type="button"
          onClick={() => {
            onChange("venueProvides", []);
            onChange("djMustBring", []);
          }}
          className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-400 transition-colors hover:border-red-400/40 hover:text-red-400"
        >
          Clear all
        </button>
      </div>

      {/* Column headers */}
      <div className="mb-1 grid grid-cols-[1fr_60px_60px] items-center gap-2 px-3 text-xs font-medium text-gray-500">
        <span>Item</span>
        <span className="text-center">Venue</span>
        <span className="text-center">DJ</span>
      </div>

      {/* Item rows */}
      <div className="overflow-hidden rounded-lg border border-white/8">
        {EQUIPMENT_ITEMS.map((item, i) => {
          const inVenue = venueProvides.includes(item);
          const inDJ = djMustBring.includes(item);
          return (
            <div
              key={item}
              className={`grid grid-cols-[1fr_60px_60px] items-center gap-2 px-3 py-2.5 transition-colors ${
                i < EQUIPMENT_ITEMS.length - 1 ? "border-b border-white/5" : ""
              } ${inVenue || inDJ ? "bg-white/3" : ""}`}
            >
              <span
                className={`text-sm ${
                  inVenue || inDJ ? "text-white" : "text-gray-400"
                }`}
              >
                {item}
              </span>
              <button
                type="button"
                onClick={() => toggle("venueProvides", item)}
                className={`rounded-md py-1 text-xs font-medium transition-colors ${
                  inVenue
                    ? "bg-white text-black"
                    : "border border-white/10 text-gray-500 hover:border-white/25 hover:text-gray-300"
                }`}
              >
                Venue
              </button>
              <button
                type="button"
                onClick={() => toggle("djMustBring", item)}
                className={`rounded-md py-1 text-xs font-medium transition-colors ${
                  inDJ
                    ? "bg-white text-black"
                    : "border border-white/10 text-gray-500 hover:border-white/25 hover:text-gray-300"
                }`}
              >
                DJ
              </button>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {(venueProvides.length > 0 || djMustBring.length > 0) && (
        <p className="mt-2 text-xs text-gray-500">
          {venueProvides.length > 0 &&
            `Venue: ${venueProvides.length} item${venueProvides.length > 1 ? "s" : ""}`}
          {venueProvides.length > 0 && djMustBring.length > 0 && " · "}
          {djMustBring.length > 0 &&
            `DJ: ${djMustBring.length} item${djMustBring.length > 1 ? "s" : ""}`}
        </p>
      )}
    </div>
  );
}

export function GigFormStep3({
  data,
  errors,
  onChange,
  onNext,
  onBack,
}: StepProps) {
  const showAmounts =
    data.budgetType === "FIXED" || data.budgetType === "RANGE";

  const amountInputCls = (hasError: boolean) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none ${
      hasError
        ? "border-red-500/50 bg-red-500/5"
        : "border-white/10 bg-white/5 focus:border-white/25"
    }`;

  return (
    <div className="flex flex-col gap-8">
      {/* Equipment section */}
      <section>
        <h3 className="mb-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">
          Equipment
        </h3>
        <EquipmentAssignmentList
          venueProvides={data.venueProvides}
          djMustBring={data.djMustBring}
          onChange={(f, v) => onChange(f, v)}
        />
      </section>

      {/* Budget section */}
      <section>
        <h3 className="mb-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">
          Budget
        </h3>

        {/* Budget type selector */}
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BUDGET_OPTIONS.map((opt) => {
            const active = data.budgetType === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange("budgetType", opt.value)}
                className={`flex flex-col gap-0.5 rounded-lg border px-3 py-3 text-left transition-colors ${
                  active
                    ? "border-white/40 bg-white/10 text-white"
                    : "border-white/8 bg-white/3 text-gray-400 hover:border-white/15"
                }`}
              >
                <span className="text-sm font-medium">{opt.label}</span>
                <span className="text-xs text-gray-500">{opt.hint}</span>
              </button>
            );
          })}
        </div>

        {/* Amount inputs */}
        {showAmounts && (
          <div className="flex gap-3">
            {data.budgetType === "RANGE" ? (
              <>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-gray-500">
                    Minimum
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={data.budgetMin}
                    onChange={(e) => onChange("budgetMin", e.target.value)}
                    placeholder="0"
                    className={amountInputCls(!!errors.budgetMin)}
                  />
                  {errors.budgetMin && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.budgetMin}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-gray-500">
                    Maximum
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={data.budgetMax}
                    onChange={(e) => onChange("budgetMax", e.target.value)}
                    placeholder="0"
                    className={amountInputCls(!!errors.budgetMax)}
                  />
                  {errors.budgetMax && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.budgetMax}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-500">
                  Amount
                </label>
                <input
                  type="number"
                  min={0}
                  value={data.budgetMin}
                  onChange={(e) => onChange("budgetMin", e.target.value)}
                  placeholder="0"
                  className={amountInputCls(!!errors.budgetMin)}
                />
                {errors.budgetMin && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.budgetMin}
                  </p>
                )}
              </div>
            )}
            <div className="w-24 shrink-0">
              <label className="mb-1 block text-xs text-gray-500">
                Currency
              </label>
              <input
                type="text"
                value={data.currency}
                onChange={(e) =>
                  onChange("currency", e.target.value.toUpperCase())
                }
                maxLength={3}
                placeholder="SEK"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white uppercase placeholder:text-gray-600 focus:border-white/25 focus:outline-none"
              />
            </div>
          </div>
        )}
      </section>

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
          Next: Logistics &amp; Review →
        </button>
      </div>
    </div>
  );
}
