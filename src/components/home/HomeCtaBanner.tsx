import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { Headphones, PartyPopper } from "lucide-react";

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
  const organizerHref = user ? "/become-organizer" : "/sign-up?role=organizer";
  return (
    <section
      className="border-t border-white/5 px-4 py-16 md:px-8"
      style={{ padding: "var(--space-16) var(--space-4)" }}
    >
      <div className="mx-auto max-w-7xl">
        <div
          className="from-h_redDark via-h_red/10 border-h_red/30 relative overflow-hidden rounded-2xl border bg-linear-to-br to-black px-8 py-12 md:px-16"
          style={{
            padding: "var(--space-12) var(--space-8)",
            borderColor: "var(--brand-red-muted)",
          }}
        >
          {/* Simplified decorative elements */}
          <div
            className="bg-h_red/10 pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full blur-3xl"
            style={{ backgroundColor: "var(--brand-red-subtle)" }}
          />
          <div className="bg-h_redDark/20 pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full blur-3xl" />

          <div
            className="relative z-10 mb-10 flex flex-col items-center gap-4 text-center"
            style={{ marginBottom: "var(--space-10)", gap: "var(--space-4)" }}
          >
            <span
              className="text-xs font-semibold tracking-[0.15em] text-red-300 uppercase"
              style={{ letterSpacing: "0.15em" }}
            >
              Join the Community
            </span>
            <h2
              className="font-heading text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl"
              style={{ letterSpacing: "-0.025em" }}
            >
              Ready to make your mark?
            </h2>
            <p className="max-w-xl text-base text-gray-400">
              Whether you spin records or book talent — DJcovery has a place for
              you.
            </p>
          </div>

          <div
            className="relative z-10 mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2"
            style={{ gap: "var(--space-6)" }}
          >
            {/* DJ card */}
            <div
              className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/40 p-6"
              style={{ gap: "var(--space-4)", padding: "var(--space-6)" }}
            >
              <div
                className="text-h_redLight bg-h_red/10 flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: "var(--brand-red-subtle)" }}
              >
                <Headphones className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  I&apos;m a DJ
                </h3>
                <p
                  className="mt-1 text-sm leading-relaxed text-gray-400"
                  style={{ marginTop: "var(--space-1)" }}
                >
                  Showcase your mixes, get discovered by organizers, and grow
                  your fanbase.
                </p>
              </div>
              <ul
                className="space-y-1 text-xs text-gray-400"
                style={{ gap: "var(--space-1)" }}
              >
                <li>✓ Free DJ profile & portfolio</li>
                <li>✓ Apply to open gigs directly</li>
                <li>✓ Connect with fans & other DJs</li>
              </ul>
              <Button
                asChild
                className="bg-h_red hover:bg-h_redDark mt-auto w-full font-semibold text-white shadow-md"
              >
                <Link href={djHref}>Join as DJ</Link>
              </Button>
            </div>

            {/* Organizer card */}
            <div
              className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/40 p-6"
              style={{ gap: "var(--space-4)", padding: "var(--space-6)" }}
            >
              <div
                className="text-h_redLight bg-h_red/10 flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: "var(--brand-red-subtle)" }}
              >
                <PartyPopper className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  I&apos;m an Organizer
                </h3>
                <p
                  className="mt-1 text-sm leading-relaxed text-gray-400"
                  style={{ marginTop: "var(--space-1)" }}
                >
                  Find and book the perfect DJ for your event from a global
                  directory.
                </p>
              </div>
              <ul
                className="space-y-1 text-xs text-gray-400"
                style={{ gap: "var(--space-1)" }}
              >
                <li>✓ Browse verified DJ profiles</li>
                <li>✓ Post open gigs for free</li>
                <li>✓ Manage bookings in one place</li>
              </ul>
              <Button
                asChild
                variant="outline"
                className="mt-auto w-full cursor-pointer border-white/20 font-semibold text-gray-300 hover:bg-white/5 hover:text-white"
              >
                <Link href={organizerHref}>Join as Organizer</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
