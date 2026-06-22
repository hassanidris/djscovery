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
import { House, Mic, Mail } from "lucide-react";
import { getNavUser } from "@/lib/auth/getNavUser";
import {
  desktopNavByRole,
  getFooterProfessionalLabel,
  getFooterProfessionalLinks,
  type NavRole,
} from "@/config/navigation";

const companyLinks = [
  { label: "About DJcovery", href: "/" },
  { label: "Contact Us", href: "/" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Cookie Policy", href: "/" },
];

const socialLinks = [
  { icon: faXTwitter, href: "#", label: "X (Twitter)" },
  { icon: faInstagram, href: "#", label: "Instagram" },
  { icon: faTiktok, href: "#", label: "TikTok" },
  { icon: faSoundcloud, href: "#", label: "SoundCloud" },
  { icon: faYoutube, href: "#", label: "YouTube" },
];

const Footer = async () => {
  let navData: {
    navRole: NavRole;
    djSlug: string | null;
    organizerSlug: string | null;
    isOrganizer: boolean;
  } = {
    navRole: "guest",
    djSlug: null,
    organizerSlug: null,
    isOrganizer: false,
  };
  try {
    const user = await getNavUser();
    navData = {
      navRole: user.navRole,
      djSlug: user.djSlug,
      organizerSlug: user.organizerSlug,
      isOrganizer: user.isOrganizer,
    };
  } catch {
    // keep guest defaults
  }
  const exploreItems = [
    { id: "home", label: "Home", href: "/", icon: House },
    ...desktopNavByRole[navData.navRole],
  ];
  const professionalLinks = getFooterProfessionalLinks(navData);
  const professionalLabel = getFooterProfessionalLabel(navData.navRole);
  return (
    <footer className="w-full border-t border-white/5 bg-black">
      {/* Top accent bar */}
      <div className="via-h_red/40 h-px w-full bg-linear-to-r from-transparent to-transparent" />

      {/* Main footer body */}
      <div className="py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-14">
            {/* ── Brand column ── */}
            <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-2">
              {/* <Link href="/" className="inline-block w-fit">
                <Image
                  src="/dj-logo-blue.svg"
                  alt="DJcovery"
                  width={130}
                  height={110}
                  className="brightness-110"
                />
              </Link> */}

              <Link
                href="/"
                aria-label="DJcovery — Go to home"
                className="focus-visible:ring-h_red shrink-0 rounded-sm focus-visible:ring-2 focus-visible:outline-none"
              >
                <div className="flex flex-col items-start gap-0.5 py-1">
                  <Image
                    src="/logo_v2.svg"
                    alt="DJcovery Logo"
                    width={230}
                    height={60}
                    priority
                  />
                  {/* <span className="font-heading mt-2 text-2xl leading-none tracking-tight text-white">
                    <span className="font-bold">DJ</span>
                    <span className="font-semibold">covery</span>
                  </span> */}
                  <span className="mt-3 text-base font-thin text-[#A1A1AA]">
                    The Professional Network for DJs
                  </span>
                </div>
              </Link>

              {/* <p className="max-w-65 text-sm leading-relaxed text-gray-400">
                The world&apos;s first &amp; largest DJ community. Discover
                talent, connect with fans, and find your perfect DJ.
              </p> */}

              {/* Newsletter mini-CTA */}
              <div className="mt-1 flex items-center gap-2">
                <div className="bg-h_blackLight/60 focus-within:ring-h_red flex flex-1 items-center gap-2 rounded-lg px-3 py-2.5 ring-1 ring-white/10 transition-colors">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                  <input
                    type="email"
                    aria-label="Email address for newsletter"
                    placeholder="Your email…"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                  />
                </div>
                <button className="bg-h_red hover:bg-h_redDark shrink-0 rounded-lg px-3 py-2.5 text-xs font-semibold text-white transition-colors">
                  Subscribe
                </button>
              </div>

              {/* Social icons */}
              <div className="mt-1 flex items-center gap-2.5">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="bg-h_blackLight/60 hover:bg-h_red hover:ring-h_red flex size-9 items-center justify-center rounded-full text-gray-400 ring-1 ring-white/10 transition-all hover:text-white"
                  >
                    <FontAwesomeIcon
                      icon={social.icon}
                      className="h-3.5 w-3.5"
                    />
                  </a>
                ))}
              </div>
            </div>

            {/* ── Explore ── */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-semibold tracking-[0.15em] text-white uppercase">
                Explore
              </h4>
              <ul className="flex flex-col gap-3">
                {exploreItems.map((item) => {
                  const Icon = item.icon;
                  if (item.comingSoon || !item.href) {
                    return (
                      <li
                        key={item.id}
                        className="flex items-center gap-2.5 text-sm text-gray-600 select-none"
                      >
                        <Icon className="text-h_redDark/40 h-3.5 w-3.5" />
                        {item.label}
                        <span className="text-h_red/50 bg-h_red/10 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold tracking-wider uppercase">
                          Soon
                        </span>
                      </li>
                    );
                  }
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="hover:text-h_red group flex items-center gap-2.5 text-sm text-gray-400 transition-colors"
                      >
                        <Icon className="text-h_redDark group-hover:text-h_red h-3.5 w-3.5 transition-colors" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* ── For DJs & Organizers ── */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-semibold tracking-[0.15em] text-white uppercase">
                {professionalLabel}
              </h4>
              <ul className="flex flex-col gap-3">
                {professionalLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-h_red group flex items-center gap-2.5 text-sm text-gray-400 transition-colors"
                    >
                      <Mic className="text-h_redDark group-hover:text-h_red h-3.5 w-3.5 transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Company ── */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-semibold tracking-[0.15em] text-white uppercase">
                Company
              </h4>
              <ul className="flex flex-col gap-3">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-h_red text-sm text-gray-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* App badge placeholder */}
              <div className="mt-4 flex flex-col gap-2">
                <p className="text-xs tracking-widest text-gray-600 uppercase">
                  Coming soon
                </p>
                <div className="flex gap-2">
                  <div className="bg-h_blackLight/60 rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 ring-1 ring-white/10">
                    App Store
                  </div>
                  <div className="bg-h_blackLight/60 rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 ring-1 ring-white/10">
                    Google Play
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-gray-500 sm:flex-row md:px-8">
          <span>
            &copy; {new Date().getFullYear()} DJcovery. All rights reserved.
            Built for the culture.
          </span>
          <div className="flex items-center gap-5">
            <Link
              href="/privacy-policy"
              className="hover:text-h_red transition-colors"
            >
              Privacy
            </Link>
            <span className="text-white/10">|</span>
            <Link href="/" className="hover:text-h_red transition-colors">
              Terms
            </Link>
            <span className="text-white/10">|</span>
            <Link href="/" className="hover:text-h_red transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
