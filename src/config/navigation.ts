import type { LucideIcon } from "lucide-react";
import {
  Home,
  Headphones,
  Briefcase,
  CalendarDays,
  User,
  AudioLines,
  ShieldCheck,
  Handshake,
  BarChart3,
} from "lucide-react";

export type NavRole = "guest" | "fan" | "dj" | "organizer" | "admin";

export interface NavItem {
  id: string;
  label: string;
  href: string | null;
  icon: LucideIcon;
  comingSoon?: boolean;
}

const home: NavItem = { id: "home", label: "Home", href: "/", icon: Home };

const directory: NavItem = {
  id: "directory",
  label: "DJs",
  href: "/directory",
  icon: AudioLines,
};

const djGigs: NavItem = {
  id: "gigs",
  label: "Gigs",
  href: "/gigs",
  icon: Briefcase,
};

const djBookings: NavItem = {
  id: "bookings",
  label: "Bookings",
  href: "/dj/bookings",
  icon: Handshake,
};

const djAnalytics: NavItem = {
  id: "analytics",
  label: "Analytics",
  href: "/dj/analytics",
  icon: BarChart3,
};

const orgGigs: NavItem = {
  id: "gigs",
  label: "My Gigs",
  href: "/organizer/gigs",
  icon: Briefcase,
};

const orgBookings: NavItem = {
  id: "bookings",
  label: "Bookings",
  href: "/organizer/bookings",
  icon: Handshake,
};

const events: NavItem = {
  id: "events",
  label: "Events",
  href: "/events",
  icon: CalendarDays,
};

const profile: NavItem = {
  id: "profile",
  label: "Account",
  href: "/account",
  icon: User,
};

const account: NavItem = {
  id: "account",
  label: "Account",
  href: "/sign-in",
  icon: User,
};

const adminPanel: NavItem = {
  id: "admin",
  label: "Admin",
  href: "/admin",
  icon: ShieldCheck,
};

export const desktopNavByRole: Record<NavRole, NavItem[]> = {
  guest: [directory, events],
  fan: [directory, events],
  dj: [directory, djBookings, djGigs, djAnalytics, events],
  organizer: [directory, orgBookings, orgGigs, events],
  admin: [adminPanel, directory, events],
};

export const bottomNavByRole: Record<NavRole, NavItem[]> = {
  guest: [home, directory, events, account],
  fan: [home, directory, events, profile],
  dj: [home, directory, djBookings, djGigs, events, profile],
  organizer: [home, directory, orgBookings, orgGigs, events, profile],
  admin: [home, adminPanel, directory, events, profile],
};

export type FooterProfessionalLink = {
  label: string;
  href: string;
};

export function getFooterProfessionalLabel(navRole: NavRole): string {
  if (navRole === "dj" || navRole === "admin") return "DJ Hub";
  if (navRole === "organizer") return "Organizer Hub";
  if (navRole === "fan") return "Go Professional";
  return "For DJs & Organizers";
}

export function getFooterProfessionalLinks(opts: {
  navRole: NavRole;
  djSlug: string | null;
  organizerSlug: string | null;
  isOrganizer: boolean;
}): FooterProfessionalLink[] {
  const { navRole, djSlug, organizerSlug, isOrganizer } = opts;

  if (navRole === "dj" || navRole === "admin") {
    return [
      ...(djSlug ? [{ label: "My Profile", href: `/djs/${djSlug}` }] : []),
      { label: "My Bookings", href: "/dj/bookings" },
      { label: "My Gigs", href: "/gigs" },
      { label: "My Analytics", href: "/dj/analytics" },
      { label: "My Events", href: "/dj/events" },
      { label: "My Applications", href: "/dj/applications" },
      { label: "Account Settings", href: "/dj/account" },
      ...(!isOrganizer
        ? [{ label: "Become an Organizer", href: "/become-organizer" }]
        : [{ label: "Organizer Dashboard", href: "/organizer/dashboard" }]),
    ];
  }

  if (navRole === "organizer") {
    return [
      ...(organizerSlug
        ? [
            {
              label: "My Organizer Profile",
              href: `/organizers/${organizerSlug}`,
            },
          ]
        : []),
      { label: "Organizer Dashboard", href: "/organizer/dashboard" },
      { label: "My Bookings", href: "/organizer/bookings" },
      { label: "Post a Gig", href: "/organizer/gigs/new" },
      { label: "My Gigs", href: "/organizer/gigs" },
      { label: "Account Settings", href: "/organizer/account" },
      { label: "Become a DJ", href: "/become-dj" },
    ];
  }

  if (navRole === "fan") {
    return [
      { label: "MY Dashboard", href: "/fan/profile" },
      { label: "Followed DJs", href: "/fan/followed-djs" },
      { label: "Account Settings", href: "/fan/account" },
      { label: "Become a DJ", href: "/become-dj" },
      { label: "Become an Organizer", href: "/become-organizer" },
    ];
  }

  return [
    { label: "Join as DJ", href: "/sign-up?role=dj" },
    { label: "Join as Organizer", href: "/sign-up?role=organizer" },
    { label: "Create Your Profile", href: "/sign-up?role=dj" },
    { label: "Browse DJ Directory", href: "/directory" },
  ];
}
