import { assignRole } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function SelectRolePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-3xl font-bold text-white">
            What are you here for?
          </h1>
          <p className="text-gray-400 text-sm">
            Choose your role to unlock the right features. You can always
            update this later.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* DJ card */}
          <form action={assignRole.bind(null, "DJ")}>
            <button
              type="submit"
              className="w-full group bg-white/5 hover:bg-h_red/10 border border-white/10 hover:border-h_red/60 rounded-xl p-6 flex flex-col gap-3 text-left transition-all"
            >
              <span className="text-4xl">🎛️</span>
              <div>
                <p className="text-white font-bold text-lg">I&apos;m a DJ</p>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                  Create a public profile, showcase your mixes, and get
                  discovered by event organizers.
                </p>
              </div>
              <span className="text-h_red text-sm font-semibold group-hover:underline mt-auto">
                Set up DJ profile →
              </span>
            </button>
          </form>

          {/* Organizer card */}
          <form action={assignRole.bind(null, "ORGANIZER")}>
            <button
              type="submit"
              className="w-full group bg-white/5 hover:bg-h_red/10 border border-white/10 hover:border-h_red/60 rounded-xl p-6 flex flex-col gap-3 text-left transition-all"
            >
              <span className="text-4xl">🎪</span>
              <div>
                <p className="text-white font-bold text-lg">
                  I&apos;m an Organizer
                </p>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                  Post gigs, hire DJs for your events, and manage bookings all
                  in one place.
                </p>
              </div>
              <span className="text-h_red text-sm font-semibold group-hover:underline mt-auto">
                Set up organizer profile →
              </span>
            </button>
          </form>
        </div>

        {/* Skip */}
        <div className="text-center">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Skip for now — I&apos;ll just browse as a fan
          </Link>
        </div>
      </div>
    </div>
  );
}
