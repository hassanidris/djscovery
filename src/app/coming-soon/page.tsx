import type { Metadata } from "next";
import Image from "next/image";
import ComingSoonShell from "@/components/coming-soon/ComingSoonShell";

export const metadata: Metadata = {
  title: "Coming Soon | DJcovery",
  description:
    "DJcovery is getting a brand new home. Stay tuned for something special.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 86400; // Cache for 24 hours

export default function ComingSoonPage() {
  return (
    <ComingSoonShell>
      <div className="flex flex-col items-center justify-center text-center">
        <Image
          src="/dj_logo-new.svg"
          alt="DJcovery"
          width={180}
          height={44}
          priority
          className="mb-8"
        />
        <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          Coming Soon
        </h1>
        <p className="mt-4 max-w-md text-lg text-gray-400">
          DJcovery is getting a brand new home. We&apos;re putting the finishing
          touches on something special for DJs and event organizers.
        </p>
        <div className="mt-10 flex items-center gap-2 text-sm text-gray-500">
          <span className="bg-h_red inline-block h-2 w-2 animate-pulse rounded-full" />
          Stay tuned
        </div>
      </div>
    </ComingSoonShell>
  );
}
