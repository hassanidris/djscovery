import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";

export default async function HomeCtaBanner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const hasUpgradeableRole = user
    ? !!(await prisma.userRole.findFirst({
        where: { userId: user.id, role: { in: ["DJ", "ORGANIZER"] } },
      }))
    : false;

  if (hasUpgradeableRole) return null;

  const djHref = user ? "/become-dj" : "/sign-up?role=dj";
  const organiserHref = user ? "/become-organizer" : "/sign-up?role=organiser";
  return (
    <section className="border-t border-white/5 px-4 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="from-h_redDark via-h_red/20 border-h_red/50 relative overflow-hidden rounded-2xl border bg-linear-to-br to-black px-8 py-12 shadow-[0_0_40px_-8px_rgba(211,1,1,0.25)] md:px-16">
          {/* Decorative blobs */}
          <div className="bg-h_red/20 pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full blur-3xl" />
          <div className="bg-h_redDark/30 pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full blur-3xl" />

          <div className="relative z-10 mb-10 flex flex-col items-center gap-4 text-center">
            <span className="text-xs font-semibold tracking-[0.15em] text-red-300 uppercase">
              Join the Community
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              Ready to make your mark?
            </h2>
            <p className="max-w-xl text-base text-gray-400">
              Whether you spin records or book talent — DJscovery has a place
              for you.
            </p>
          </div>

          <div className="relative z-10 mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            {/* DJ card */}
            <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/40 p-6">
              <div className="text-4xl">🎧</div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  I&apos;m a DJ
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-400">
                  Showcase your mixes, get discovered by organisers, and grow
                  your fanbase.
                </p>
              </div>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>✓ Free DJ profile & portfolio</li>
                <li>✓ Apply to open gigs directly</li>
                <li>✓ Connect with fans & other DJs</li>
              </ul>
              <Button
                asChild
                className="bg-h_red hover:bg-h_redDark mt-auto w-full font-semibold text-white"
              >
                <Link href={djHref}>Join as DJ</Link>
              </Button>
            </div>

            {/* Organiser card */}
            <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/40 p-6">
              <div className="text-4xl">🎪</div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  I&apos;m an Organiser
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-400">
                  Find and book the perfect DJ for your event from a global
                  directory.
                </p>
              </div>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>✓ Browse verified DJ profiles</li>
                <li>✓ Post open gigs for free</li>
                <li>✓ Manage bookings in one place</li>
              </ul>
              <Button
                asChild
                variant="outline"
                className="border-h_red hover:bg-h_red mt-auto w-full cursor-pointer font-semibold text-red-200 hover:text-white"
              >
                <Link href={organiserHref}>Join as Organiser</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
