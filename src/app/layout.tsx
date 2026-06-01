import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans, Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
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
        dmSans.variable,
        bebasNeue.variable,
        "font-sans",
        geist.variable,
        "dark",
      )}
    >
      <body className={dmSans.className}>
        <div className=" flex flex-col min-h-[100vh]">
          <div className="w-full bg-black px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 fixed z-50">
            <Navbar />
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
