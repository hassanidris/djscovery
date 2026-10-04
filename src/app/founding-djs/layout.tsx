import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Founding DJs Program | DJcovery",
  description:
    "Join the first 100 founding DJs on DJcovery. Get 12 months of premium, priority discovery, and a permanent founding badge.",
};

export default function FoundingDJsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="mb-8 flex items-center justify-center py-8">
        <Link href="/founding-djs">
          <Image
            src="/dj_logo-new.svg"
            alt="DJcovery"
            width={120}
            height={48}
            className="h-12 w-auto"
          />
        </Link>
      </div>
      {children}
      <div className="mt-16 flex items-center justify-center gap-6 text-sm text-gray-400">
        <Link
          href="/founding-djs"
          className="transition-colors hover:text-white"
        >
          Home
        </Link>
        <Link
          href="/founding-djs/status"
          className="transition-colors hover:text-white"
        >
          Check Status
        </Link>
        <a
          href="mailto:support@djscovery.com"
          className="transition-colors hover:text-white"
        >
          Support
        </a>
      </div>
      <Toaster
        position="bottom-right"
        theme="dark"
        richColors
        closeButton
        offset={{ bottom: 80 }}
      />
    </>
  );
}
