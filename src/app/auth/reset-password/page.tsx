import { updatePassword } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResetPasswordSubmitBtn } from "./ResetPasswordSubmitBtn";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/forgot-password?error=" +
        encodeURIComponent("Your reset link has expired. Please request a new one."),
    );
  }

  const { error } = await searchParams;

  return (
    <div className="flex h-[calc(100vh-136px)] flex-col items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-white/20 bg-white/5 p-8">
        <h1 className="text-center text-2xl font-bold text-white">
          Set new password
        </h1>
        <p className="text-center text-sm text-gray-400">
          Choose a strong password for your account.
        </p>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400"
          >
            {error}
          </div>
        )}

        <form action={updatePassword} className="flex flex-col gap-4">
          <input
            type="password"
            name="password"
            placeholder="New password (min 8 chars)"
            minLength={8}
            required
            autoFocus
            className="focus:ring-h_red rounded-lg bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none ring-1 ring-white/20 transition-all"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            minLength={8}
            required
            className="focus:ring-h_red rounded-lg bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none ring-1 ring-white/20 transition-all"
          />
          <ResetPasswordSubmitBtn />
        </form>

        <p className="text-center text-sm text-gray-400">
          <Link
            href="/forgot-password"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Request a new link
          </Link>
        </p>
      </div>
    </div>
  );
}
