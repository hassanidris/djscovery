"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Bell, MessageCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import NavbarAvatar from "@/components/NavbarAvatar";
import { desktopNavByRole } from "@/config/navigation";
import type { NavUserData } from "@/lib/auth/getNavUser";

export default function NavDesktop({
  navRole,
  isLoggedIn,
  username,
  displayName,
  avatarSrc,
  initials,
}: NavUserData) {
  const pathname = usePathname();
  const router = useRouter();
  const items = desktopNavByRole[navRole];

  const handleDesktopSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = (new FormData(e.currentTarget).get("q") as string) ?? "";
    if (q.trim()) router.push(`/directory?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="hidden md:flex h-16 items-center gap-4" role="banner">
      {/* Logo */}
      <Link
        href="/"
        aria-label="DJscovery — Go to home"
        className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-h_red rounded-sm"
      >
        <Image
          src="/dj-logo-blue.svg"
          alt="DJscovery"
          width={52}
          height={44}
          priority
        />
      </Link>

      {/* Primary Navigation */}
      <nav
        className="flex items-center gap-0.5 flex-1"
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
                className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 cursor-not-allowed select-none"
                aria-disabled="true"
                title={`${item.label} — Coming Soon`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span>{item.label}</span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-h_red/60 bg-h_red/10 px-1.5 py-0.5 rounded-full leading-none">
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
                "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-h_red",
                isActive
                  ? "text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-h_red" : "",
                )}
                aria-hidden
              />
              <span>{item.label}</span>
              {isActive && (
                <span
                  className="absolute bottom-0 left-3 right-3 h-0.5 bg-h_red rounded-full"
                  aria-hidden
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Right section: Search + Auth */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Compact inline search */}
        <form
          onSubmit={handleDesktopSearch}
          role="search"
          aria-label="Search DJscovery"
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg ring-1 ring-white/8 focus-within:ring-h_red/50 transition-all"
        >
          <Search className="h-3.5 w-3.5 text-gray-500 shrink-0" aria-hidden />
          <input
            name="q"
            type="search"
            placeholder="Search DJs, genres..."
            className="bg-transparent outline-none text-sm text-white placeholder:text-gray-500 w-28 lg:w-36"
            aria-label="Search"
          />
        </form>

        {isLoggedIn ? (
          <div className="flex items-center gap-0.5">
            <button
              aria-label="Notifications — Coming Soon"
              title="Notifications — Coming Soon"
              className="size-9 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-h_red"
            >
              <Bell className="h-4.5 w-4.5" aria-hidden />
            </button>
            <button
              aria-label="Messages — Coming Soon"
              title="Messages — Coming Soon"
              className="size-9 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-h_red"
            >
              <MessageCircle className="h-4.5 w-4.5" aria-hidden />
            </button>
            <div className="ml-1">
              <NavbarAvatar
                avatarSrc={avatarSrc}
                displayName={displayName}
                initials={initials}
                username={username}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-h_red/60 text-h_red hover:bg-h_red/15 hover:text-h_red hover:border-h_red transition-all"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-h_red hover:bg-h_redDark text-white font-semibold transition-all"
            >
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
