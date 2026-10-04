import Link from "next/link";
import { Metadata } from "next";
import WaitlistForm from "@/components/founding-djs/WaitlistForm";

export const metadata: Metadata = {
  title: "Founding DJs Program | Join the First Wave of Talent on Djscovery",
  description:
    "Be among the first 100 founding DJs on Djscovery. Get 12 months of premium, priority discovery, and a permanent founding badge. Apply now and shape the future of DJ discovery.",
  keywords: [
    "founding DJs",
    "DJ platform",
    "DJ discovery",
    "premium DJ profile",
    "DJ community",
  ],
  openGraph: {
    title: "Founding DJs Program | Join the First Wave of Talent",
    description:
      "Get 12 months of premium, priority discovery, and a permanent founding badge. Limited to 100 DJs.",
    type: "website",
  },
};

export default function FoundingDJsPage() {
  return (
    <div className="from-h_charcoal min-h-screen bg-linear-to-b to-black">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <section className="mb-24 text-center">
            <div className="border-h_red/30 bg-h_red/10 text-h_red mb-6 inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium">
              Limited to 100 spots
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Shape the Future of DJ Discovery
            </h1>
            <p className="mb-10 max-w-2xl text-lg text-gray-400 sm:text-xl">
              Join the first 100 founding DJs on Djscovery. Get exclusive
              benefits, early access, and a permanent badge that sets you apart.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/founding-djs/apply"
                className="bg-h_red hover:bg-h_redDark w-full rounded-lg px-8 py-4 text-center font-semibold text-white transition-colors sm:w-auto"
              >
                Apply Now
              </Link>
              <Link
                href="#benefits"
                className="w-full rounded-lg border border-gray-700 bg-transparent px-8 py-4 text-center font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto"
              >
                Learn More
              </Link>
            </div>
          </section>

          <section id="benefits" className="mb-24">
            <h2 className="mb-12 text-center text-3xl font-bold text-white">
              Why Become a Founding DJ?
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <div className="bg-h_red/20 text-h_red mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  12 Months Premium
                </h3>
                <p className="text-sm text-gray-400">
                  Unlimited uploads, advanced analytics, and all premium tools
                  from day one.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <div className="bg-h_red/20 text-h_red mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Priority Discovery
                </h3>
                <p className="text-sm text-gray-400">
                  Boosted search results and featured placement for a full year.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <div className="bg-h_red/20 text-h_red mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806l3.082 2.837c1.098.889 2.52 1.568 4.318 1.568h.745"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Permanent Badge
                </h3>
                <p className="text-sm text-gray-400">
                  Distinctive gold badge on your profile forever.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <div className="bg-h_red/20 text-h_red mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Shape the Platform
                </h3>
                <p className="text-sm text-gray-400">
                  Direct influence on features and priority support.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-24">
            <h2 className="mb-12 text-center text-3xl font-bold text-white">
              Simple Application Process
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8 text-center">
                <div className="bg-h_red mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white">
                  1
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Apply</h3>
                <p className="text-sm text-gray-400">
                  Fill out a short application with your DJ details and
                  portfolio.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8 text-center">
                <div className="bg-h_red mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white">
                  2
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Review
                </h3>
                <p className="text-sm text-gray-400">
                  Our team reviews within 2 weeks. We check portfolio and fit.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8 text-center">
                <div className="bg-h_red mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white">
                  3
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Launch
                </h3>
                <p className="text-sm text-gray-400">
                  Create your profile and activate your founding status.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-24">
            <h2 className="mb-8 text-center text-3xl font-bold text-white">
              Who Should Apply?
            </h2>
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start gap-4">
                  <div className="bg-h_red/20 text-h_red mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-white">Active DJ</h3>
                    <p className="text-sm text-gray-400">
                      Regular performances at venues or consistent gig schedule
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-h_red/20 text-h_red mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-white">Portfolio</h3>
                    <p className="text-sm text-gray-400">
                      Mix, demo, or recorded set showcasing your style
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-h_red/20 text-h_red mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-white">
                      Social Presence
                    </h3>
                    <p className="text-sm text-gray-400">
                      Active on social media with engaged audience
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-h_red/20 text-h_red mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-white">
                      Professional Mindset
                    </h3>
                    <p className="text-sm text-gray-400">
                      Treat DJing as a career or serious pursuit
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-24">
            <h2 className="mb-8 text-center text-3xl font-bold text-white">
              FAQ
            </h2>
            <div className="mx-auto max-w-3xl space-y-4">
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <h3 className="mb-2 font-semibold text-white">
                  How many founding DJs will there be?
                </h3>
                <p className="text-sm text-gray-400">
                  We&apos;re capping at 100 DJs to maintain exclusivity and
                  badge value.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <h3 className="mb-2 font-semibold text-white">
                  What happens after 12 months of premium?
                </h3>
                <p className="text-sm text-gray-400">
                  You can continue with paid premium or switch to free tier.
                  Your founding badge stays forever.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <h3 className="mb-2 font-semibold text-white">
                  Can I apply without a DJ profile?
                </h3>
                <p className="text-sm text-gray-400">
                  Yes! Most founding DJs will be new. You&apos;ll create your
                  profile after approval.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <h3 className="mb-2 font-semibold text-white">
                  Is there a cost to apply?
                </h3>
                <p className="text-sm text-gray-400">
                  No. Applying is free, and there&apos;s no cost to become a
                  founding DJ.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="mb-8 text-center text-3xl font-bold text-white">
              Not a DJ?
            </h2>
            <div className="mx-auto max-w-lg rounded-xl border border-gray-800 bg-gray-900/50 p-8 text-center">
              <p className="mb-6 text-gray-400">
                Join our waitlist to be notified when we launch publicly.
              </p>
              <WaitlistForm />
            </div>
          </section>

          <section className="text-center">
            <Link
              href="/founding-djs/apply"
              className="bg-h_red hover:bg-h_redDark inline-block rounded-lg px-8 py-4 font-semibold text-white transition-colors"
            >
              Apply to Become a Founding DJ
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
