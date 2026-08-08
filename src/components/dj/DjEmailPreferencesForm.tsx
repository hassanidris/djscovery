"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateDjEmailPreferences } from "@/lib/actions/account";
import { Loader2 } from "lucide-react";

type Pref = {
  label: string;
  description: string;
  name: string;
  defaultChecked: boolean;
};

const PREFS: Pref[] = [
  {
    label: "Booking inquiries",
    description: "New booking requests and messages from organizers.",
    name: "bookingEmails",
    defaultChecked: true,
  },
  {
    label: "Application updates",
    description: "When your gig application status changes.",
    name: "applicationEmails",
    defaultChecked: true,
  },
  {
    label: "Profile review updates",
    description: "When your DJ profile is approved or needs changes.",
    name: "profileReviewEmails",
    defaultChecked: true,
  },
  {
    label: "Platform updates",
    description: "New features, announcements and product news.",
    name: "platformUpdates",
    defaultChecked: true,
  },
];

const REQUIRED_PREFS = [
  {
    label: "Account & security",
    description:
      "Verification, password reset and security alerts. Cannot be disabled.",
  },
];

export default function DjEmailPreferencesForm({
  bookingEmails,
  applicationEmails,
  profileReviewEmails,
  platformUpdates,
}: {
  bookingEmails: boolean;
  applicationEmails: boolean;
  profileReviewEmails: boolean;
  platformUpdates: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const values: Record<string, boolean> = {
    bookingEmails,
    applicationEmails,
    profileReviewEmails,
    platformUpdates,
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateDjEmailPreferences(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Preferences saved successfully.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <input
        type="hidden"
        name="_fields"
        value={PREFS.map((p) => p.name).join(",")}
      />
      {/* Configurable preferences */}
      <div className="flex flex-col gap-1 overflow-hidden rounded-xl border border-white/10">
        {PREFS.map((pref, i) => (
          <div
            key={pref.name}
            className={`flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/5 ${
              i > 0 ? "border-t border-white/5" : ""
            }`}
          >
            <label htmlFor={pref.name} className="flex-1 cursor-pointer">
              <p className="text-sm font-medium text-white">{pref.label}</p>
              <p className="text-xs text-gray-400">{pref.description}</p>
            </label>
            <Toggle
              id={pref.name}
              name={pref.name}
              defaultChecked={values[pref.name] ?? pref.defaultChecked}
            />
          </div>
        ))}
      </div>

      {/* Required (always-on) preferences */}
      <div>
        <p className="mb-2 text-xs font-medium tracking-wider text-gray-400 uppercase">
          Always on
        </p>
        <div className="flex flex-col gap-1 overflow-hidden rounded-xl border border-white/10 opacity-60">
          {REQUIRED_PREFS.map((pref) => (
            <div
              key={pref.label}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div>
                <p className="text-sm font-medium text-white">{pref.label}</p>
                <p className="text-xs text-gray-400">{pref.description}</p>
              </div>
              <div className="h-5 w-9 shrink-0 rounded-full bg-green-500/80" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-h_red hover:bg-h_redDark flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save preferences"}
        </button>
      </div>
    </form>
  );
}

function Toggle({
  id,
  name,
  defaultChecked,
}: {
  id: string;
  name: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="relative inline-flex shrink-0 cursor-pointer items-center">
      <input
        type="checkbox"
        id={id}
        name={name}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <div className="peer peer-checked:bg-h_red h-5 w-9 rounded-full bg-white/20 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-white/70 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-black after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4" />
    </label>
  );
}
