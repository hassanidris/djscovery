import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how DJcovery collects, uses, and protects your personal information.",
};

export const revalidate = 86400; // Cache for 24 hours

const toc = [
  { id: "introduction", label: "Introduction" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use", label: "How We Use Your Information" },
  { id: "public-information", label: "Public Information" },
  { id: "email-communications", label: "Email Communications" },
  { id: "cookies", label: "Cookies and Similar Technologies" },
  { id: "data-sharing", label: "Data Sharing" },
  { id: "data-retention", label: "Data Retention" },
  { id: "security", label: "Security" },
  { id: "your-rights", label: "Your Rights (GDPR)" },
  { id: "childrens-privacy", label: "Children's Privacy" },
  { id: "international-transfers", label: "International Data Transfers" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Us" },
];

export default function PrivacyPolicyPage() {
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
                <Shield className="text-h_redLight h-5 w-5" />
              </div>
              <span className="text-h_redLight text-xs font-semibold tracking-[0.15em] uppercase">
                Legal
              </span>
            </div>
            <h1 className="font-heading text-4xl text-white md:text-5xl">
              Privacy Policy
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-gray-400">
              We are committed to protecting your privacy and handling your
              personal information transparently and securely.
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
              <span>Last Updated:</span>
              <span className="font-medium text-gray-400">July 2026</span>
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
                    className="hover:text-h_redLight group flex items-baseline gap-2.5 text-sm text-gray-400 transition-colors"
                  >
                    <span className="text-h_redLight/40 group-hover:text-h_redLight min-w-5 text-[11px] font-medium tabular-nums transition-colors">
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
            <div className="prose-policy flex flex-col gap-12">
              {/* 1 */}
              <section id="introduction" className="scroll-mt-24">
                <SectionHeading number={1} title="Introduction" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    Welcome to{" "}
                    <span className="font-semibold text-white">DJcovery</span>.
                  </p>
                  <p>
                    DJcovery (&quot;we&quot;, &quot;our&quot;, or
                    &quot;us&quot;) is a platform designed to help DJs showcase
                    their professional profiles, connect with organizers,
                    discover opportunities, and grow their reputation within the
                    music industry.
                  </p>
                  <p>
                    We are committed to protecting your privacy and handling
                    your personal information transparently and securely.
                  </p>
                  <p>
                    This Privacy Policy explains what information we collect,
                    how we use it, and what rights you have regarding your
                    personal data.
                  </p>
                  <p>
                    By using DJcovery, you agree to the practices described in
                    this Privacy Policy.
                  </p>
                </div>
              </section>

              {/* 2 */}
              <section id="information-we-collect" className="scroll-mt-24">
                <SectionHeading number={2} title="Information We Collect" />
                <div className="flex flex-col gap-8 text-gray-400">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold tracking-wide text-white uppercase">
                      Account Information
                    </h3>
                    <p className="mb-3">
                      When you create an account, we may collect:
                    </p>
                    <PolicyList
                      items={[
                        "Name",
                        "Email address",
                        "Username",
                        "Profile photo",
                        "User role (DJ, Organizer, Fan)",
                        "Country and city",
                      ]}
                    />
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold tracking-wide text-white uppercase">
                      Profile Information
                    </h3>
                    <p className="mb-4">
                      Depending on your role, you may choose to provide:
                    </p>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <RoleCard
                        title="DJs"
                        items={[
                          "Stage name",
                          "Biography",
                          "Genres",
                          "Social media links",
                          "Photos",
                          "Audio samples",
                          "Videos",
                          "Event history",
                        ]}
                      />
                      <RoleCard
                        title="Organizers"
                        items={[
                          "Business or organizer name",
                          "Contact details",
                          "Website",
                          "Social media links",
                          "Company information",
                        ]}
                      />
                      <RoleCard
                        title="Fans"
                        items={[
                          "Display name",
                          "Profile photo",
                          "Favorites and interactions",
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold tracking-wide text-white uppercase">
                      Content You Create
                    </h3>
                    <p className="mb-3">
                      We collect content you voluntarily submit, including:
                    </p>
                    <PolicyList
                      items={[
                        "Profile information",
                        "Event listings",
                        "Gig postings",
                        "Reviews",
                        "Ratings",
                        "Comments",
                        "Messages (if messaging becomes available)",
                        "Uploaded media files",
                      ]}
                    />
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold tracking-wide text-white uppercase">
                      Authentication Information
                    </h3>
                    <p className="mb-3">
                      If you sign in using a third-party provider such as
                      Google, we may receive:
                    </p>
                    <PolicyList
                      items={["Name", "Email address", "Profile image"]}
                    />
                    <p className="mt-3">
                      We do not receive or store your Google password.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold tracking-wide text-white uppercase">
                      Technical Information
                    </h3>
                    <p className="mb-3">
                      When you use DJcovery, we may automatically collect:
                    </p>
                    <PolicyList
                      items={[
                        "IP address",
                        "Browser type",
                        "Device information",
                        "Operating system",
                        "Referring pages",
                        "Usage activity",
                        "Log data",
                      ]}
                    />
                  </div>
                </div>
              </section>

              {/* 3 */}
              <section id="how-we-use" className="scroll-mt-24">
                <SectionHeading
                  number={3}
                  title="How We Use Your Information"
                />
                <div className="text-gray-400">
                  <p className="mb-4">We use personal information to:</p>
                  <PolicyList
                    items={[
                      "Create and manage accounts",
                      "Verify user identities",
                      "Display public profiles",
                      "Match DJs with organizers",
                      "Process gig applications",
                      "Provide platform features",
                      "Improve platform performance",
                      "Prevent abuse and fraud",
                      "Respond to support requests",
                      "Send account-related communications",
                      "Comply with legal obligations",
                    ]}
                  />
                </div>
              </section>

              {/* 4 */}
              <section id="public-information" className="scroll-mt-24">
                <SectionHeading number={4} title="Public Information" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>Certain profile information is publicly visible.</p>
                  <p>Examples include:</p>
                  <PolicyList
                    items={[
                      "DJ profile information",
                      "Organizer profile information",
                      "Events",
                      "Reviews",
                      "Ratings",
                      "Public comments",
                    ]}
                  />
                  <p>
                    You control much of the information you choose to publish.
                  </p>
                  <InfoNote>
                    Please avoid posting sensitive personal information
                    publicly.
                  </InfoNote>
                </div>
              </section>

              {/* 5 */}
              <section id="email-communications" className="scroll-mt-24">
                <SectionHeading number={5} title="Email Communications" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>We may send emails related to:</p>
                  <PolicyList
                    items={[
                      "Account verification",
                      "Password resets",
                      "Security notifications",
                      "Application updates",
                      "Gig-related activity",
                      "Platform announcements",
                    ]}
                  />
                  <p>
                    You may opt out of non-essential communications at any time.
                  </p>
                </div>
              </section>

              {/* 6 */}
              <section id="cookies" className="scroll-mt-24">
                <SectionHeading
                  number={6}
                  title="Cookies and Similar Technologies"
                />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>DJcovery may use cookies and similar technologies to:</p>
                  <PolicyList
                    items={[
                      "Keep users logged in",
                      "Remember preferences",
                      "Improve performance",
                      "Analyze platform usage",
                      "Enhance user experience",
                    ]}
                  />
                  <p>You may control cookies through your browser settings.</p>
                </div>
              </section>

              {/* 7 */}
              <section id="data-sharing" className="scroll-mt-24">
                <SectionHeading number={7} title="Data Sharing" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p className="font-medium text-white">
                    We do not sell your personal information.
                  </p>
                  <p>
                    We may share information with trusted service providers who
                    help operate DJcovery. These providers process data only as
                    necessary to provide their services.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        name: "Supabase",
                        role: "Authentication, database & storage",
                        legal: "Contract performance (Article 6(1)(b))",
                      },
                      {
                        name: "Vercel",
                        role: "Hosting and deployment",
                        legal: "Legitimate interest (Article 6(1)(f))",
                      },
                      {
                        name: "Resend",
                        role: "Transactional emails",
                        legal: "Contract performance (Article 6(1)(b))",
                      },
                      {
                        name: "Sentry",
                        role: "Error tracking & monitoring",
                        legal: "Legitimate interest (Article 6(1)(f))",
                      },
                      {
                        name: "Google",
                        role: "Authentication services",
                        legal: "Contract performance (Article 6(1)(b))",
                      },
                    ].map((provider) => (
                      <div
                        key={provider.name}
                        className="rounded-xl border border-white/5 bg-white/2 px-4 py-3"
                      >
                        <p className="text-sm font-semibold text-white">
                          {provider.name}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {provider.role}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-400">
                          Legal basis: {provider.legal}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    Data processing agreements: Pending — to be executed with
                    Supabase, Vercel, and Sentry (standard GDPR-compliant DPAs)
                  </p>
                  <p>We may also disclose information when required by law.</p>
                </div>
              </section>

              {/* 8 */}
              <section id="data-retention" className="scroll-mt-24">
                <SectionHeading number={8} title="Data Retention" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    We retain personal information only for as long as necessary
                    to:
                  </p>
                  <PolicyList
                    items={[
                      "Provide our services",
                      "Comply with legal obligations",
                      "Resolve disputes",
                      "Enforce our agreements",
                    ]}
                  />
                  <p>
                    Deleted accounts may have certain information retained for
                    security, legal, or operational reasons.
                  </p>
                </div>
              </section>

              {/* 9 */}
              <section id="security" className="scroll-mt-24">
                <SectionHeading number={9} title="Security" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    We take reasonable technical and organizational measures to
                    protect your information, including:
                  </p>
                  <PolicyList
                    items={[
                      "Encrypted connections (HTTPS)",
                      "Secure authentication",
                      "Access controls",
                      "Monitoring and logging",
                      "Secure cloud infrastructure",
                    ]}
                  />
                  <p>
                    However, no method of transmission or storage is completely
                    secure.
                  </p>
                </div>
              </section>

              {/* 10 */}
              <section id="your-rights" className="scroll-mt-24">
                <SectionHeading number={10} title="Your Rights (GDPR)" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    If you are located in the European Economic Area (EEA), you
                    have the right to:
                  </p>
                  <PolicyList
                    items={[
                      "Access your personal data",
                      "Correct inaccurate information",
                      "Request deletion of your data",
                      "Restrict processing",
                      "Object to processing",
                      "Request data portability",
                      "Withdraw consent where applicable",
                    ]}
                  />
                  <p>
                    To exercise your rights, contact us using the details below.
                  </p>
                </div>
              </section>

              {/* 11 */}
              <section id="childrens-privacy" className="scroll-mt-24">
                <SectionHeading number={11} title="Children's Privacy" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    DJcovery is not intended for children under the age of 18.
                  </p>
                  <p>
                    We do not knowingly collect personal information from
                    children. If you believe a child has provided personal
                    information, please contact us so we can remove it.
                  </p>
                </div>
              </section>

              {/* 12 */}
              <section id="international-transfers" className="scroll-mt-24">
                <SectionHeading
                  number={12}
                  title="International Data Transfers"
                />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    Some of our service providers may process data outside your
                    country of residence. When international transfers occur, we
                    take appropriate safeguards to protect your information in
                    accordance with applicable privacy laws.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        name: "Supabase",
                        region: "EU (Stockholm, Sweden)",
                        mechanism: "No international transfer required",
                      },
                      {
                        name: "Vercel",
                        region: "US (primary), EU (edge)",
                        mechanism:
                          "EU-US Data Privacy Framework (DPF) + Standard Contractual Clauses (SCCs)",
                      },
                      {
                        name: "Sentry",
                        region: "US",
                        mechanism: "Standard Contractual Clauses (SCCs)",
                      },
                    ].map((provider) => (
                      <div
                        key={provider.name}
                        className="rounded-xl border border-white/5 bg-white/2 px-4 py-3"
                      >
                        <p className="text-sm font-semibold text-white">
                          {provider.name}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {provider.region}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-400">
                          {provider.mechanism}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    Supplementary measures: Encryption in transit (TLS 1.3) and
                    at rest for all international transfers
                  </p>
                </div>
              </section>

              {/* 13 */}
              <section id="changes" className="scroll-mt-24">
                <SectionHeading
                  number={13}
                  title="Changes to This Privacy Policy"
                />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    We may update this Privacy Policy from time to time. When
                    significant changes are made, we will notify users through
                    the platform or by email when appropriate. The latest
                    version will always be available on this page.
                  </p>
                </div>
              </section>

              {/* 14 */}
              <section id="contact" className="scroll-mt-24">
                <SectionHeading number={14} title="Contact Us" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    If you have questions about this Privacy Policy or your
                    personal data, please contact:
                  </p>
                  <Link
                    href="/contact?category=General+enquiry"
                    className="group flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 p-6 transition-colors hover:border-white/10 hover:bg-white/5"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-semibold text-white">
                        Get in touch
                      </p>
                      <p className="text-sm text-gray-400">
                        Use our contact form — we typically reply within 1–2
                        business days.
                      </p>
                    </div>
                    <ArrowRight className="text-h_redLight h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <div className="mt-4 rounded-xl border border-white/5 bg-white/2 px-4 py-3">
                    <p className="text-xs font-semibold text-white">
                      Data Protection Officer
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Pending — to be appointed or designate privacy contact
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Supervisory Authority: IMY (Swedish authority) or local
                    equivalent
                  </p>
                </div>
              </section>

              {/* Bottom divider */}
              <div className="border-t border-white/5 pt-6">
                <p className="text-xs text-gray-400">
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
      <span className="text-h_redLight font-heading text-sm font-bold tabular-nums">
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

function RoleCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/2 p-4">
      <p className="mb-3 text-xs font-semibold tracking-[0.12em] text-white uppercase">
        {title}
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="bg-h_red mt-1.5 h-1 w-1 shrink-0 rounded-full" />
            <span className="text-xs leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-h_red/20 bg-h_red/5 rounded-xl border-l-2 px-4 py-3">
      <p className="text-sm leading-relaxed text-gray-400">{children}</p>
    </div>
  );
}
