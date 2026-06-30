import type { Metadata } from "next";
import {
  Mail,
  MessageSquare,
  Clock,
  ShieldCheck,
  Headphones,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us — DJcovery",
  description:
    "Get in touch with the DJcovery team. We're here to help with support, partnerships, press enquiries, and more.",
};

const infoCards = [
  {
    icon: Clock,
    title: "Response time",
    body: "We aim to reply within 1–2 business days.",
  },
  {
    icon: ShieldCheck,
    title: "Your privacy",
    body: "Your details are only used to respond to your enquiry.",
  },
  {
    icon: Headphones,
    title: "Support",
    body: "For account issues, include your username to speed things up.",
  },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const defaultCategory = params.category ?? "";
  let defaultName = "";
  let defaultEmail = "";

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true, email: true },
      });
      defaultName = dbUser?.name ?? "";
      defaultEmail = dbUser?.email ?? "";
    }
  } catch {
    // Not signed in — leave defaults empty
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="bg-h_red/5 absolute top-0 left-1/2 h-150 w-200 -translate-x-1/2 -translate-y-1/3 rounded-full blur-3xl" />
        <div className="bg-h_red/3 absolute right-0 bottom-0 h-100 w-150 translate-x-1/4 translate-y-1/4 rounded-full blur-3xl" />
      </div>

      {/* Page header */}
      <div className="relative border-b border-white/5 bg-black/80 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="bg-h_red/10 border-h_red/20 flex size-10 shrink-0 items-center justify-center rounded-xl border">
                <Mail className="text-h_red h-5 w-5" />
              </div>
              <span className="text-h_red text-xs font-semibold tracking-[0.15em] uppercase">
                Get in touch
              </span>
            </div>
            <h1 className="font-heading text-4xl text-white md:text-6xl">
              Contact <span className="text-h_red">Us</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-gray-400 md:text-lg">
              Have a question, a problem, or a partnership idea? Fill in the
              form and we&apos;ll get back to you as soon as we can.
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
          {/* ── Sidebar info ── */}
          <aside className="shrink-0 lg:w-72">
            <div className="sticky top-24 flex flex-col gap-4">
              {infoCards.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-2xl border border-white/5 bg-white/2 p-5"
                >
                  <div className="bg-h_red/10 flex size-9 shrink-0 items-center justify-center rounded-xl">
                    <Icon className="text-h_red h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-xs leading-relaxed text-gray-500">
                      {body}
                    </p>
                  </div>
                </div>
              ))}

              <div className="mt-2 rounded-2xl border border-white/5 bg-white/2 p-5">
                <div className="mb-3 flex items-center gap-2.5">
                  <MessageSquare className="text-h_red h-4 w-4" />
                  <p className="text-sm font-semibold text-white">
                    Common topics
                  </p>
                </div>
                <ul className="flex flex-col gap-2">
                  {[
                    "Account or login issues",
                    "DJ profile questions",
                    "Gig listing help",
                    "Reporting a user",
                    "Business partnerships",
                    "Press & media",
                  ].map((topic) => (
                    <li key={topic} className="flex items-start gap-2">
                      <span className="bg-h_red mt-1.5 h-1 w-1 shrink-0 rounded-full" />
                      <span className="text-xs leading-relaxed text-gray-400">
                        {topic}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* ── Form card ── */}
          <main className="min-w-0 flex-1">
            <div className="rounded-2xl border border-white/5 bg-white/2 p-6 md:p-8">
              <div className="mb-8 border-b border-white/5 pb-6">
                <h2 className="font-heading text-xl text-white">
                  Send us a message
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  All fields marked with{" "}
                  <span className="text-h_red font-bold">*</span> are required.
                </p>
              </div>
              <ContactForm
                defaultName={defaultName}
                defaultEmail={defaultEmail}
                defaultCategory={defaultCategory}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
