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

function EquipmentSection({
  title,
  field,
  selected,
  onChange,
}: {
  title: string;
  field: "venueProvides" | "djMustBring";
  selected: string[];
  onChange: (field: "venueProvides" | "djMustBring", value: string[]) => void;
}) {
  function toggle(item: string) {
    onChange(
      field,
      selected.includes(item)
        ? selected.filter((x) => x !== item)
        : [...selected, item],
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-white">{title}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {EQUIPMENT_ITEMS.map((item) => {
          const checked = selected.includes(item);
          return (
            <label
              key={item}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-xs transition-colors ${
                checked
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/8 bg-white/3 text-gray-400 hover:border-white/15 hover:text-gray-300"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(item)}
                className="sr-only"
              />
              <span
                className={`h-3.5 w-3.5 shrink-0 rounded border transition-colors ${
                  checked ? "border-white bg-white" : "border-white/30"
                }`}
              />
              {item}
            </label>
          );
        })}
      </div>
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
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Equipment
        </h3>
        <div className="flex flex-col gap-6">
          <EquipmentSection
            title="Venue provides"
            field="venueProvides"
            selected={data.venueProvides}
            onChange={(f, v) => onChange(f, v)}
          />
          <EquipmentSection
            title="DJ must bring"
            field="djMustBring"
            selected={data.djMustBring}
            onChange={(f, v) => onChange(f, v)}
          />
        </div>
      </section>

      {/* Budget section */}
      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
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
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm uppercase text-white placeholder:text-gray-600 focus:border-white/25 focus:outline-none"
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
