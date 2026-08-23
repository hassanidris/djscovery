"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { createGig, updateGig } from "@/lib/actions/gigs";
import type { GigType, BudgetType, ExperienceLevel } from "@prisma/client";

// Lazy-load each wizard step so only the active step's JS ships to the client.
const GigFormStep1 = dynamic(
  () => import("./GigFormStep1").then((m) => m.GigFormStep1),
  { loading: () => null },
);
const GigFormStep2 = dynamic(
  () => import("./GigFormStep2").then((m) => m.GigFormStep2),
  { loading: () => null },
);
const GigFormStep3 = dynamic(
  () => import("./GigFormStep3").then((m) => m.GigFormStep3),
  { loading: () => null },
);
const GigFormStep4 = dynamic(
  () => import("./GigFormStep4").then((m) => m.GigFormStep4),
  { loading: () => null },
);

// ============================================================
// SHARED TYPES
// Exported and used by all step sub-components.
// ============================================================

export type CountryOption = { id: number; name: string };
export type CityOption = { id: number; name: string };

export type GigFormData = {
  title: string;
  gigType: GigType | "";
  eventDate: string;
  description: string;
  countryId: string;
  cityId: string;
  requiredGenres: string[];
  requiredExperienceLevel: ExperienceLevel;
  setDurationMinutes: string;
  setStartTime: string;
  setEndTime: string;
  guestCount: string;
  dressCode: string;
  mcRequired: boolean;
  micRequired: boolean;
  languagesSpoken: string[];
  venueProvides: string[];
  djMustBring: string[];
  budgetType: BudgetType;
  budgetMin: string;
  budgetMax: string;
  currency: string;
  venueName: string;
  venueAddress: string;
  venuePostalCode: string;
  hideVenueName: boolean;
  organizerContactName: string;
  organizerContactPhone: string;
  organizerContactEmail: string;
  arrivalInstructions: string;
  setupNotes: string;
  applicationDeadline: string;
};

export type StepProps = {
  data: GigFormData;
  errors: Partial<Record<keyof GigFormData, string>>;
  onChange: (field: keyof GigFormData, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
  isPending: boolean;
  countries: CountryOption[];
};

// ============================================================
// DEFAULTS
// ============================================================

export const GIG_FORM_DEFAULT: GigFormData = {
  title: "",
  gigType: "",
  eventDate: "",
  description: "",
  countryId: "",
  cityId: "",
  requiredGenres: [],
  requiredExperienceLevel: "OPEN",
  setDurationMinutes: "",
  setStartTime: "",
  setEndTime: "",
  guestCount: "",
  dressCode: "",
  mcRequired: false,
  micRequired: false,
  languagesSpoken: [],
  venueProvides: [],
  djMustBring: [],
  budgetType: "TBA",
  budgetMin: "",
  budgetMax: "",
  currency: "SEK",
  venueName: "",
  venueAddress: "",
  venuePostalCode: "",
  hideVenueName: false,
  organizerContactName: "",
  organizerContactPhone: "",
  organizerContactEmail: "",
  arrivalInstructions: "",
  setupNotes: "",
  applicationDeadline: "",
};

// ============================================================
// INPUT PREPARATION
// Converts GigFormData (string-heavy) to the createGig/updateGig input.
// Empty strings become undefined; numbers are parsed.
// ============================================================

function prepareInput(data: GigFormData) {
  const opt = <T,>(val: string, fn: (v: string) => T): T | undefined =>
    val.trim() ? fn(val.trim()) : undefined;

  return {
    title: data.title,
    gigType: data.gigType as GigType,
    description: opt(data.description, (v) => v),
    eventDate: data.eventDate,
    applicationDeadline: opt(data.applicationDeadline, (v) => v),
    countryId: opt(data.countryId, parseInt),
    cityId: opt(data.cityId, parseInt),
    requiredGenres: data.requiredGenres,
    requiredExperienceLevel: data.requiredExperienceLevel,
    setDurationMinutes: opt(data.setDurationMinutes, parseInt),
    guestCount: opt(data.guestCount, parseInt),
    dressCode: opt(data.dressCode, (v) => v),
    mcRequired: data.mcRequired,
    micRequired: data.micRequired,
    languagesSpoken: data.languagesSpoken,
    venueProvides: data.venueProvides,
    djMustBring: data.djMustBring,
    budgetType: data.budgetType,
    budgetMin: opt(data.budgetMin, parseFloat),
    budgetMax: opt(data.budgetMax, parseFloat),
    currency: data.currency.trim() || "SEK",
    venueName: opt(data.venueName, (v) => v),
    venueAddress: opt(data.venueAddress, (v) => v),
    venuePostalCode: opt(data.venuePostalCode, (v) => v),
    hideVenueName: data.hideVenueName,
    organizerContactName: opt(data.organizerContactName, (v) => v),
    organizerContactPhone: opt(data.organizerContactPhone, (v) => v),
    organizerContactEmail: opt(data.organizerContactEmail, (v) => v),
    arrivalInstructions: opt(data.arrivalInstructions, (v) => v),
    setupNotes: opt(data.setupNotes, (v) => v),
  };
}

// ============================================================
// STEP INDICATOR
// ============================================================

const STEP_LABELS = [
  "Event Details",
  "Requirements",
  "Budget & Equipment",
  "Logistics & Review",
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-8 flex items-center">
      {STEP_LABELS.map((label, i) => {
        const s = i + 1;
        const done = s < current;
        const active = s === current;
        return (
          <div key={s} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                  done
                    ? "border-white/40 bg-white/15 text-white"
                    : active
                      ? "border-white bg-white text-black"
                      : "border-white/15 text-gray-400"
                }`}
              >
                {done ? "✓" : s}
              </div>
              <span
                className={`hidden text-xs sm:block ${active ? "text-white" : "text-gray-400"}`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`mb-5 h-px flex-1 transition-colors ${done ? "bg-white/30" : "bg-white/8"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// VALIDATION
// Per-step field checks before advancing.
// ============================================================

function validate(step: number, data: GigFormData): Record<string, string> {
  const errs: Record<string, string> = {};
  if (step === 1) {
    if (!data.title.trim()) errs.title = "Title is required";
    if (!data.gigType) errs.gigType = "Please select a gig type";
    if (!data.eventDate) errs.eventDate = "Event date is required";
    else if (new Date(data.eventDate) <= new Date())
      errs.eventDate = "Event date must be in the future";
  }
  if (step === 3) {
    if (data.budgetType === "FIXED" && !data.budgetMin.trim())
      errs.budgetMin = "Enter the budget amount";
    if (data.budgetType === "RANGE") {
      if (!data.budgetMin.trim()) errs.budgetMin = "Enter the minimum";
      if (!data.budgetMax.trim()) errs.budgetMax = "Enter the maximum";
    }
  }
  return errs;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

type OrgDefaults = { countryId: string; cityId: string; currency: string };

type GigFormProps =
  | {
      mode: "create";
      countries: CountryOption[];
      orgDefaults?: OrgDefaults;
    }
  | {
      mode: "edit";
      gigId: number;
      initialData: GigFormData;
      countries: CountryOption[];
    };

export function GigForm(props: GigFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [data, setData] = useState<GigFormData>(
    props.mode === "edit"
      ? props.initialData
      : props.orgDefaults
        ? { ...GIG_FORM_DEFAULT, ...props.orgDefaults }
        : GIG_FORM_DEFAULT,
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof GigFormData, string>>
  >({});

  function onChange(field: keyof GigFormData, value: unknown) {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleNext() {
    const errs = validate(step, data);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep((s) => (s < 4 ? ((s + 1) as 2 | 3 | 4) : s));
  }

  function handleBack() {
    setErrors({});
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));
  }

  function handleSubmit() {
    const errs = { ...validate(1, data), ...validate(3, data) };
    if (Object.keys(errs).length) {
      toast.error("Please fix the errors before submitting.");
      setErrors(errs);
      const hasStep3Errors = "budgetMin" in errs || "budgetMax" in errs;
      setStep(hasStep3Errors ? 3 : 1);
      return;
    }

    startTransition(async () => {
      const input = prepareInput(data);

      const result =
        props.mode === "edit"
          ? await updateGig(props.gigId, input)
          : await createGig(input);

      if (!result.success) {
        toast.error(result.error ?? "Something went wrong.");
        return;
      }

      const gigId =
        props.mode === "edit"
          ? props.gigId
          : (result as unknown as { success: true; data: { gigId: number } })
              .data.gigId;

      toast.success(
        props.mode === "create" ? "Gig saved as draft!" : "Gig updated!",
      );
      router.push(`/organizer/gigs/${gigId}`);
    });
  }

  const stepProps: StepProps = {
    data,
    errors,
    onChange,
    onNext: handleNext,
    onBack: handleBack,
    isPending,
    countries: props.countries,
  };

  return (
    <div>
      <StepIndicator current={step} />
      {step === 1 && <GigFormStep1 {...stepProps} />}
      {step === 2 && <GigFormStep2 {...stepProps} />}
      {step === 3 && <GigFormStep3 {...stepProps} />}
      {step === 4 && <GigFormStep4 {...stepProps} onSubmit={handleSubmit} />}
    </div>
  );
}
