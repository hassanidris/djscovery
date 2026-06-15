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
  dj: [directory, djGigs, events, community],
  organizer: [directory, orgGigs, events, community],
  admin: [directory, djGigs, events, community],
};

export const bottomNavByRole: Record<NavRole, NavItem[]> = {
  guest: [home, directory, events, account],
  fan: [home, directory, events, profile],
  dj: [home, directory, djGigs, events, profile],
  organizer: [home, directory, orgGigs, events, profile],
  admin: [home, directory, djGigs, events, profile],
};
