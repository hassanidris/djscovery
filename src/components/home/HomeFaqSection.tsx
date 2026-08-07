import Link from "next/link";
import { CircleHelp, ArrowRight } from "lucide-react";
import FaqAccordion from "@/components/faq/faq-accordion";
import { HOMEPAGE_FAQ } from "@/data/faq-data";

export default function HomeFaqSection() {
  return (
    <section className="border-t border-white/5 px-4 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Left — heading */}
          <div className="flex flex-col gap-4 lg:w-72 lg:shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="bg-h_red/10 border-h_red/20 flex size-9 shrink-0 items-center justify-center rounded-xl border">
                <CircleHelp className="text-h_redLight h-4.5 w-4.5" />
              </div>
              <span className="text-h_redLight text-xs font-semibold tracking-[0.15em] uppercase">
                FAQ
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Everything you need to know about DJcovery before creating your
              profile or hiring a DJ.
            </p>

            <Link
              href="/faq"
              className="text-h_redLight hover:text-h_redLightDark mt-2 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
            >
              View all FAQs
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Right — accordion */}
          <div className="flex-1">
            <div className="rounded-2xl border border-white/8 bg-white/2 px-6 py-2">
              <FaqAccordion
                items={HOMEPAGE_FAQ}
                defaultOpen="home-faq-0"
                idPrefix="home-faq"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
