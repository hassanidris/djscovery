import { signIn } from "@/lib/actions/auth";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="h-[calc(100vh-136px)] flex flex-col items-center justify-center">
      <form
        action={signIn}
        className="bg-white/5 border border-white/20 rounded-xl p-8 flex flex-col gap-4 w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-white text-center">Sign In</h1>
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="bg-white/10 text-white placeholder-gray-400 rounded-lg px-4 py-3 outline-none ring-1 ring-white/20 focus:ring-h_purple"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="bg-white/10 text-white placeholder-gray-400 rounded-lg px-4 py-3 outline-none ring-1 ring-white/20 focus:ring-h_purple"
        />
        <button
          type="submit"
          className="bg-h_purple hover:bg-h_purpleDark text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Sign In
        </button>
        <p className="text-gray-400 text-sm text-center">
          No account?{" "}
          <a href="/sign-up" className="text-h_purple hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
