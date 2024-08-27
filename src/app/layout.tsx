import type { Metadata } from "next";
import { Inter, Rozha_One, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";

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
  title: "Lama Dev Social Media App",
  description: "Social media app built with Next.js",
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
          <div className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 z-30">
            <Navbar />
          </div>
          <div className=" text-white">{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}
