"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Disc3,
  Building2,
  Briefcase,
  Flag,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
  { href: "/admin/djs", label: "DJs", icon: Disc3, exact: false },
  {
    href: "/admin/organizers",
    label: "Organizers",
    icon: Building2,
    exact: false,
  },
  { href: "/admin/gigs", label: "Gigs", icon: Briefcase, exact: false },
  { href: "/admin/reports", label: "Reports", icon: Flag, exact: false },
] as const;

function NavLinks({
  openReportCount,
  onNavigate,
}: {
  openReportCount: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        const showBadge = item.href === "/admin/reports" && openReportCount > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-h_red/10 text-h_red border-h_red/20 border"
                : "border border-transparent text-gray-400 hover:bg-white/5 hover:text-white",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1">{item.label}</span>
            {showBadge && (
              <Badge className="bg-h_red/20 text-h_red border-h_red/30 border px-1.5 py-0 text-xs">
                {openReportCount > 99 ? "99+" : openReportCount}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarHeader() {
  return (
    <div className="mb-6 flex items-center gap-2.5 px-1">
      <div className="bg-h_red/10 border-h_red/20 flex h-8 w-8 items-center justify-center rounded-lg border">
        <ShieldCheck className="text-h_red h-4 w-4" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">Admin Panel</p>
        <p className="text-muted-foreground text-xs">DJscovery</p>
      </div>
    </div>
  );
}

export default function AdminSidebar({
  openReportCount,
}: {
  openReportCount: number;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-20 rounded-xl border border-white/8 bg-white/3 p-4">
          <SidebarHeader />
          <NavLinks openReportCount={openReportCount} />
        </div>
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────── */}
      <div className="mb-4 flex items-center gap-3 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              aria-label="Open admin menu"
            >
              {mobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-64 border-white/10 bg-black p-6"
          >
            <SidebarHeader />
            <NavLinks
              openReportCount={openReportCount}
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <span className="text-sm font-medium text-white">Admin Panel</span>
      </div>
    </>
  );
}
