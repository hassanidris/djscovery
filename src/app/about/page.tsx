import type { Metadata } from "next";
import Link from "next/link";
import {
  Headphones,
  Users,
  Music2,
  MapPin,
  Star,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About DJcovery",
  description:
    "Learn about DJcovery — the professional platform connecting DJs with event organizers and music fans around the world.",
};

export const revalidate = 86400; // Cache for 24 hours

const toc = [
  { id: "what-we-do", label: "What We Do" },
  { id: "why-we-built", label: "Why We Built DJcovery" },
  { id: "who-its-for", label: "Who DJcovery Is For" },
  { id: "our-vision", label: "Our Vision" },
  { id: "what-makes-us-different", label: "What Makes Us Different" },
  { id: "join-community", label: "Join the Community" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="bg-h_red/5 absolute top-0 left-1/2 h-150 w-200 -translate-x-1/2 -translate-y-1/3 rounded-full blur-3xl" />
        <div className="bg-h_red/3 absolute right-0 bottom-0 h-100 w-150 translate-x-1/4 translate-y-1/4 rounded-full blur-3xl" />
      </div>

      {/* Page header */}
      <div className="relative border-b border-white/5 bg-black/80 py-14 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="bg-h_red/10 border-h_red/20 flex size-10 shrink-0 items-center justify-center rounded-xl border">
                <Headphones className="text-h_red h-5 w-5" />
              </div>
              <span className="text-h_red text-xs font-semibold tracking-[0.15em] uppercase">
                About Us
              </span>
            </div>
            <h1 className="font-heading text-4xl text-white md:text-6xl">
              About <span className="text-h_red">DJcovery</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-gray-400 md:text-lg">
              A professional platform designed to help DJs get discovered, build
              their reputation, and connect with event organizers looking for
              talent.
            </p>
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
            <div className="flex flex-col gap-16">
              {/* 1 — What We Do */}
              <section id="what-we-do" className="scroll-mt-24">
                <SectionHeading
                  number={1}
                  title="Connecting DJs with Opportunities"
                />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    DJcovery is a professional platform designed to help DJs get
                    discovered, build their reputation, and connect with event
                    organizers looking for talent.
                  </p>
                  <p>
                    Whether you&apos;re an emerging DJ searching for your first
                    bookings or an experienced performer looking to expand your
                    reach, DJcovery provides a dedicated space to showcase your
                    skills, experience, music, and upcoming events.
                  </p>
                  <p>
                    At the same time, organizers can discover DJs more
                    efficiently through professional profiles, location-based
                    search, genre filters, and event history — making it easier
                    to find the right talent for every occasion.
                  </p>
                </div>
              </section>

              {/* 2 — Why We Built */}
              <section id="why-we-built" className="scroll-mt-24">
                <SectionHeading number={2} title="Why We Built DJcovery" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>Finding the right DJ can be surprisingly difficult.</p>
                  <p>
                    Many talented DJs struggle to gain visibility beyond social
                    media, while organizers often rely on personal
                    recommendations or scattered online searches when looking
                    for performers.
                  </p>
                  <p>DJcovery was created to solve this problem.</p>
                  <div className="border-h_red/20 bg-h_red/5 rounded-xl border-l-2 px-4 py-3">
                    <p className="text-sm leading-relaxed text-gray-400">
                      Our mission is to create a trusted platform where DJs can
                      build their professional presence and where organizers can
                      confidently discover and connect with the right talent.
                    </p>
                  </div>
                </div>
              </section>

              {/* 3 — Who It's For */}
              <section id="who-its-for" className="scroll-mt-24">
                <SectionHeading number={3} title="Who DJcovery Is For" />
                <div className="flex flex-col gap-6">
                  {/* Role cards */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <RoleCard
                      icon={<Music2 className="h-4 w-4" />}
                      title="DJs"
                      description="Build a professional profile that showcases:"
                      items={[
                        "Experience and biography",
                        "Music genres and specialties",
                        "Photos and media",
                        "Upcoming and past events",
                        "Reviews and reputation",
                        "Professional links and social profiles",
                      ]}
                    />
                    <RoleCard
                      icon={<Users className="h-4 w-4" />}
                      title="Event Organizers"
                      description="Discover DJs based on:"
                      items={[
                        "Location",
                        "Genre",
                        "Experience",
                        "Availability",
                        "Event history",
                        "Community reputation",
                      ]}
                    />
                    <RoleCard
                      icon={<Star className="h-4 w-4" />}
                      title="Music Fans"
                      description="Stay connected with the scene:"
                      items={[
                        "Explore DJ profiles",
                        "Follow local talent",
                        "Discover upcoming events",
                        "Stay connected with the community",
                      ]}
                    />
                  </div>
                </div>
              </section>

              {/* 4 — Our Vision */}
              <section id="our-vision" className="scroll-mt-24">
                <SectionHeading number={4} title="Our Vision" />
                <div className="flex flex-col gap-4 text-gray-400">
                  <p>
                    We believe every talented DJ deserves the opportunity to be
                    discovered.
                  </p>
                  <p>
                    Our long-term vision is to become the leading platform for
                    DJ discovery, professional networking, and event
                    opportunities — helping connect DJs, organizers, venues, and
                    music communities around the world.
                  </p>
                  <div className="mt-2 grid gap-4 sm:grid-cols-3">
                    <VisionPillar
                      icon={<Globe className="text-h_red h-5 w-5" />}
                      title="Transparency"
                      text="Open, honest profiles that build real trust between DJs and organizers."
                    />
                    <VisionPillar
                      icon={<Star className="text-h_red h-5 w-5" />}
                      title="Trust"
                      text="Community-driven reviews and reputation systems that mean something."
                    />
                    <VisionPillar
                      icon={<Zap className="text-h_red h-5 w-5" />}
                      title="Discovery"
                      text="Better tools to make finding the right DJ easier than ever before."
                    />
                  </div>
                </div>
              </section>

              {/* 5 — What Makes Us Different */}
              <section id="what-makes-us-different" className="scroll-mt-24">
                <SectionHeading
                  number={5}
                  title="What Makes DJcovery Different"
                />
                <div className="flex flex-col gap-4 text-gray-400">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      "Built specifically for DJs and music professionals",
                      "Professional profiles focused on bookings and discovery",
                      "Event-driven reputation and credibility",
                      "Location and genre-based search",
                      "Community-driven growth and visibility",
                      "Designed for both emerging and established DJs",
                    ].map((feature) => (
                      <div
                        key={feature}
                        className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/2 px-4 py-3"
                      >
                        <CheckCircle2 className="text-h_red mt-0.5 h-4 w-4 shrink-0" />
                        <span className="text-sm leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 6 — Join the Community */}
              <section id="join-community" className="scroll-mt-24">
                <SectionHeading number={6} title="Join the Community" />
                <div className="flex flex-col gap-6 text-gray-400">
                  <p>
                    Whether you&apos;re a DJ looking for new opportunities, an
                    organizer searching for talent, or a music fan exploring the
                    scene, DJcovery is here to help you connect with the people
                    and events that matter.
                  </p>
                  <p>
                    Start your journey today and become part of the growing
                    DJcovery community.
                  </p>

                  {/* CTA cards */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <CtaCard
                      icon={<Music2 className="text-h_red h-5 w-5" />}
                      title="I'm a DJ"
                      description="Showcase your talent and get booked."
                      href="/become-dj"
                      label="Create DJ Profile"
                    />
                    <CtaCard
                      icon={<Users className="text-h_red h-5 w-5" />}
                      title="I'm an Organizer"
                      description="Find the right DJ for every event."
                      href="/become-organizer"
                      label="Join as Organizer"
                    />
                    <CtaCard
                      icon={<Star className="text-h_red h-5 w-5" />}
                      title="I'm a Fan"
                      description="Discover local talent and upcoming events."
                      href="/become-fan"
                      label="Explore the Scene"
                    />
                  </div>
                </div>
              </section>

              {/* Bottom divider */}
              <div className="border-t border-white/5 pt-6">
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
    <div className="mb-6 flex items-baseline gap-3 border-b border-white/5 pb-4">
      <span className="text-h_red font-heading text-sm font-bold tabular-nums">
        {String(number).padStart(2, "0")}
      </span>
      <h2 className="font-heading text-xl text-white">{title}</h2>
    </div>
  );
}

function RoleCard({
  icon,
  title,
  description,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/2 p-5">
      <div className="flex items-center gap-2.5">
        <span className="bg-h_red/10 text-h_red flex size-7 items-center justify-center rounded-lg">
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="bg-h_red mt-1.5 h-1 w-1 shrink-0 rounded-full" />
            <span className="text-xs leading-relaxed text-gray-400">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function VisionPillar({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/2 p-5">
      <div className="bg-h_red/10 flex size-9 items-center justify-center rounded-xl">
        {icon}
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs leading-relaxed text-gray-500">{text}</p>
    </div>
  );
}

function CtaCard({
  icon,
  title,
  description,
  href,
  label,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/2 p-5 transition-colors hover:border-white/10 hover:bg-white/4"
    >
      <div className="bg-h_red/10 flex size-9 items-center justify-center rounded-xl">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          {description}
        </p>
      </div>
      <div className="text-h_red mt-auto flex items-center gap-1.5 text-xs font-semibold">
        {label}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
