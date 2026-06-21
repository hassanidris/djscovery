"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Disc3, Building2, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_ITEMS = [
  { href: "/settings/account", label: "Account", icon: User, role: "all" },
  {
    href: "/settings/notifications",
    label: "Notifications",
    icon: Bell,
    role: "all",
  },
  { href: "/settings/dj", label: "DJ Profile", icon: Disc3, role: "dj" },
  {
    href: "/settings/organizer",
    label: "Organizer",
    icon: Building2,
    role: "organizer",
  },
] as const;

export default function SettingsSidebar({
  isDj,
  isOrganizer,
}: {
  isDj: boolean;
  isOrganizer: boolean;
}) {
  const pathname = usePathname();

  const visible = ALL_ITEMS.filter((item) => {
    if (item.role === "dj") return isDj;
    if (item.role === "organizer") return isOrganizer;
    return true;
  });

  return (
    <nav
      aria-label="Settings navigation"
      className="flex shrink-0 flex-row gap-1 overflow-x-auto pb-1 md:w-52 md:flex-col md:pb-0"
    >
      {visible.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
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
