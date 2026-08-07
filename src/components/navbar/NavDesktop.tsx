"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, Search } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useIsDesktop } from "@/lib/hooks/useIsDesktop";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import NavbarAvatar from "@/components/NavbarAvatar";
import { desktopNavByRole } from "@/config/navigation";
import type { NavUserData } from "@/lib/auth/getNavUser";

export default function NavDesktop({
  navRole,
  isLoggedIn,
  isOrganizer,
  username,
  djSlug,
  organizerSlug,
  displayName,
  avatarSrc,
  initials,
}: NavUserData) {
  const pathname = usePathname();
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const items = desktopNavByRole[navRole];

  const handleDesktopSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = (new FormData(e.currentTarget).get("q") as string) ?? "";
    if (q.trim()) router.push(`/directory?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="hidden h-16 items-center gap-5 md:flex" role="banner">
      {/* Logo */}
      <Link
        href="/"
        aria-label="DJcovery — Go to home"
        className="focus-visible:ring-h_red shrink-0 rounded-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        <div className="flex items-center gap-1.5 py-1">
          <Image
            src="/dj_logo-new.svg"
            alt="DJcovery Logo"
            width={130}
            height={31}
            priority
          />
          {/* <span className="font-heading text-2xl leading-none tracking-tight text-white">
            <span className="font-bold">DJ</span>
            <span className="font-semibold">scovery</span>
          </span> */}
        </div>
      </Link>

      {/* Primary Navigation */}
      <nav
        className="mt-2 flex flex-1 items-center gap-0.5"
        aria-label="Primary navigation"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.href
            ? item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
            : false;

          if (item.comingSoon || !item.href) {
            return (
              <span
                key={item.id}
                className="relative flex cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 select-none"
                aria-disabled="true"
                title={`${item.label} — Coming Soon`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span>{item.label}</span>
                <span className="text-h_red/80/60 bg-h_red/10 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold tracking-wider uppercase">
                  Soon
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "focus-visible:ring-h_red relative flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-all duration-150 focus-visible:ring-2 focus-visible:outline-none",
                isActive
                  ? "text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-h_red/80" : "",
                )}
                aria-hidden
              />
              <span>{item.label}</span>
              {isActive && (
                <span
                  className="bg-h_red absolute right-3 bottom-0 left-3 h-0.5 rounded-full"
                  aria-hidden
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Right section: Search + Auth */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Compact inline search */}
        <form
          onSubmit={handleDesktopSearch}
          role="search"
          aria-label="Search DJcovery"
          className="focus-within:ring-h_red/50 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 ring-1 ring-white/8 transition-all"
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
          <input
            name="q"
            type="search"
            placeholder="Search DJs, genres..."
            className="w-28 bg-transparent text-sm text-white outline-none placeholder:text-gray-400 lg:w-36"
            aria-label="Search"
          />
        </form>

        {isLoggedIn ? (
          <div className="flex items-center gap-0.5">
            {isDesktop && <NotificationBell />}
            <button
              aria-label="Messages — Coming Soon"
              title="Messages — Coming Soon"
              disabled
              aria-disabled="true"
              className="flex size-9 cursor-not-allowed items-center justify-center rounded-full text-gray-400 opacity-70 focus-visible:outline-none"
            >
              <MessageCircle className="h-4.5 w-4.5" aria-hidden />
            </button>
            <div className="ml-1">
              <NavbarAvatar
                avatarSrc={avatarSrc}
                displayName={displayName}
                initials={initials}
                username={username}
                navRole={navRole}
                djSlug={djSlug}
                organizerSlug={organizerSlug}
                isOrganizer={isOrganizer}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-h_red/60 text-h_red/80 hover:bg-h_red/15 hover:text-h_red/80 hover:border-h_red transition-all"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-h_red hover:bg-h_redDark font-semibold text-white transition-all"
            >
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
