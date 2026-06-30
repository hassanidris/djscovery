import type { Metadata } from "next";
import Link from "next/link";
import { ScrollText, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the Terms of Service governing your access to and use of DJcovery.",
};

const toc = [
  { id: "about", label: "About DJcovery" },
  { id: "eligibility", label: "Eligibility" },
  { id: "user-accounts", label: "User Accounts" },
  { id: "user-roles", label: "User Roles" },
  { id: "user-content", label: "User Content" },
  { id: "prohibited-content", label: "Prohibited Content" },
  { id: "gig-listings", label: "Gig Listings and Events" },
  { id: "reviews", label: "Reviews and Ratings" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "privacy", label: "Privacy" },
  { id: "platform-availability", label: "Platform Availability" },
  { id: "suspension-termination", label: "Account Suspension and Termination" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "limitation-of-liability", label: "Limitation of Liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "premium-features", label: "Future Premium Features" },
  { id: "changes", label: "Changes to These Terms" },
  { id: "governing-law", label: "Governing Law" },
  { id: "contact", label: "Contact Us" },
];

export default function TermsOfServicePage() {
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
                <ScrollText className="text-h_red h-5 w-5" />
              </div>
              <span className="text-h_red text-xs font-semibold tracking-[0.15em] uppercase">
                Legal
              </span>
            </div>
            <h1 className="font-heading text-4xl text-white md:text-5xl">
              Terms of Service
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-gray-400">
              These Terms govern your access to and use of DJcovery. Please read
              them carefully before using the Platform.
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
                (&quot;Platform&quot;, &quot;Service&quot;, &quot;we&quot;,
                &quot;our&quot;, or &quot;us&quot;). By accessing or using
                DJcovery, you agree to be bound by these Terms. If you do not
                agree, you may not use the Platform.
              </p>

              {/* 1 */}
              <section id="about" className="scroll-mt-24">
                <SectionHeading number={1} title="About DJcovery" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    DJcovery is a professional platform designed to help DJs
                    showcase their profiles, promote their work, discover
                    opportunities, and connect with event organizers and fans.
                  </p>
                  <InfoNote>
                    DJcovery acts solely as a technology platform and is not a
                    party to any agreements, bookings, contracts, or
                    arrangements made between users.
                  </InfoNote>
                </div>
              </section>

              {/* 2 */}
              <section id="eligibility" className="scroll-mt-24">
                <SectionHeading number={2} title="Eligibility" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    You must be at least{" "}
                    <span className="font-semibold text-white">
                      18 years old
                    </span>{" "}
                    to create an account and use DJcovery.
                  </p>
                  <p>By using the Platform, you represent and warrant that:</p>
                  <PolicyList
                    items={[
                      "You are legally capable of entering into binding agreements.",
                      "The information you provide is accurate and up to date.",
                      "You will comply with all applicable laws and regulations.",
                    ]}
                  />
                </div>
              </section>

              {/* 3 */}
              <section id="user-accounts" className="scroll-mt-24">
                <SectionHeading number={3} title="User Accounts" />
                <div className="flex flex-col gap-6 text-gray-400">
                  <p>
                    To access certain features, you may be required to create an
                    account.
                  </p>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold tracking-wide text-white uppercase">
                      You are responsible for
                    </h3>
                    <PolicyList
                      items={[
                        "Maintaining the security of your account.",
                        "Keeping your login credentials confidential.",
                        "All activities occurring under your account.",
                      ]}
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold tracking-wide text-white uppercase">
                      You agree not to
                    </h3>
                    <PolicyList
                      items={[
                        "Share your account with others.",
                        "Create multiple accounts for deceptive purposes.",
                        "Impersonate another person, business, or organization.",
                      ]}
                    />
                  </div>
                  <InfoNote>
                    DJcovery reserves the right to suspend or terminate accounts
                    that violate these Terms.
                  </InfoNote>
                </div>
              </section>

              {/* 4 */}
              <section id="user-roles" className="scroll-mt-24">
                <SectionHeading number={4} title="User Roles" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    DJcovery currently supports the following account types:
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {["DJs", "Organizers", "Fans"].map((role) => (
                      <div
                        key={role}
                        className="rounded-xl border border-white/5 bg-white/2 px-4 py-3"
                      >
                        <p className="text-sm font-semibold text-white">
                          {role}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p>
                    Different features may be available depending on your
                    selected role. We reserve the right to modify, add, or
                    remove features associated with any role at any time.
                  </p>
                </div>
              </section>

              {/* 5 */}
              <section id="user-content" className="scroll-mt-24">
                <SectionHeading number={5} title="User Content" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    Users may upload, submit, publish, or share content,
                    including:
                  </p>
                  <PolicyList
                    items={[
                      "Profile information",
                      "Images",
                      "Audio samples",
                      "Videos",
                      "Event information",
                      "Gig listings",
                      "Reviews",
                      "Comments",
                      "Social links",
                    ]}
                  />
                  <p>
                    You retain ownership of your content. By posting content on
                    DJcovery, you grant us a worldwide, non-exclusive,
                    royalty-free license to host, display, distribute, and
                    promote such content solely for operating and improving the
                    Platform.
                  </p>
                  <InfoNote>
                    You are solely responsible for the content you publish.
                  </InfoNote>
                </div>
              </section>

              {/* 6 */}
              <section id="prohibited-content" className="scroll-mt-24">
                <SectionHeading number={6} title="Prohibited Content" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>You may not upload or publish content that:</p>
                  <PolicyList
                    items={[
                      "Violates any law or regulation.",
                      "Infringes intellectual property rights.",
                      "Contains false or misleading information.",
                      "Promotes hate speech, violence, discrimination, or harassment.",
                      "Contains malware, spam, or malicious code.",
                      "Is sexually explicit or otherwise inappropriate.",
                    ]}
                  />
                  <InfoNote>
                    DJcovery may remove content that violates these rules
                    without notice.
                  </InfoNote>
                </div>
              </section>

              {/* 7 */}
              <section id="gig-listings" className="scroll-mt-24">
                <SectionHeading number={7} title="Gig Listings and Events" />
                <div className="flex flex-col gap-6 text-gray-400">
                  <p>
                    Organizers may publish gig opportunities. DJs may create
                    event listings and showcase past performances.
                  </p>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold tracking-wide text-white uppercase">
                      DJcovery does not
                    </h3>
                    <PolicyList
                      items={[
                        "Guarantee the accuracy of listings.",
                        "Verify every organizer or DJ.",
                        "Guarantee that bookings will occur.",
                        "Guarantee attendance at any event.",
                      ]}
                    />
                  </div>
                  <p>
                    Users are responsible for conducting their own due diligence
                    before entering into agreements.
                  </p>
                </div>
              </section>

              {/* 8 */}
              <section id="reviews" className="scroll-mt-24">
                <SectionHeading number={8} title="Reviews and Ratings" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>Users may leave reviews and ratings where permitted.</p>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold tracking-wide text-white uppercase">
                      Reviews must
                    </h3>
                    <PolicyList
                      items={[
                        "Reflect genuine experiences.",
                        "Be truthful and respectful.",
                        "Not contain defamatory or misleading statements.",
                      ]}
                    />
                  </div>
                  <InfoNote>
                    DJcovery reserves the right to remove reviews that violate
                    these standards.
                  </InfoNote>
                </div>
              </section>

              {/* 9 */}
              <section id="intellectual-property" className="scroll-mt-24">
                <SectionHeading number={9} title="Intellectual Property" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    The DJcovery name, branding, logos, design elements,
                    software, and content created by DJcovery are protected by
                    intellectual property laws.
                  </p>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold tracking-wide text-white uppercase">
                      You may not
                    </h3>
                    <PolicyList
                      items={[
                        "Copy or reproduce the Platform.",
                        "Reverse engineer the software.",
                        "Use DJcovery branding without written permission.",
                      ]}
                    />
                  </div>
                </div>
              </section>

              {/* 10 */}
              <section id="privacy" className="scroll-mt-24">
                <SectionHeading number={10} title="Privacy" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    Your use of DJcovery is also governed by our{" "}
                    <Link
                      href="/privacy-policy"
                      className="text-h_red hover:text-h_redDark underline underline-offset-2 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                    . Please review it to understand how we collect, use, and
                    protect your information.
                  </p>
                </div>
              </section>

              {/* 11 */}
              <section id="platform-availability" className="scroll-mt-24">
                <SectionHeading number={11} title="Platform Availability" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    We strive to provide reliable access to DJcovery but do not
                    guarantee uninterrupted availability. We may:
                  </p>
                  <PolicyList
                    items={[
                      "Modify features.",
                      "Perform maintenance.",
                      "Suspend services temporarily.",
                      "Discontinue features at our discretion.",
                    ]}
                  />
                </div>
              </section>

              {/* 12 */}
              <section id="suspension-termination" className="scroll-mt-24">
                <SectionHeading
                  number={12}
                  title="Account Suspension and Termination"
                />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>We may suspend or terminate accounts that:</p>
                  <PolicyList
                    items={[
                      "Violate these Terms.",
                      "Engage in fraudulent activity.",
                      "Abuse other users.",
                      "Damage the integrity of the Platform.",
                    ]}
                  />
                  <p>
                    Users may delete their accounts at any time through
                    available account settings.
                  </p>
                </div>
              </section>

              {/* 13 */}
              <section id="disclaimers" className="scroll-mt-24">
                <SectionHeading number={13} title="Disclaimers" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    DJcovery is provided on an &quot;as is&quot; and &quot;as
                    available&quot; basis. To the fullest extent permitted by
                    law, DJcovery makes no warranties regarding:
                  </p>
                  <PolicyList
                    items={[
                      "Platform availability.",
                      "Accuracy of user content.",
                      "Success of bookings.",
                      "Quality of services provided by users.",
                      "Compatibility with specific devices or browsers.",
                    ]}
                  />
                </div>
              </section>

              {/* 14 */}
              <section id="limitation-of-liability" className="scroll-mt-24">
                <SectionHeading number={14} title="Limitation of Liability" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    To the maximum extent permitted by law, DJcovery shall not
                    be liable for:
                  </p>
                  <PolicyList
                    items={[
                      "Indirect damages.",
                      "Lost profits.",
                      "Loss of business opportunities.",
                      "Data loss.",
                      "Disputes between users.",
                    ]}
                  />
                  <InfoNote>
                    Our total liability shall not exceed the amount paid by you
                    to DJcovery during the twelve (12) months preceding the
                    claim.
                  </InfoNote>
                </div>
              </section>

              {/* 15 */}
              <section id="indemnification" className="scroll-mt-24">
                <SectionHeading number={15} title="Indemnification" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    You agree to indemnify and hold harmless DJcovery, its
                    owners, affiliates, employees, and partners from claims,
                    damages, liabilities, and expenses arising from:
                  </p>
                  <PolicyList
                    items={[
                      "Your use of the Platform.",
                      "Your content.",
                      "Your violation of these Terms.",
                    ]}
                  />
                </div>
              </section>

              {/* 16 */}
              <section id="premium-features" className="scroll-mt-24">
                <SectionHeading number={16} title="Future Premium Features" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    DJcovery may introduce premium subscriptions, paid features,
                    advertising opportunities, or promotional services in the
                    future. Additional terms may apply to such services.
                  </p>
                </div>
              </section>

              {/* 17 */}
              <section id="changes" className="scroll-mt-24">
                <SectionHeading number={17} title="Changes to These Terms" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    We may update these Terms from time to time. When material
                    changes are made, we will update the &quot;Last
                    Updated&quot; date and may notify users through the
                    Platform.
                  </p>
                  <InfoNote>
                    Continued use of DJcovery after changes become effective
                    constitutes acceptance of the revised Terms.
                  </InfoNote>
                </div>
              </section>

              {/* 18 */}
              <section id="governing-law" className="scroll-mt-24">
                <SectionHeading number={18} title="Governing Law" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    These Terms shall be governed by and construed in accordance
                    with the laws of{" "}
                    <span className="font-semibold text-white">Sweden</span>,
                    without regard to conflict of law principles. Any disputes
                    arising from these Terms shall be subject to the exclusive
                    jurisdiction of the courts of Sweden.
                  </p>
                </div>
              </section>

              {/* 19 */}
              <section id="contact" className="scroll-mt-24">
                <SectionHeading number={19} title="Contact Us" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    If you have questions regarding these Terms, please contact
                    us:
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
                  By using DJcovery, you acknowledge that you have read,
                  understood, and agree to these Terms of Service.
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
