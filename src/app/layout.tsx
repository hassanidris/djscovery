import type { Metadata } from "next";
import { Inter, Rozha_One, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

const rozhaOne = Rozha_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-rozha-one",
});

// Rozha One

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
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} ${rozhaOne.variable} ${robotoMono.variable}`}
      >
        <body className={inter.className}>
          <div className=" flex flex-col min-h-[100vh]">
            <div className="w-full bg-white px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
              <Navbar />
            </div>
            <div className=" bg-slate-100 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
              {children}
            </div>
            <div className="w-full bg-white px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 text-center py-3">
              <Footer />
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
