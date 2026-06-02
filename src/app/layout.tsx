import type { Metadata } from "next";
import { Bebas_Neue, Space_Grotesk, Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
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
        bebasNeue.variable,
        "font-sans",
        geist.variable,
        "dark",
      )}
    >
      <body className={spaceGrotesk.className}>
        <div className=" flex flex-col min-h-screen">
          <div className="w-full bg-black fixed z-50">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <Navbar />
            </div>
          </div>
          <div className="w-full flex-1 bg-black  mt-24">{children}</div>
          <div className="w-full">
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
