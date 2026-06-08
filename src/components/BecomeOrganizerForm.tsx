"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrganizerProfile } from "@/lib/actions/profile";

const initialState = { success: false, error: null as string | null };

export default function BecomeOrganizerForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createOrganizerProfile,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      toast.success(
        "Organizer profile created! Let\u2019s post your first gig. \ud83c\udf89",
      );
      router.push("/");
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="bg-white/5 border border-white/10 rounded-xl p-8 flex flex-col gap-5"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-gray-300 font-medium">
          Business / Event Name <span className="text-h_red">*</span>
        </label>
        <input
          type="text"
          name="businessName"
          placeholder="e.g. Nolimits Events"
          required
          minLength={2}
          maxLength={80}
          className="bg-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none ring-1 ring-white/20 focus:ring-h_red transition-all"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-gray-300 font-medium">
          Phone <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <input
          type="tel"
          name="phone"
          placeholder="+1 555 000 0000"
          maxLength={30}
          className="bg-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none ring-1 ring-white/20 focus:ring-h_red transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-h_red hover:bg-h_redDark disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
      >
        {isPending ? "Creating profile..." : "Create Organizer Profile"}
      </button>
    </form>
  );
}
