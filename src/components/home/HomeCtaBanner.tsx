import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomeCtaBanner() {
  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 border-t border-white/5">
      <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-h_purpleDark via-[#3b1f6e] to-black border border-h_purple/50 shadow-[0_0_40px_-8px_rgba(197,132,245,0.25)] px-8 py-12 md:px-16">
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-h_purple/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-h_purpleDark/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center gap-4 mb-10">
          <span className="text-h_purple text-sm font-semibold tracking-widest uppercase">
            Join the Community
          </span>
          <h2 className="text-white text-4xl md:text-5xl leading-tight">
            Ready to make your mark?
          </h2>
          <p className="text-gray-400 max-w-xl text-base">
            Whether you spin records or book talent — DJscovery has a place for
            you.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* DJ card */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-6 flex flex-col gap-4">
            <div className="text-4xl">🎧</div>
            <div>
              <h3 className="text-white text-2xl">I&apos;m a DJ</h3>
              <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                Showcase your mixes, get discovered by organisers, and grow your
                fanbase.
              </p>
            </div>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>✓ Free DJ profile & portfolio</li>
              <li>✓ Apply to open gigs directly</li>
              <li>✓ Connect with fans & other DJs</li>
            </ul>
            <Button
              asChild
              className="mt-auto bg-h_purple hover:bg-h_purpleDark text-white font-semibold w-full"
            >
              <Link href="/sign-up?role=dj">Join as DJ</Link>
            </Button>
          </div>

          {/* Organiser card */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-6 flex flex-col gap-4">
            <div className="text-4xl">🎪</div>
            <div>
              <h3 className="text-white text-2xl">I&apos;m an Organiser</h3>
              <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                Find and book the perfect DJ for your event from a global
                directory.
              </p>
            </div>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>✓ Browse verified DJ profiles</li>
              <li>✓ Post open gigs for free</li>
              <li>✓ Manage bookings in one place</li>
            </ul>
            <Button
              asChild
              variant="outline"
              className="mt-auto border-h_purple text-h_purple hover:bg-h_purple hover:text-white font-semibold w-full"
            >
              <Link href="/sign-up?role=organiser">Join as Organiser</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
