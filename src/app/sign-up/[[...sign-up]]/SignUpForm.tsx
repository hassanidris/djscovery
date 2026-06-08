"use client";

import { signUp } from "@/lib/actions/auth";
import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

function SignUpSubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-h_red hover:bg-h_redDark active:scale-[0.98] text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating account...
        </>
      ) : (
        label
      )}
    </button>
  );
}

type Role = "" | "dj" | "organiser";

const ROLES: {
  value: Role;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    value: "",
    label: "Fan",
    icon: "🎧",
    description: "Browse DJs, follow artists & attend events",
  },
  {
    value: "dj",
    label: "DJ",
    icon: "🎛️",
    description: "Create a profile, get discovered & booked",
  },
  {
    value: "organiser",
    label: "Organizer",
    icon: "🎪",
    description: "Post gigs, hire DJs & manage events",
  },
];

export default function SignUpForm({ error }: { error?: string }) {
  const [selected, setSelected] = useState<Role>("");

  return (
    <form
      action={signUp}
      className="bg-white/5 border border-white/20 rounded-xl p-8 flex flex-col gap-5 w-full max-w-sm"
    >
      <h1 className="text-2xl font-bold text-white text-center">
        Create Account
      </h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Role selector */}
      <div className="flex flex-col gap-2">
        <p className="text-gray-400 text-xs text-center">
          I&apos;m joining as a…
        </p>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setSelected(r.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-center transition-all ${
                selected === r.value
                  ? "border-h_red bg-h_red/10 text-white"
                  : "border-white/10 bg-white/5 text-gray-400 hover:border-white/30"
              }`}
            >
              <span className="text-xl">{r.icon}</span>
              <span className="text-xs font-semibold">{r.label}</span>
            </button>
          ))}
        </div>
        {selected && (
          <p className="text-gray-500 text-xs text-center">
            {ROLES.find((r) => r.value === selected)?.description}
          </p>
        )}
        {!selected && (
          <p className="text-gray-500 text-xs text-center">
            Browse DJs, follow artists &amp; attend events
          </p>
        )}
      </div>

      <input type="hidden" name="role" value={selected} />

      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        className="bg-white/10 text-white placeholder-gray-400 rounded-lg px-4 py-3 outline-none ring-1 ring-white/20 focus:ring-h_red transition-all"
      />
      <input
        type="password"
        name="password"
        placeholder="Password (min 6 chars)"
        minLength={6}
        required
        className="bg-white/10 text-white placeholder-gray-400 rounded-lg px-4 py-3 outline-none ring-1 ring-white/20 focus:ring-h_red transition-all"
      />

      <SignUpSubmitBtn
        label={
          selected === "dj"
            ? "Sign Up as DJ"
            : selected === "organiser"
              ? "Sign Up as Organizer"
              : "Sign Up as Fan"
        }
      />

      <p className="text-gray-400 text-sm text-center">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-h_red hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
