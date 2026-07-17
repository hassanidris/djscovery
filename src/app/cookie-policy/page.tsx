import type { Metadata } from "next";
import Link from "next/link";
import { Cookie, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Learn how DJcovery uses cookies and similar technologies when you visit our platform.",
};

const toc = [
  { id: "what-are-cookies", label: "What Are Cookies?" },
  { id: "how-we-use-cookies", label: "How DJcovery Uses Cookies" },
  { id: "third-party-services", label: "Third-Party Services" },
  { id: "managing-cookies", label: "Managing Cookies" },
  { id: "privacy-rights", label: "Your Privacy Rights" },
  { id: "updates", label: "Updates to This Cookie Policy" },
  { id: "contact", label: "Contact Us" },
];

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="bg-h_red/4 absolute top-0 left-1/2 h-150 w-200 -translate-x-1/2 -translate-y-1/3 rounded-full blur-3xl" />
      </div>

      {/* Page header */}
      <div className="relative border-b border-white/5 bg-black/80 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-h_red/10 border-h_red/20 flex size-10 shrink-0 items-center justify-center rounded-xl border">
                <Cookie className="text-h_red h-5 w-5" />
              </div>
              <span className="text-h_red text-xs font-semibold tracking-[0.15em] uppercase">
                Legal
              </span>
            </div>
            <h1 className="font-heading text-4xl text-white md:text-5xl">
              Cookie Policy
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-gray-400">
              This Cookie Policy explains how DJcovery uses cookies and similar
              technologies when you visit and use our platform.
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
              <span>Last Updated:</span>
              <span className="font-medium text-gray-400">June 23, 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* ── Sticky TOC ── */}
          <aside className="shrink-0 lg:w-60">
            <div className="sticky top-24">
              <p className="mb-4 text-xs font-semibold tracking-[0.15em] text-white/40 uppercase">
                Contents
              </p>
              <nav className="flex flex-col gap-1.5">
                {toc.map((item, i) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="hover:text-h_red group flex items-baseline gap-2.5 text-sm text-gray-500 transition-colors"
                  >
                    <span className="text-h_red/40 group-hover:text-h_red min-w-5 text-[11px] font-medium tabular-nums transition-colors">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="min-w-0 flex-1">
            <div className="flex flex-col gap-12">
              {/* Intro paragraph */}
              <p className="text-gray-400">
                Welcome to{" "}
                <span className="font-semibold text-white">DJcovery</span>{" "}
                (&quot;DJcovery&quot;, &quot;we&quot;, &quot;our&quot;, or
                &quot;us&quot;). This Cookie Policy explains how we use cookies
                and similar technologies when you visit and use our website,
                mobile applications, and services available through DJcovery. By
                continuing to use our platform, you agree to the use of cookies
                as described in this policy, unless you disable them through
                your browser settings or cookie preferences.
              </p>

              {/* 1 */}
              <section id="what-are-cookies" className="scroll-mt-24">
                <SectionHeading number={1} title="What Are Cookies?" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    Cookies are small text files stored on your device when you
                    visit a website. They help websites remember information
                    about your visit, improve functionality, enhance security,
                    and provide a better user experience.
                  </p>
                  <p>
                    Cookies may be temporary{" "}
                    <span className="font-semibold text-white">
                      (session cookies)
                    </span>{" "}
                    or remain on your device for a longer period{" "}
                    <span className="font-semibold text-white">
                      (persistent cookies)
                    </span>
                    .
                  </p>
                </div>
              </section>

              {/* 2 */}
              <section id="how-we-use-cookies" className="scroll-mt-24">
                <SectionHeading number={2} title="How DJcovery Uses Cookies" />
                <div className="flex flex-col gap-8 text-gray-400">
                  <p>
                    We use cookies and similar technologies for the following
                    purposes:
                  </p>

                  {/* Essential */}
                  <CookieCategory
                    title="Essential Cookies"
                    description="These cookies are necessary for the platform to function properly."
                  >
                    <PolicyList
                      items={[
                        "User authentication and login sessions",
                        "Account security and fraud prevention",
                        "Remembering your role (DJ, Organizer, or Fan)",
                        "Maintaining user sessions",
                        "Load balancing and performance optimization",
                      ]}
                    />
                    <InfoNote>
                      Without these cookies, DJcovery cannot operate correctly.
                    </InfoNote>
                  </CookieCategory>

                  {/* Functional */}
                  <CookieCategory
                    title="Functional Cookies"
                    description="These cookies improve your experience by remembering preferences such as:"
                  >
                    <PolicyList
                      items={[
                        "Language settings",
                        "Theme preferences (light or dark mode)",
                        "Region or country selection",
                        "User interface preferences",
                      ]}
                    />
                    <InfoNote>
                      These cookies are not strictly necessary but help provide
                      a more personalized experience.
                    </InfoNote>
                  </CookieCategory>

                  {/* Analytics */}
                  <CookieCategory
                    title="Analytics Cookies"
                    description="Analytics cookies help us understand how visitors use DJcovery. We may collect information such as:"
                  >
                    <PolicyList
                      items={[
                        "Pages visited",
                        "Features used",
                        "Time spent on pages",
                        "Device and browser information",
                        "Traffic sources",
                      ]}
                    />
                    <InfoNote>
                      This information helps us improve platform performance,
                      usability, and user experience.
                    </InfoNote>
                  </CookieCategory>

                  {/* Performance */}
                  <CookieCategory
                    title="Performance Cookies"
                    description="Performance cookies help us monitor:"
                  >
                    <PolicyList
                      items={[
                        "Website speed",
                        "Error reporting",
                        "Service reliability",
                        "Infrastructure performance",
                      ]}
                    />
                    <InfoNote>
                      These cookies help us identify and fix technical issues.
                    </InfoNote>
                  </CookieCategory>
                </div>
              </section>

              {/* 3 */}
              <section id="third-party-services" className="scroll-mt-24">
                <SectionHeading number={3} title="Third-Party Services" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    DJcovery may use trusted third-party providers that place
                    cookies on our behalf. Examples may include:
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        name: "Supabase",
                        desc: "Authentication & Database Services",
                      },
                      {
                        name: "Google Analytics",
                        desc: "Website Analytics",
                      },
                      {
                        name: "Vercel",
                        desc: "Hosting & Performance Monitoring",
                      },
                      {
                        name: "Cloudflare",
                        desc: "Security & Content Delivery",
                      },
                      {
                        name: "Resend",
                        desc: "Email Services",
                      },
                    ].map((provider) => (
                      <div
                        key={provider.name}
                        className="rounded-xl border border-white/5 bg-white/2 px-4 py-3"
                      >
                        <p className="text-sm font-semibold text-white">
                          {provider.name}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {provider.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                  <InfoNote>
                    These providers have their own privacy and cookie policies
                    governing how they process information.
                  </InfoNote>
                </div>
              </section>

              {/* 4 */}
              <section id="managing-cookies" className="scroll-mt-24">
                <SectionHeading number={4} title="Managing Cookies" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    You can control or disable cookies through your browser
                    settings. Most browsers allow you to:
                  </p>
                  <PolicyList
                    items={[
                      "View stored cookies",
                      "Delete cookies",
                      "Block cookies",
                      "Configure notifications before cookies are stored",
                    ]}
                  />
                  <InfoNote>
                    Please note that disabling essential cookies may affect
                    certain features and prevent parts of DJcovery from
                    functioning correctly.
                  </InfoNote>
                </div>
              </section>

              {/* 5 */}
              <section id="privacy-rights" className="scroll-mt-24">
                <SectionHeading number={5} title="Your Privacy Rights" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    If you are located in the European Economic Area (EEA),
                    United Kingdom, or other regions with applicable privacy
                    laws, you may have rights regarding the collection and
                    processing of personal data associated with cookies.
                  </p>
                  <p>
                    For more information, please review our{" "}
                    <Link
                      href="/privacy"
                      className="text-h_red hover:text-h_redDark underline underline-offset-2 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </section>

              {/* 6 */}
              <section id="updates" className="scroll-mt-24">
                <SectionHeading
                  number={6}
                  title="Updates to This Cookie Policy"
                />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    We may update this Cookie Policy from time to time to
                    reflect changes in technology, legal requirements, or our
                    services.
                  </p>
                  <InfoNote>
                    When updates are made, the &quot;Last Updated&quot; date at
                    the top of this page will be revised.
                  </InfoNote>
                </div>
              </section>

              {/* 7 */}
              <section id="contact" className="scroll-mt-24">
                <SectionHeading number={7} title="Contact Us" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    If you have any questions about this Cookie Policy or how
                    DJcovery uses cookies, please contact us:
                  </p>
                  <Link
                    href="/contact?category=General+enquiry"
                    className="group flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 p-6 transition-colors hover:border-white/10 hover:bg-white/5"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-semibold text-white">
                        Get in touch
                      </p>
                      <p className="text-sm text-gray-500">
                        Use our contact form — we typically reply within 1–2
                        business days.
                      </p>
                    </div>
                    <ArrowRight className="text-h_red h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </section>

              {/* Bottom acknowledgement + divider */}
              <div className="flex flex-col gap-3 border-t border-white/5 pt-6">
                <InfoNote>
                  By using DJcovery, you acknowledge that you have read and
                  understood this Cookie Policy.
                </InfoNote>
                <p className="text-xs text-gray-600">
                  &copy; {new Date().getFullYear()} DJcovery. All rights
                  reserved.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ number, title }: { number: number; title: string }) {
  return (
    <div className="mb-5 flex items-baseline gap-3 border-b border-white/5 pb-4">
      <span className="text-h_red font-heading text-sm font-bold tabular-nums">
        {String(number).padStart(2, "0")}
      </span>
      <h2 className="font-heading text-xl text-white">{title}</h2>
    </div>
  );
}

function CookieCategory({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/2 p-5">
      <h3 className="mb-1 text-sm font-semibold text-white">{title}</h3>
      <p className="mb-4 text-sm text-gray-500">{description}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span className="bg-h_red mt-1.75 h-1 w-1 shrink-0 rounded-full" />
          <span className="text-sm leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-h_red/20 bg-h_red/5 rounded-xl border-l-2 px-4 py-3">
      <p className="text-sm leading-relaxed text-gray-400">{children}</p>
    </div>
  );
}
