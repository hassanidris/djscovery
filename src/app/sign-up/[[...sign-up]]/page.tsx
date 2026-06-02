import { signUp } from "@/lib/actions/auth";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center px-4">
      <form
        action={signUp}
        className="bg-white/5 border border-white/20 rounded-xl p-8 flex flex-col gap-4 w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-white text-center">Sign Up</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

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
        <button
          type="submit"
          className="bg-h_red hover:bg-h_redDark text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Create Account
        </button>
        <p className="text-gray-400 text-sm text-center">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-h_red hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
