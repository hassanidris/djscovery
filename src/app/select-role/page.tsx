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
    <div className="flex min-h-[calc(100vh-96px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-10 space-y-2 text-center">
          <h1 className="text-3xl font-bold text-white">
            What are you here for?
          </h1>
          <p className="text-sm text-gray-400">
            Choose your role to unlock the right features. You can always update
            this later.
          </p>
        </div>

        {/* Role cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* DJ card */}
          <form action={assignRole.bind(null, "DJ")}>
            <button
              type="submit"
              className="group hover:bg-h_red/10 hover:border-h_red/60 flex w-full flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-6 text-left transition-all"
            >
              <span className="text-4xl">🎛️</span>
              <div>
                <p className="text-lg font-bold text-white">I&apos;m a DJ</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-400">
                  Create a public profile, showcase your mixes, and get
                  discovered by event organizers.
                </p>
              </div>
              <span className="text-h_redLight mt-auto text-sm font-semibold group-hover:underline">
                Set up DJ profile →
              </span>
            </button>
          </form>

          {/* Organizer card */}
          <form action={assignRole.bind(null, "ORGANIZER")}>
            <button
              type="submit"
              className="group hover:bg-h_red/10 hover:border-h_red/60 flex w-full flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-6 text-left transition-all"
            >
              <span className="text-4xl">🎪</span>
              <div>
                <p className="text-lg font-bold text-white">
                  I&apos;m an Organizer
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-400">
                  Post gigs, hire DJs for your events, and manage bookings all
                  in one place.
                </p>
              </div>
              <span className="text-h_redLight mt-auto text-sm font-semibold group-hover:underline">
                Set up organizer profile →
              </span>
            </button>
          </form>
        </div>

        {/* Skip */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-400 transition-colors hover:text-gray-300"
          >
            Skip for now — I&apos;ll just browse as a fan
          </Link>
        </div>
      </div>
    </div>
  );
}
