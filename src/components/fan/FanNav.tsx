"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarHeart,
  Star,
  SlidersHorizontal,
  KeyRound,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/fan/profile",
    label: "Overview",
    icon: LayoutDashboard,
    exact: false,
  },
  {
    href: "/fan/followed-djs",
    label: "Followed DJs",
    icon: Users,
    exact: false,
  },
  {
    href: "/fan/saved-events",
    label: "Saved Events",
    icon: CalendarHeart,
    exact: false,
  },
  {
    href: "/fan/reviews",
    label: "My Reviews",
    icon: Star,
    exact: false,
  },
  {
    href: "/fan/settings",
    label: "Profile Settings",
    icon: SlidersHorizontal,
    exact: false,
  },
  {
    href: "/fan/notifications",
    label: "Notifications",
    icon: Bell,
    exact: false,
  },
  {
    href: "/fan/account",
    label: "Account Settings",
    icon: KeyRound,
    exact: false,
  },
] as const;

export default function FanNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Fan navigation"
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
