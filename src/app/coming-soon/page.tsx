import type { Metadata } from "next";
import Image from "next/image";
import {
  Headphones,
  Users,
  Music2,
  Star,
  Sparkles,
  Zap,
  Globe,
  ArrowRight,
  Mic,
  TrendingUp,
  Shield,
  Target,
  Brain,
  FileText,
  Rocket,
} from "lucide-react";

export const metadata: Metadata = {
  title: "DJcovery — Where DJs Get Discovered",
  description:
    "DJcovery connects DJs with event organizers and music fans. Build your profile, showcase your work, and find opportunities in the music scene.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 86400; // Cache for 24 hours

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative border-b border-white/5 bg-black/80 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-8">
              <Image
                src="/dj_logo-new.svg"
                alt="DJcovery Logo"
                width={180}
                height={44}
                priority
              />
            </div>
            <div className="mb-8 flex items-center gap-3">
              <div className="bg-h_red/10 border-h_red/20 flex size-12 items-center justify-center rounded-xl border">
                <Headphones className="text-h_redLight h-6 w-6" />
              </div>
              <span className="text-h_redLight text-sm font-semibold tracking-[0.15em] uppercase">
                Coming Soon
              </span>
            </div>

            <h1 className="font-heading max-w-4xl text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
              A Better Way for DJs to Get Discovered
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-400 md:text-xl">
              DJcovery connects DJs with event organizers and music fans. Build
              your profile, showcase your work, and find opportunities in the
              music scene.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Target className="text-h_redLight h-4 w-4" />
              <span className="text-sm font-medium text-gray-300">
                The Problem We&apos;re Solving
              </span>
            </div>
            <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
              Finding the Right DJ Shouldn&apos;t Be Hard
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-400">
              Organizers spend hours searching social media. DJs have trouble
              getting noticed outside their local scene. Fans miss out on
              discovering new talent. We&apos;re fixing that.
            </p>
          </div>
        </div>
      </section>

      {/* What DJcovery Does */}
      <section className="relative border-y border-white/5 bg-white/2 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-16 text-center">
            <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
              What DJcovery Does
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              A platform for DJs, organizers, and music fans
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* For DJs */}
            <FeatureCard
              icon={<Music2 className="h-6 w-6" />}
              title="For DJs"
              description="Build a profile that gets you booked"
              items={[
                "Showcase your experience, genres, and event history",
                "Get discovered through location and genre search",
                "Build your reputation with reviews from real performances",
                "Find gigs and connect with organizers",
              ]}
            />

            {/* For Organizers */}
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="For Organizers"
              description="Find the right DJ for your event"
              items={[
                "See event history and reviews before booking",
                "Post gigs and connect with available DJs",
                "Make decisions based on real feedback",
                "Search by location, genre, and experience",
              ]}
            />

            {/* For Fans */}
            <FeatureCard
              icon={<Star className="h-6 w-6" />}
              title="For Fans"
              description="Discover DJs and events in your area"
              items={[
                "Follow local talent and track their upcoming shows",
                "Find events that match your taste",
                "Stay connected with the music scene",
                "Support your favorite DJs",
              ]}
            />
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <Sparkles className="text-h_redLight h-4 w-4" />
            <span className="text-sm font-medium text-gray-300">
              What Makes Us Different
            </span>
          </div>
          <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
            Built for the DJ Industry
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-400">
            We built DJcovery specifically for DJs and music professionals. Our
            reputation system is based on real performances, not online chatter.
            We focus on transparency and helping talented DJs get noticed.
          </p>

          <div className="mt-8 space-y-4">
            <Differentiator
              icon={<Shield className="h-5 w-5" />}
              title="Real Performance Reviews"
              description="Reviews from actual events, not just online profiles"
            />
            <Differentiator
              icon={<Globe className="h-5 w-5" />}
              title="DJ-Focused Platform"
              description="Built specifically for DJs and music professionals"
            />
            <Differentiator
              icon={<Zap className="h-5 w-5" />}
              title="Smart Search"
              description="Find DJs by location, genre, and availability"
            />
          </div>
        </div>
      </section>

      {/* Founding DJ Program */}
      <section className="from-h_red/5 relative border-y border-white/5 bg-linear-to-b to-transparent py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <div className="border-h_red/30 bg-h_red/10 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2">
            <Rocket className="text-h_redLight h-4 w-4" />
            <span className="text-h_redLight text-sm font-medium">
              Limited Opportunity
            </span>
          </div>
          <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
            Founding DJ Program
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-400">
            We&apos;re launching with a founding DJ program for early adopters.
            Founding DJs get premium visibility, early access to new features,
            and help shape the platform&apos;s future.
          </p>
          <p className="text-h_redLight mt-4 text-lg font-semibold">
            Limited spots available.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <BenefitCard
              icon={<TrendingUp className="h-5 w-5" />}
              title="Premium Visibility"
              description="Featured placement in search results and homepage"
            />
            <BenefitCard
              icon={<Sparkles className="h-5 w-5" />}
              title="Early Access"
              description="Be the first to try new features before anyone else"
            />
            <BenefitCard
              icon={<Mic className="h-5 w-5" />}
              title="Shape the Future"
              description="Direct influence on platform development and features"
            />
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-16 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Brain className="text-h_redLight h-4 w-4" />
              <span className="text-sm font-medium text-gray-300">
                The Future — AI-Powered DJ Experiences
              </span>
            </div>
            <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
              AI Features Coming Soon
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              New tools to help DJs and organizers work better together
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* AI DJ Persona Simulator */}
            <AIFeatureCard
              icon={<Mic className="h-6 w-6" />}
              title="AI DJ Persona Simulator"
              description="Preview how a DJ would sound at your event before booking them."
              features={[
                "Upload event details and get personalized previews",
                "See how different DJs would fit your event",
                "Try before you book",
              ]}
              accent="purple"
            />

            {/* DJ AI Event Recap */}
            <AIFeatureCard
              icon={<FileText className="h-6 w-6" />}
              title="DJ AI Event Recap"
              description="Automatically generate post-event summaries for DJs and organizers."
              features={[
                "Track performance highlights and event details",
                "Create shareable recaps after each show",
                "Keep a record of your best performances",
              ]}
              accent="blue"
            />
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="relative border-y border-white/5 bg-white/2 py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <TrendingUp className="text-h_redLight h-4 w-4" />
            <span className="text-sm font-medium text-gray-300">
              Our Vision
            </span>
          </div>
          <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
            Every DJ Deserves to Be Discovered
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-gray-400">
            Every event needs the right DJ. Every fan wants to find their sound.
            DJcovery connects the DJ ecosystem in a way that actually works.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
          <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            DJcovery — Connecting DJs, organizers, and fans.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-8">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} DJcovery. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
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
    <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/2 p-6 transition-colors hover:border-white/20">
      <div className="flex items-center gap-3">
        <div className="bg-h_red/10 text-h_redLight flex size-10 items-center justify-center rounded-xl">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <div className="bg-h_red mt-1.5 h-1 w-1 shrink-0 rounded-full" />
            <span className="text-sm leading-relaxed text-gray-400">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Differentiator({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/2 p-4">
      <div className="bg-h_red/10 text-h_redLight flex size-10 shrink-0 items-center justify-center rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function AIFeatureCard({
  icon,
  title,
  description,
  features,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  accent: "purple" | "blue";
}) {
  const accentColors = {
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/2 p-6 transition-colors hover:border-white/20">
      <div className="flex items-center gap-3">
        <div
          className={`flex size-10 items-center justify-center rounded-xl border ${accentColors[accent]}`}
        >
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
      <ul className="flex flex-col gap-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Sparkles className="text-h_redLight mt-0.5 h-4 w-4 shrink-0" />
            <span className="text-sm leading-relaxed text-gray-400">
              {feature}
            </span>
          </li>
        ))}
      </ul>
      <div className="text-h_redLight mt-auto flex items-center gap-2 text-sm font-semibold">
        <span>Coming Soon</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  );
}

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/2 p-5">
      <div className="bg-h_red/10 text-h_redLight flex size-10 items-center justify-center rounded-lg">
        {icon}
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs leading-relaxed text-gray-400">{description}</p>
    </div>
  );
}
