import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faSoundcloud,
  faYoutube,
  faTiktok,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import {
  faHeadphones,
  faCompactDisc,
  faUsers,
  faCalendarDays,
  faMicrophone,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

const footerLinks = {
  explore: [
    { label: "Home", href: "/", icon: faHeadphones },
    { label: "DJ Directory", href: "/directory", icon: faCompactDisc },
    { label: "Community", href: "/community", icon: faUsers },
    { label: "Events", href: "/community", icon: faCalendarDays },
  ],
  forDJs: [
    { label: "Join as DJ", href: "/sign-up?role=dj" },
    { label: "Join as Organiser", href: "/sign-up?role=organiser" },
    { label: "Create Your Profile", href: "/sign-up?role=dj" },
    { label: "Browse DJ Events", href: "/community" },
    { label: "DJ Resources", href: "/directory" },
  ],
  company: [
    { label: "About DJscovery", href: "/" },
    { label: "Contact Us", href: "/" },
    { label: "Privacy Policy", href: "/" },
    { label: "Terms of Service", href: "/" },
    { label: "Cookie Policy", href: "/" },
  ],
};

const socialLinks = [
  { icon: faXTwitter, href: "#", label: "X (Twitter)" },
  { icon: faInstagram, href: "#", label: "Instagram" },
  { icon: faTiktok, href: "#", label: "TikTok" },
  { icon: faSoundcloud, href: "#", label: "SoundCloud" },
  { icon: faYoutube, href: "#", label: "YouTube" },
];

const Footer = () => {
  return (
    <footer className="w-full bg-black border-t border-white/5">
      {/* Top accent bar */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-h_purple/40 to-transparent" />

      {/* Main footer body */}
      <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* ── Brand column ── */}
          <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block w-fit">
              <Image
                src="/dj-logo.svg"
                alt="DJscovery"
                width={130}
                height={110}
                className="brightness-110"
              />
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed max-w-65">
              The world&apos;s first &amp; largest DJ community. Discover
              talent, connect with fans, and find your perfect DJ.
            </p>

            {/* Newsletter mini-CTA */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 flex items-center gap-2 bg-h_blackLight/60 ring-1 ring-white/10 rounded-lg px-3 py-2.5">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="h-3.5 w-3.5 text-gray-500 shrink-0"
                />
                <input
                  type="email"
                  placeholder="Your email…"
                  className="bg-transparent text-sm text-white placeholder:text-gray-500 outline-none w-full"
                />
              </div>
              <button className="shrink-0 px-3 py-2.5 rounded-lg bg-h_purple hover:bg-h_purpleDark text-black text-xs font-semibold transition-colors">
                Subscribe
              </button>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2.5 mt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="size-9 flex items-center justify-center rounded-full bg-h_blackLight/60 ring-1 ring-white/10 text-gray-400 hover:bg-h_purple hover:text-black hover:ring-h_purple transition-all"
                >
                  <FontAwesomeIcon icon={social.icon} className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Explore ── */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white text-xs font-semibold uppercase tracking-[0.15em]">
              Explore
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.explore.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2.5 text-gray-400 text-sm hover:text-h_purple transition-colors group"
                  >
                    <FontAwesomeIcon
                      icon={link.icon}
                      className="h-3.5 w-3.5 text-h_purpleDark group-hover:text-h_purple transition-colors"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── For DJs & Organisers ── */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white text-xs font-semibold uppercase tracking-[0.15em]">
              For DJs &amp; Organisers
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.forDJs.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2.5 text-gray-400 text-sm hover:text-h_purple transition-colors group"
                  >
                    <FontAwesomeIcon
                      icon={faMicrophone}
                      className="h-3.5 w-3.5 text-h_purpleDark group-hover:text-h_purple transition-colors"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Company ── */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white text-xs font-semibold uppercase tracking-[0.15em]">
              Company
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-h_purple transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* App badge placeholder */}
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-gray-600 text-xs uppercase tracking-widest">
                Coming soon
              </p>
              <div className="flex gap-2">
                <div className="px-3 py-1.5 rounded-md bg-h_blackLight/60 ring-1 ring-white/10 text-gray-500 text-xs font-medium">
                  App Store
                </div>
                <div className="px-3 py-1.5 rounded-md bg-h_blackLight/60 ring-1 ring-white/10 text-gray-500 text-xs font-medium">
                  Google Play
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>
            &copy; {new Date().getFullYear()} DJscovery. All rights reserved.
            Built for the culture.
          </span>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-h_purple transition-colors">
              Privacy
            </Link>
            <span className="text-white/10">|</span>
            <Link href="/" className="hover:text-h_purple transition-colors">
              Terms
            </Link>
            <span className="text-white/10">|</span>
            <Link href="/" className="hover:text-h_purple transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
