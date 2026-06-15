import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNavServer from "@/components/MobileBottomNavServer";
import { Toaster } from "@/components/ui/sonner";
import { NavigationProgress } from "@/components/NavigationProgress";
import { cn } from "@/lib/utils";

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
    default: "DJscovery — Where DJs Get Discovered",
    template: "%s | DJscovery",
  },
  description:
    "The marketplace for DJ bookings and gig opportunities. Discover top DJs by genre and city, post open gigs, and connect with talent built for events that move people.",
  openGraph: {
    siteName: "DJscovery",
    type: "website",
    locale: "en_US",
    title: "DJscovery — Where DJs Get Discovered",
    description:
      "The marketplace for DJ bookings and gig opportunities. Discover top DJs by genre and city, post open gigs, and connect with talent built for events that move people.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DJscovery — Where DJs Get Discovered",
    description:
      "The marketplace for DJ bookings and gig opportunities. Discover top DJs by genre and city, post open gigs, and connect with talent built for events that move people.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(inter.variable, sora.variable, "font-sans", "dark")}
    >
      <body className={inter.className}>
        <NavigationProgress />
        <div className="flex min-h-screen flex-col">
          <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-white/5 bg-black/95 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
              <Navbar />
            </div>
          </header>
          <main className="mt-14 w-full flex-1 bg-black pb-20 md:mt-16 md:pb-0">
            {children}
          </main>
          <div className="hidden w-full md:block">
            <Footer />
          </div>
          <MobileBottomNavServer />
        </div>
        <Toaster
          position="bottom-right"
          theme="dark"
          richColors
          closeButton
          offset={{ bottom: 80 }}
        />
      </body>
    </html>
  );
}
