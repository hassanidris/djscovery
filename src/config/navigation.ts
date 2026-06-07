import type { LucideIcon } from "lucide-react";
import {
  Home,
  Headphones,
  Briefcase,
  CalendarDays,
  Users,
  User,
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
  label: "Directory",
  href: "/directory",
  icon: Headphones,
};

const gigs: NavItem = {
  id: "gigs",
  label: "Gigs",
  href: null,
  icon: Briefcase,
  comingSoon: true,
};

const events: NavItem = {
  id: "events",
  label: "Events",
  href: null,
  icon: CalendarDays,
  comingSoon: true,
};

const community: NavItem = {
  id: "community",
  label: "Community",
  href: "/community",
  icon: Users,
};

const profile: NavItem = {
  id: "profile",
  label: "Profile",
  href: "/profile",
  icon: User,
};

const account: NavItem = {
  id: "account",
  label: "Account",
  href: "/sign-in",
  icon: User,
};

export const desktopNavByRole: Record<NavRole, NavItem[]> = {
  guest: [directory, events, community],
  fan: [directory, events, community],
  dj: [directory, gigs, events, community],
  organizer: [directory, events, community],
  admin: [directory, gigs, events, community],
};

export const bottomNavByRole: Record<NavRole, NavItem[]> = {
  guest: [home, directory, events, account],
  fan: [home, directory, events, profile],
  dj: [home, directory, gigs, events, profile],
  organizer: [home, directory, events, profile],
  admin: [home, directory, gigs, events, profile],
};
