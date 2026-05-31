import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const Homepage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-8">
      <div className="text-center flex flex-col gap-4">
        <h1 className="text-4xl md:text-6xl font-bold text-h_white">
          Welcome to <span className="text-h_purple">DJscovery</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Discover and connect with talented DJs around the world.
        </p>
      </div>

      {user ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-300 text-sm">
            Signed in as <span className="text-h_purple">{user.email}</span>
          </p>
          <div className="flex gap-4">
            <Link
              href="/community"
              className="bg-h_purple hover:bg-h_purpleDark text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Community
            </Link>
            <Link
              href="/directory"
              className="ring-1 ring-h_purple text-h_purple hover:bg-h_purple hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Browse DJs
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link
            href="/sign-in"
            className="ring-1 ring-h_purple text-h_purple hover:bg-h_purple hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="bg-h_purple hover:bg-h_purpleDark text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      )}
    </div>
  );
};

export default Homepage;
