import { signUp } from "@/lib/actions/auth";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const roleLabel =
    role === "dj" ? "DJ" : role === "organiser" ? "Organiser" : null;

  return (
    <div className="h-[calc(100vh-96px-40px)] flex items-center justify-center">
      <form
        action={signUp}
        className="bg-white/5 border border-white/20 rounded-xl p-8 flex flex-col gap-4 w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-white text-center">Sign Up</h1>
        {role && <input type="hidden" name="role" value={role} />}
        {roleLabel && (
          <div className="flex items-center justify-center gap-2 bg-h_red/20 border border-h_red/40 rounded-lg px-4 py-2">
            <span className="text-gray-400 text-sm">Signing up as:</span>
            <span className="text-h_red font-semibold text-sm">
              {roleLabel}
            </span>
          </div>
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="bg-white/10 text-white placeholder-gray-400 rounded-lg px-4 py-3 outline-none ring-1 ring-white/20 focus:ring-h_red"
        />
        <input
          type="password"
          name="password"
          placeholder="Password (min 6 chars)"
          minLength={6}
          required
          className="bg-white/10 text-white placeholder-gray-400 rounded-lg px-4 py-3 outline-none ring-1 ring-white/20 focus:ring-h_red"
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
