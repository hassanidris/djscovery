import type { Metadata } from "next";
import { Russo_One, Space_Grotesk, Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNavServer from "@/components/MobileBottomNavServer";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const russoOne = Russo_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-russo-one",
});

export const metadata: Metadata = {
  title: "DJscovery || DJs Directory App",
  description:
    "DJscovery is your go-to hub for showcasing your talent and connecting with fans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        spaceGrotesk.variable,
        russoOne.variable,
        "font-sans",
        geist.variable,
        "dark",
      )}
    >
      <body className={spaceGrotesk.className}>
        <div className="flex flex-col min-h-screen">
          <header className="w-full bg-black/95 backdrop-blur-sm border-b border-white/5 fixed top-0 inset-x-0 z-50">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <Navbar />
            </div>
          </header>
          <main className="w-full flex-1 bg-black mt-14 md:mt-16 pb-20 md:pb-0">
            {children}
          </main>
          <div className="w-full hidden md:block">
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
