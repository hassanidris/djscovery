import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { NavigationProgress } from "@/components/NavigationProgress";
import { cn } from "@/lib/utils";
import CookieBanner from "@/components/CookieBanner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { indexingEnabled } from "@/lib/seo/indexing";
import PublicShell from "@/components/PublicShell";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNavServer from "@/components/MobileBottomNavServer";
import { isComingSoonRoute } from "@/lib/coming-soon";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: {
    default: "DJcovery — Where DJs Get Discovered",
    template: "%s | DJcovery",
  },
  description:
    "The marketplace for DJ bookings and gig opportunities. Discover top DJs by genre and city, post open gigs, and connect with talent built for events that move people.",
  openGraph: {
    siteName: "DJcovery",
    type: "website",
    locale: "en_US",
    title: "DJcovery — Where DJs Get Discovered",
    description:
      "The marketplace for DJ bookings and gig opportunities. Discover top DJs by genre and city, post open gigs, and connect with talent built for events that move people.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DJcovery — Where DJs Get Discovered",
    description:
      "The marketplace for DJ bookings and gig opportunities. Discover top DJs by genre and city, post open gigs, and connect with talent built for events that move people.",
  },

  // the below for no-indexing
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://djcovery.com",
  ),
  robots: indexingEnabled
    ? {
        index: true,
        follow: true,
      }
    : {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
          noimageindex: true,
        },
      },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isComingSoon = await isComingSoonRoute();

  return (
    <html
      lang="en"
      className={cn(inter.variable, sora.variable, "font-sans", "dark")}
    >
      <body className={inter.className}>
        {isComingSoon ? (
          children
        ) : (
          <>
            <NavigationProgress />
            <PublicShell
              navbar={<Navbar />}
              footer={<Footer />}
              mobileNav={<MobileBottomNavServer />}
            >
              {children}
            </PublicShell>
            <Toaster
              position="bottom-right"
              theme="dark"
              richColors
              closeButton
              offset={{ bottom: 80 }}
            />
            <CookieBanner />
          </>
        )}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
