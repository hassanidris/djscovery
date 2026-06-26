"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/account/settings", label: "Account Settings", icon: Settings },
] as const;

export default function AccountTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account navigation"
      className="flex gap-1 overflow-x-auto border-b border-white/10 pb-0"
    >
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "border-white text-white"
                : "border-transparent text-gray-400 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
