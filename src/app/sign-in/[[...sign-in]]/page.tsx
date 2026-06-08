import { signIn } from "@/lib/actions/auth";
import Link from "next/link";
import { SignInSubmitBtn } from "./SignInSubmitBtn";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="h-[calc(100vh-136px)] flex flex-col items-center justify-center">
      <form
        action={signIn}
        className="bg-white/5 border border-white/20 rounded-xl p-8 flex flex-col gap-4 w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-white text-center">Sign In</h1>

        {message && (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 text-green-400 text-sm text-center"
          >
            {message}
          </div>
        )}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm text-center"
          >
            {error}
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
          placeholder="Password"
          required
          className="bg-white/10 text-white placeholder-gray-400 rounded-lg px-4 py-3 outline-none ring-1 ring-white/20 focus:ring-h_red"
        />
        <SignInSubmitBtn />
        <p className="text-gray-400 text-sm text-center">
          No account?{" "}
          <Link href="/sign-up" className="text-h_red hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
