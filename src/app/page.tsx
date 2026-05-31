import { createClient } from "@/lib/supabase/server";
import Hero from "@/components/Hero";
import Hero1 from "@/components/Hero1";
import Link from "next/link";

const Homepage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col">
      {/* Video hero */}
      <Hero />

      {/* Stats bar */}
      <Hero1 />

      {/* CTA section */}
      <div className="flex flex-col items-center justify-center gap-8 py-16 px-4">
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
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-gray-400 text-lg">
              Join the world&apos;s first DJ community platform
            </p>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
