"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Handshake,
  Users,
  CalendarHeart,
  SlidersHorizontal,
  KeyRound,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/organizer/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/organizer/gigs",
    label: "My Gigs",
    icon: Briefcase,
    exact: false,
  },
  {
    href: "/organizer/bookings",
    label: "Bookings",
    icon: Handshake,
    exact: false,
  },
  {
    href: "/organizer/followed-djs",
    label: "Followed DJs",
    icon: Users,
    exact: false,
  },
  {
    href: "/organizer/saved-events",
    label: "Saved Events",
    icon: CalendarHeart,
    exact: false,
  },
  {
    href: "/organizer/settings",
    label: "Profile Settings",
    icon: SlidersHorizontal,
    exact: false,
  },
  {
    href: "/organizer/notifications",
    label: "Notifications",
    icon: Bell,
    exact: false,
  },
  {
    href: "/organizer/account",
    label: "Account Settings",
    icon: KeyRound,
    exact: false,
  },
] as const;

export default function OrganizerNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Organizer navigation"
      className="flex shrink-0 flex-row gap-1 overflow-x-auto pb-1 md:w-52 md:flex-col md:pb-0"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
