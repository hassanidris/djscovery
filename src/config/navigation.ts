import type { LucideIcon } from "lucide-react";
import {
  Home,
  Headphones,
  Briefcase,
  CalendarDays,
  User,
  AudioLines,
  ShieldCheck,
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
  href: "/dashboard/dj/gigs",
  icon: Briefcase,
};

const orgGigs: NavItem = {
  id: "gigs",
  label: "My Gigs",
  href: "/dashboard/organizer/gigs",
  icon: Briefcase,
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
  dj: [directory, djGigs, events],
  organizer: [directory, orgGigs, events],
  admin: [adminPanel, directory, events],
};

export const bottomNavByRole: Record<NavRole, NavItem[]> = {
  guest: [home, directory, events, account],
  fan: [home, directory, events, profile],
  dj: [home, directory, djGigs, events, profile],
  organizer: [home, directory, orgGigs, events, profile],
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
      ...(djSlug ? [{ label: "My DJ Profile", href: `/djs/${djSlug}` }] : []),
      { label: "My Gigs", href: "/dashboard/dj/gigs" },
      { label: "My Events", href: "/dashboard/dj/events" },
      { label: "Applications", href: "/dashboard/dj/applications" },
      { label: "Settings", href: "/settings/account" },
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
      { label: "Post a Gig", href: "/dashboard/organizer/gigs/new" },
      { label: "My Gigs", href: "/dashboard/organizer/gigs" },
      { label: "Become a DJ", href: "/become-dj" },
    ];
  }

  if (navRole === "fan") {
    return [
      { label: "My Account", href: "/account" },
      { label: "Followed DJs", href: "/account/followed-djs" },
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
