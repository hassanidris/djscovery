"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Disc3,
  Building2,
  Briefcase,
  Calendar,
  Flag,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Fans", icon: Users, exact: false },
  { href: "/admin/djs", label: "DJs", icon: Disc3, exact: false },
  {
    href: "/admin/organizers",
    label: "Organizers",
    icon: Building2,
    exact: false,
  },
  { href: "/admin/gigs", label: "Gigs", icon: Briefcase, exact: false },
  { href: "/admin/events", label: "Events", icon: Calendar, exact: false },
  { href: "/admin/venues", label: "Venues", icon: MapPin, exact: false },
  {
    href: "/admin/booking-inquiries",
    label: "Booking Inquiries",
    icon: MessageSquare,
    exact: false,
  },
  { href: "/admin/reports", label: "Reports", icon: Flag, exact: false },
] as const;

function NavLinks({
  openReportCount,
  compact = false,
}: {
  openReportCount: number;
  compact?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="flex flex-col gap-1">
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
            title={item.label}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
              compact ? "h-10 w-10 justify-center p-0" : "px-3 py-2.5",
              isActive
                ? "bg-h_red/10 text-h_red border-h_red/20 border"
                : "border border-transparent text-gray-400 hover:bg-white/5 hover:text-white",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {!compact && <span className="flex-1">{item.label}</span>}
            {!compact && showBadge && (
              <Badge className="bg-h_red/20 text-h_red border-h_red/30 border px-1.5 py-0 text-xs">
                {openReportCount > 99 ? "99+" : openReportCount}
              </Badge>
            )}
            {compact && showBadge && (
              <span className="bg-h_red absolute top-1.5 right-1.5 h-2 w-2 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarLogo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Link
        href="/admin"
        className="mb-6 flex items-center justify-center"
        title="DJcovery Admin"
      >
        <Image
          src="/logo-icon.svg"
          alt="DJcovery"
          width={36}
          height={27}
          priority
        />
      </Link>
    );
  }

  return (
    <Link href="/admin" className="mb-6 flex items-center gap-2.5 px-1">
      <Image
        src="/dj_logo-new.svg"
        alt="DJcovery"
        width={130}
        height={31}
        priority
      />
    </Link>
  );
}

function SidebarHeader({ compact = false }: { compact?: boolean }) {
  if (compact) return null;
  return (
    <div className="mb-6 px-1">
      <p className="text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase">
        Admin Panel
      </p>
    </div>
  );
}

type SidebarAdmin = {
  displayName: string;
  email: string | null;
  avatarSrc: string | null;
  initials: string;
};

function SidebarFooter({
  admin,
  compact = false,
}: {
  admin: SidebarAdmin;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-3 pt-4">
        <Link href="/admin/settings" title="Settings">
          <Avatar className="h-9 w-9 border border-white/20">
            <AvatarImage
              src={admin.avatarSrc ?? undefined}
              alt={admin.displayName}
            />
            <AvatarFallback className="text-xs text-white">
              {admin.initials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 border border-white/20">
          <AvatarImage
            src={admin.avatarSrc ?? undefined}
            alt={admin.displayName}
          />
          <AvatarFallback className="text-xs text-white">
            {admin.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">
            {admin.displayName}
          </span>
          <span className="text-[11px] tracking-wide text-gray-500 uppercase">
            Super Admin
          </span>
        </div>
      </div>
      <Link
        href="/admin/settings"
        className="text-h_red hover:text-h_red/80 mt-3 inline-flex items-center text-xs font-medium transition-colors"
      >
        Manage account →
      </Link>
    </div>
  );
}

export default function AdminSidebar({
  openReportCount,
  admin,
}: {
  openReportCount: number;
  admin: SidebarAdmin;
}) {
  return (
    <>
      {/* ── Full desktop sidebar (lg+) ──────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-[#0a0d1a] lg:block">
        <div className="flex h-full flex-col border-r border-white/10 p-5">
          <div className="flex-1">
            <SidebarLogo />
            <SidebarHeader />
            <NavLinks openReportCount={openReportCount} />
          </div>
          <SidebarFooter admin={admin} />
        </div>
      </aside>

      {/* ── Collapsed icon sidebar (< lg) ─────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-16 flex-col items-center bg-[#0a0d1a] py-4 lg:hidden">
        <div className="flex h-full w-full flex-col items-center border-r border-white/10 px-2">
          <SidebarLogo compact />
          <div className="flex flex-1 flex-col items-center gap-1 pt-2">
            <NavLinks openReportCount={openReportCount} compact />
          </div>
          <SidebarFooter admin={admin} compact />
        </div>
      </aside>
    </>
  );
}
