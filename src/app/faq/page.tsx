import type { Metadata } from "next";
import Link from "next/link";
import { CircleHelp, ArrowRight, Mail } from "lucide-react";
import FaqAccordion from "@/components/faq/faq-accordion";
import { FAQ_CATEGORIES } from "@/data/faq-data";

export const metadata: Metadata = {
  title: "FAQ | DJcovery",
  description:
    "Find answers to common questions about DJcovery, DJ profiles, gigs, bookings, organizers, fans, and account features.",
};

export const revalidate = 86400; // Cache for 24 hours

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="bg-h_red/5 absolute top-0 left-1/2 h-150 w-200 -translate-x-1/2 -translate-y-1/3 rounded-full blur-3xl" />
        <div className="bg-h_red/3 absolute right-0 bottom-0 h-100 w-150 translate-x-1/4 translate-y-1/4 rounded-full blur-3xl" />
      </div>

      {/* Page header */}
      <header className="relative border-b border-white/5 bg-black/80 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="bg-h_red/10 border-h_red/20 flex size-10 shrink-0 items-center justify-center rounded-xl border">
                <CircleHelp className="text-h_redLight h-5 w-5" />
              </div>
              <span className="text-h_redLight text-xs font-semibold tracking-[0.15em] uppercase">
                Help Center
              </span>
            </div>
            <h1 className="font-heading text-4xl text-white md:text-6xl">
              Frequently Asked <span className="text-h_redLight">Questions</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-gray-400 md:text-lg">
              Find answers about DJ profiles, organizer tools, gigs, bookings,
              accounts, and future DJcovery features.
            </p>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="relative mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="flex flex-col gap-16 lg:flex-row lg:gap-16">
          {/* ── Sticky category nav ── */}
          <aside className="shrink-0 lg:w-56">
            <div className="sticky top-24">
              <p className="mb-4 text-xs font-semibold tracking-[0.15em] text-white/40 uppercase">
                Categories
              </p>
              <nav aria-label="FAQ categories" className="flex flex-col gap-1">
                {FAQ_CATEGORIES.map((cat) => (
                  <a
                    key={cat.id}
                    href={`#${cat.id}`}
                    className="hover:text-h_redLight group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-white/4"
                  >
                    <span className="group-hover:bg-h_red/60 h-1.5 w-1.5 shrink-0 rounded-full bg-white/20 transition-colors" />
                    {cat.label}
                  </a>
                ))}
              </nav>

              <div className="mt-8 border-t border-white/5 pt-6">
                <p className="mb-3 text-xs text-gray-400">
                  Can&apos;t find your answer?
                </p>
                <Link
                  href="/contact"
                  className="text-h_redLight hover:text-h_redLightDark inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Contact Support
                </Link>
              </div>
            </div>
          </aside>

          {/* ── FAQ sections ── */}
          <div className="flex min-w-0 flex-1 flex-col gap-14">
            {FAQ_CATEGORIES.map((category, catIndex) => (
              <section
                key={category.id}
                id={category.id}
                className="scroll-mt-24"
                aria-labelledby={`${category.id}-heading`}
              >
                {/* Category heading */}
                <div className="mb-6 flex items-baseline gap-3 border-b border-white/5 pb-4">
                  <span className="text-h_redLight font-heading text-sm font-bold tabular-nums">
                    {String(catIndex + 1).padStart(2, "0")}
                  </span>
                  <h2
                    id={`${category.id}-heading`}
                    className="font-heading text-xl text-white"
                  >
                    {category.label}
                  </h2>
                </div>

                {/* Accordion */}
                <div className="rounded-2xl border border-white/8 bg-white/2 px-6 py-2">
                  <FaqAccordion
                    items={category.items}
                    defaultOpen={
                      catIndex === 0 ? `${category.id}-0` : undefined
                    }
                    idPrefix={category.id}
                  />
                </div>
              </section>
            ))}

            {/* ── Support CTA ── */}
            <div className="rounded-2xl border border-white/8 bg-white/2 p-8">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-semibold text-white">
                    Still have questions?
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-400">
                    Our support team is happy to help you with anything not
                    covered here.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="bg-h_red hover:bg-h_redDark inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                >
                  Contact Support
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
