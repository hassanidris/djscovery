import { signIn, signInWithGoogle } from "@/lib/actions/auth";
import Link from "next/link";
import { SignInSubmitBtn } from "./SignInSubmitBtn";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed:
    "Email confirmation failed. The link may have expired — please sign up again.",
  invalid_credentials: "Incorrect email or password.",
  email_not_confirmed: "Please confirm your email address before signing in.",
  session_expired: "Your session has expired. Please sign in again.",
  oauth_error: "Sign-in with Google failed. Please try again.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error: rawError, message } = await searchParams;
  const error = rawError
    ? (AUTH_ERROR_MESSAGES[rawError] ?? rawError.replace(/_/g, " "))
    : undefined;

  return (
    <div className="flex h-[calc(100vh-136px)] flex-col items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-white/20 bg-white/5 p-8">
        <h1 className="text-center text-2xl font-bold text-white">Sign In</h1>

        {message && (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-center text-sm text-green-400"
          >
            {message}
          </div>
        )}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400"
          >
            {error}
          </div>
        )}

        {/* Google OAuth */}
        <form action={signInWithGoogle}>
          <input type="hidden" name="role" value="" />
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

        {/* Email / Password */}
        <form action={signIn} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="focus:ring-h_red rounded-lg bg-white/10 px-4 py-3 text-white placeholder-gray-400 ring-1 ring-white/20 outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="focus:ring-h_red rounded-lg bg-white/10 px-4 py-3 text-white placeholder-gray-400 ring-1 ring-white/20 outline-none"
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-gray-400 underline transition-colors hover:text-white"
            >
              Forgot password?
            </Link>
          </div>
          <SignInSubmitBtn />
        </form>

        <p className="text-center text-sm text-gray-400">
          No account?{" "}
          <Link href="/sign-up" className="text-h_red/80 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
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
