"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrganizerProfile } from "@/lib/actions/profile";

const ORGANIZER_TYPES = [
  { value: "INDIVIDUAL", label: "Individual — solo organizer or promoter" },
  { value: "COMPANY", label: "Company — registered business or brand" },
  { value: "VENUE", label: "Venue — club, bar, or event space" },
  { value: "AGENCY", label: "Agency — talent or booking agency" },
  { value: "FESTIVAL", label: "Festival — multi-act or recurring festival" },
] as const;

const initialState = { success: false, error: null as string | null };

export default function BecomeOrganizerForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createOrganizerProfile,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Organizer profile created! 🎉");
      router.push("/organizer/dashboard");
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-5 rounded-xl border border-white/10 bg-white/5 p-8"
    >
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="displayName"
          className="text-sm font-medium text-gray-300"
        >
          Display Name <span className="text-h_red">*</span>
        </label>
        <input
          id="displayName"
          type="text"
          name="displayName"
          placeholder="e.g. Nolimits Events"
          required
          minLength={2}
          maxLength={80}
          className="focus:ring-h_red rounded-lg bg-white/10 px-4 py-3 text-white placeholder-gray-500 ring-1 ring-white/20 transition-all outline-none"
        />
        <p className="text-xs text-gray-500">
          This is the name DJs will see on your profile and gig postings.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="organizerType"
          className="text-sm font-medium text-gray-300"
        >
          Organizer Type <span className="text-h_red">*</span>
        </label>
        <select
          id="organizerType"
          name="organizerType"
          required
          defaultValue=""
          className="focus:ring-h_red appearance-none rounded-lg bg-white/10 px-4 py-3 text-white ring-1 ring-white/20 transition-all outline-none"
        >
          <option value="" disabled className="bg-gray-900">
            Select a type...
          </option>
          {ORGANIZER_TYPES.map((t) => (
            <option key={t.value} value={t.value} className="bg-gray-900">
              {t.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          Shown as a badge on your public profile. You can change it later.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-h_red hover:bg-h_redDark w-full rounded-lg py-3 font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating profile..." : "Create Organizer Profile"}
      </button>
    </form>
  );
}
