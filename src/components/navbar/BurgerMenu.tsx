"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Menu,
  User,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  Briefcase,
} from "lucide-react";
import { desktopNavByRole } from "@/config/navigation";
import { signOut } from "@/lib/actions/auth";
import type { NavUserData } from "@/lib/auth/getNavUser";

type Props = NavUserData;

export default function BurgerMenu({
  navRole,
  isLoggedIn,
  isOrganizer,
  username,
  djSlug,
  organizerSlug,
  displayName,
  avatarSrc,
  initials,
}: Props) {
  const signOutFormRef = useRef<HTMLFormElement>(null);
  const pathname = usePathname();
  const navItems = desktopNavByRole[navRole];

  return (
    <>
      <form ref={signOutFormRef} action={signOut} className="hidden" />

      <Sheet>
        <SheetTrigger asChild>
          <button
            aria-label="Open navigation menu"
            className="focus-visible:ring-h_red flex size-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:outline-none"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </SheetTrigger>

        <SheetContent
          side="left"
          showCloseButton={false}
          className="flex flex-col gap-0 border-r border-white/8 bg-black p-0 text-white"
        >
          <SheetHeader className="shrink-0 p-5 pb-4">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>

            <div className="flex items-center justify-between">
              <SheetClose asChild>
                <Link href="/" aria-label="DJscovery home">
                  <div className="flex items-center gap-2 py-1">
                    <Image
                      src="/dj-logo-red.svg"
                      alt=""
                      width={26}
                      height={30}
                    />
                    <span className="font-heading text-xl leading-none tracking-tight text-white">
                      <span className="font-bold">DJ</span>
                      <span className="font-semibold">covery</span>
                    </span>
                  </div>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <button
                  aria-label="Close menu"
                  className="flex size-8 items-center justify-center rounded-lg text-xl font-light text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
                >
                  ✕
                </button>
              </SheetClose>
            </div>

            {isLoggedIn ? (
              <div className="mt-4 flex items-center gap-3">
                <Avatar className="ring-h_red size-10 shrink-0 ring-2">
                  <AvatarImage
                    src={avatarSrc ?? "/noAvatar.png"}
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-h_redDark text-sm font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {displayName}
                  </p>
                  {username && (
                    <p className="truncate text-xs text-gray-500">
                      @{username}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-400">Welcome to DJscovery</p>
            )}
          </SheetHeader>

          <Separator className="bg-white/8" />

          <nav
            className="scrollbar-hide flex-1 overflow-y-auto py-3"
            aria-label="Mobile navigation"
          >
            <div className="px-3">
              <p className="mb-2 px-2 text-[11px] font-semibold tracking-widest text-gray-600 uppercase">
                Explore
              </p>

              {navItems.map((item) => {
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
                      className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 select-none"
                      aria-disabled="true"
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="flex-1">{item.label}</span>
                      <span className="text-h_red/50 bg-h_red/10 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold tracking-wider uppercase">
                        Soon
                      </span>
                    </span>
                  );
                }

                return (
                  <SheetClose asChild key={item.id}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        isActive
                          ? "bg-white/5 text-white"
                          : "text-gray-400 hover:bg-white/5 hover:text-white",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-h_red" : "",
                        )}
                        aria-hidden
                      />
                      <span>{item.label}</span>
                    </Link>
                  </SheetClose>
                );
              })}
            </div>

            {isLoggedIn && (
              <>
                <Separator className="my-3 bg-white/8" />
                <div className="px-3">
                  <p className="mb-2 px-2 text-[11px] font-semibold tracking-widest text-gray-600 uppercase">
                    Account
                  </p>

                  {(username || djSlug || organizerSlug) &&
                    (() => {
                      const profileHref =
                        navRole === "dj" && djSlug
                          ? `/djs/${djSlug}`
                          : navRole === "dj"
                            ? "/become-dj"
                            : isOrganizer && organizerSlug
                              ? `/organizers/${organizerSlug}`
                              : `/profile/${username}`;
                      const isProfileActive =
                        pathname.startsWith("/djs/") ||
                        pathname.startsWith("/organizers/") ||
                        pathname.startsWith("/profile");
                      return (
                        <SheetClose asChild>
                          <Link
                            href={profileHref}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                              isProfileActive
                                ? "bg-white/5 text-white"
                                : "text-gray-400 hover:bg-white/5 hover:text-white",
                            )}
                            aria-current={isProfileActive ? "page" : undefined}
                          >
                            <User
                              className={cn(
                                "h-4 w-4 shrink-0",
                                isProfileActive ? "text-h_red" : "",
                              )}
                              aria-hidden
                            />
                            <span>My Profile</span>
                          </Link>
                        </SheetClose>
                      );
                    })()}

                  {isOrganizer && (
                    <SheetClose asChild>
                      <Link
                        href="/organizer/dashboard"
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                          pathname === "/organizer" ||
                            pathname.startsWith("/organizer/")
                            ? "bg-white/5 text-white"
                            : "text-gray-400 hover:bg-white/5 hover:text-white",
                        )}
                        aria-current={
                          pathname === "/organizer" ||
                          pathname.startsWith("/organizer/")
                            ? "page"
                            : undefined
                        }
                      >
                        <Briefcase
                          className={cn(
                            "h-4 w-4 shrink-0",
                            pathname === "/organizer" ||
                              pathname.startsWith("/organizer/")
                              ? "text-h_red"
                              : "",
                          )}
                          aria-hidden
                        />
                        <span>Organizer Dashboard</span>
                      </Link>
                    </SheetClose>
                  )}

                  <SheetClose asChild>
                    <Link
                      href="/settings"
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        pathname === "/settings"
                          ? "bg-white/5 text-white"
                          : "text-gray-400 hover:bg-white/5 hover:text-white",
                      )}
                      aria-current={
                        pathname === "/settings" ? "page" : undefined
                      }
                    >
                      <Settings
                        className={cn(
                          "h-4 w-4 shrink-0",
                          pathname === "/settings" ? "text-h_red" : "",
                        )}
                        aria-hidden
                      />
                      <span>Settings</span>
                    </Link>
                  </SheetClose>
                </div>
              </>
            )}
          </nav>

          <Separator className="bg-white/8" />

          <SheetFooter className="p-4">
            {isLoggedIn ? (
              <button
                onClick={() => signOutFormRef.current?.requestSubmit()}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <LogOut className="text-h_red h-4 w-4 shrink-0" aria-hidden />
                <span>Sign out</span>
              </button>
            ) : (
              <div className="flex w-full flex-col gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="border-h_red/60 text-h_red hover:bg-h_red/15 hover:text-h_red hover:border-h_red w-full"
                >
                  <SheetClose asChild>
                    <Link href="/sign-in">
                      <LogIn className="mr-2 h-4 w-4" aria-hidden />
                      Sign In
                    </Link>
                  </SheetClose>
                </Button>
                <Button
                  asChild
                  className="bg-h_red hover:bg-h_redDark w-full text-white"
                >
                  <SheetClose asChild>
                    <Link href="/sign-up">
                      <UserPlus className="mr-2 h-4 w-4" aria-hidden />
                      Sign Up
                    </Link>
                  </SheetClose>
                </Button>
              </div>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
