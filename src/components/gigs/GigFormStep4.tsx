"use client";

import { GIG_TYPE_FIELDS } from "@/config/gig-type-fields";
import type { StepProps, GigFormData } from "./GigForm";
import type { GigType } from "@prisma/client";
import { formatDateWithWeekday } from "@/lib/utils/date";

type Step4Props = StepProps & { onSubmit: () => void };

// ─── Review summary shown at the bottom before submitting ────────────────────

function ReviewRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3 border-b border-white/5 py-1.5 text-sm last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className="max-w-xs truncate text-right text-white">{value}</span>
    </div>
  );
}

function ReviewSummary({ data }: { data: GigFormData }) {
  const gigType = data.gigType as GigType | "";
  const typeLabel = gigType ? GIG_TYPE_FIELDS[gigType]?.label : "";

  const budgetStr =
    data.budgetType === "TBA"
      ? "Budget TBA"
      : data.budgetType === "NEGOTIABLE"
        ? "Negotiable"
        : data.budgetType === "FIXED" && data.budgetMin
          ? `${data.currency} ${data.budgetMin}`
          : data.budgetMin && data.budgetMax
            ? `${data.currency} ${data.budgetMin} – ${data.budgetMax}`
            : "Budget TBA";

  const eventDateStr = data.eventDate
    ? formatDateWithWeekday(data.eventDate)
    : "";

  return (
    <div className="rounded-xl border border-white/10 bg-white/3 p-5">
      <h3 className="mb-3 text-sm font-semibold text-white">Review</h3>
      <ReviewRow label="Title" value={data.title} />
      <ReviewRow label="Gig Type" value={typeLabel} />
      <ReviewRow label="Event Date" value={eventDateStr} />
      <ReviewRow label="Budget" value={budgetStr} />
      {data.requiredGenres.length > 0 && (
        <ReviewRow label="Genres" value={data.requiredGenres.join(", ")} />
      )}
      {data.venueProvides.length > 0 && (
        <ReviewRow
          label="Venue provides"
          value={`${data.venueProvides.length} item${data.venueProvides.length !== 1 ? "s" : ""}`}
        />
      )}
      {data.djMustBring.length > 0 && (
        <ReviewRow
          label="DJ must bring"
          value={`${data.djMustBring.length} item${data.djMustBring.length !== 1 ? "s" : ""}`}
        />
      )}
    </div>
  );
}

// ─── Main step component ─────────────────────────────────────────────────────

export function GigFormStep4({
  data,
  errors,
  onChange,
  onBack,
  onSubmit,
  isPending,
}: Step4Props) {
  const inputCls =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-400 focus:border-white/25 focus:outline-none";

  return (
    <div className="flex flex-col gap-6">
      {/* Application Deadline */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white">
          Application Deadline{" "}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          type="date"
          value={data.applicationDeadline}
          onChange={(e) => onChange("applicationDeadline", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white scheme-dark focus:border-white/25 focus:outline-none"
        />
      </div>

      {/* Venue Name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white">
          Venue Name{" "}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={data.venueName}
          onChange={(e) => onChange("venueName", e.target.value)}
          placeholder="e.g. Fabric London"
          className={inputCls}
        />
        {data.venueName && (
          <label className="mt-2 flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={data.hideVenueName}
              onChange={(e) => onChange("hideVenueName", e.target.checked)}
              className="h-4 w-4 rounded border-white/20 accent-white"
            />
            <span className="text-sm text-gray-400">
              Hide venue name from public listing (only city/country visible
              until application is accepted)
            </span>
          </label>
        )}
      </div>

      {/* Venue Address */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white">
          Venue Address{" "}
          <span className="font-normal text-gray-400">
            (revealed to accepted DJ only)
          </span>
        </label>
        <textarea
          value={data.venueAddress}
          onChange={(e) => onChange("venueAddress", e.target.value)}
          rows={2}
          placeholder="Street address…"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-400 focus:border-white/25 focus:outline-none"
        />
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white">
            Contact Name
          </label>
          <input
            type="text"
            value={data.organizerContactName}
            onChange={(e) => onChange("organizerContactName", e.target.value)}
            placeholder="Your name"
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white">
            Contact Phone
          </label>
          <input
            type="tel"
            value={data.organizerContactPhone}
            onChange={(e) => onChange("organizerContactPhone", e.target.value)}
            placeholder="+46 70 000 0000"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-white">
          Contact Email
        </label>
        <input
          type="email"
          value={data.organizerContactEmail}
          onChange={(e) => onChange("organizerContactEmail", e.target.value)}
          placeholder="booking@example.com"
          className={inputCls}
        />
        {errors.organizerContactEmail && (
          <p className="mt-1 text-xs text-red-400">
            {errors.organizerContactEmail}
          </p>
        )}
      </div>

      {/* Arrival Instructions */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white">
          Arrival Instructions
        </label>
        <textarea
          value={data.arrivalInstructions}
          onChange={(e) => onChange("arrivalInstructions", e.target.value)}
          rows={3}
          placeholder="Where to park, which entrance to use, who to ask for…"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-400 focus:border-white/25 focus:outline-none"
        />
      </div>

      {/* Setup Notes */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white">
          Setup Notes
        </label>
        <textarea
          value={data.setupNotes}
          onChange={(e) => onChange("setupNotes", e.target.value)}
          rows={2}
          placeholder="Load-in time, sound check slot, stage access…"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-400 focus:border-white/25 focus:outline-none"
        />
      </div>

      {/* Review summary */}
      <ReviewSummary data={data} />

      {/* Nav + Submit */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          disabled={isPending}
          onClick={onBack}
          className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-gray-400 transition-colors hover:text-white disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={onSubmit}
          className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save as Draft"}
        </button>
      </div>

      <p className="text-center text-xs text-gray-400">
        Gig is saved as a draft. Publish it from the gig detail page when ready.
      </p>
    </div>
  );
}
