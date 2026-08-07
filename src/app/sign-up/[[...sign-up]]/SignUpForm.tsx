"use client";

import { signUp, signInWithGoogle } from "@/lib/actions/auth";
import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

function getPasswordStrength(password: string): {
  score: 0 | 1 | 2;
  label: string;
  color: string;
  width: string;
} {
  if (password.length === 0)
    return { score: 0, label: "", color: "", width: "w-0" };
  const longEnough = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const allRules = longEnough && hasUpper && hasLower && hasNumber;
  if (allRules) {
    return {
      score: 2,
      label: "Strong",
      color: "bg-green-500",
      width: "w-full",
    };
  }
  if (longEnough && (hasUpper || hasLower || hasNumber)) {
    return { score: 1, label: "Fair", color: "bg-amber-400", width: "w-2/3" };
  }
  return { score: 0, label: "Weak", color: "bg-red-500", width: "w-1/3" };
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const { label, color, width } = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div className="flex flex-col gap-1">
      <div className="h-1.5 w-full rounded-full bg-white/10">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${color} ${width}`}
        />
      </div>
      <p className={`text-xs ${color.replace("bg-", "text-")}`}>{label}</p>
    </div>
  );
}

function SignUpSubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-h_red hover:bg-h_redDark flex cursor-pointer items-center justify-center gap-2 rounded-lg py-3 font-semibold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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

type Role = "" | "dj" | "organizer";

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
    value: "organizer",
    label: "Organizer",
    icon: "🎪",
    description: "Post gigs, hire DJs & manage events",
  },
];

export default function SignUpForm({
  error,
  defaultRole,
}: {
  error?: string;
  defaultRole?: Role;
}) {
  const [selected, setSelected] = useState<Role>(defaultRole ?? "");
  const [password, setPassword] = useState("");

  return (
    <div className="flex w-full max-w-sm flex-col gap-5 rounded-xl border border-white/20 bg-white/5 p-8">
      <h1 className="text-center text-2xl font-bold text-white">
        Create Account
      </h1>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Role selector */}
      <div className="flex flex-col gap-2">
        <p className="text-center text-xs text-gray-400">
          I&apos;m joining as a…
        </p>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setSelected(r.value)}
              className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-all ${
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
          <p className="text-center text-xs text-gray-400">
            {ROLES.find((r) => r.value === selected)?.description}
          </p>
        )}
        {!selected && (
          <p className="text-center text-xs text-gray-400">
            Browse DJs, follow artists &amp; attend events
          </p>
        )}
      </div>

      {/* Google OAuth */}
      <form action={signInWithGoogle}>
        <input type="hidden" name="role" value={selected} />
        <button
          type="submit"
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-white py-3 font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-[0.98]"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-gray-400">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* Email signup */}
      <form action={signUp} className="flex flex-col gap-4">
        <input type="hidden" name="role" value={selected} />
        <input
          type="text"
          name="displayName"
          placeholder={
            selected === "dj"
              ? "Your name (e.g. DJ John)"
              : "Your name (e.g. John Doe)"
          }
          maxLength={50}
          className="focus:ring-h_red rounded-lg bg-white/10 px-4 py-3 text-white placeholder-gray-400 ring-1 ring-white/20 transition-all outline-none"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="focus:ring-h_red rounded-lg bg-white/10 px-4 py-3 text-white placeholder-gray-400 ring-1 ring-white/20 transition-all outline-none"
        />
        <div className="flex flex-col gap-2">
          <input
            type="password"
            name="password"
            placeholder="Password (min 12 chars)"
            minLength={12}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus:ring-h_red rounded-lg bg-white/10 px-4 py-3 text-white placeholder-gray-400 ring-1 ring-white/20 transition-all outline-none"
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <SignUpSubmitBtn
          label={
            selected === "dj"
              ? "Sign Up as DJ"
              : selected === "organizer"
                ? "Sign Up as Organizer"
                : "Sign Up as Fan"
          }
        />
      </form>

      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-h_redLight hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 6.294C4.672 4.169 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}
