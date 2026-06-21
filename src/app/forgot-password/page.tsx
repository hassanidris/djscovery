import { requestPasswordReset } from "@/lib/actions/auth";
import Link from "next/link";
import { ForgotPasswordSubmitBtn } from "./ForgotPasswordSubmitBtn";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex h-[calc(100vh-136px)] flex-col items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-white/20 bg-white/5 p-8">
        <h1 className="text-center text-2xl font-bold text-white">
          Forgot password?
        </h1>
        <p className="text-center text-sm text-gray-400">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {message && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-center text-sm text-green-400"
          >
            {message}
          </div>
        )}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400"
          >
            {error}
          </div>
        )}

        <form action={requestPasswordReset} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            autoFocus
            className="focus:ring-h_red rounded-lg bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none ring-1 ring-white/20 transition-all"
          />
          <ForgotPasswordSubmitBtn />
        </form>

        <p className="text-center text-sm text-gray-400">
          Remember it?{" "}
          <Link href="/sign-in" className="text-h_red hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
