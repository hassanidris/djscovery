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
import { Menu, User, Settings, LogOut, LogIn, UserPlus } from "lucide-react";
import { desktopNavByRole } from "@/config/navigation";
import { signOut } from "@/lib/actions/auth";
import type { NavUserData } from "@/lib/auth/getNavUser";

type Props = NavUserData;

export default function BurgerMenu({
  navRole,
  isLoggedIn,
  username,
  djSlug,
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
            className="size-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-h_red"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </SheetTrigger>

        <SheetContent
          side="left"
          showCloseButton={false}
          className="bg-black border-r border-white/8 text-white flex flex-col p-0 gap-0"
        >
          <SheetHeader className="shrink-0 p-5 pb-4">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>

            <div className="flex items-center justify-between">
              <SheetClose asChild>
                <Link href="/" aria-label="DJscovery home">
                  <Image
                    src="/dj-logo-blue.svg"
                    alt="DJscovery"
                    width={44}
                    height={37}
                  />
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <button
                  aria-label="Close menu"
                  className="size-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors text-xl font-light"
                >
                  ✕
                </button>
              </SheetClose>
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-3 mt-4">
                <Avatar className="size-10 ring-2 ring-h_red shrink-0">
                  <AvatarImage
                    src={avatarSrc ?? "/noAvatar.png"}
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-h_redDark text-white text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {displayName}
                  </p>
                  {username && (
                    <p className="text-gray-500 text-xs truncate">
                      @{username}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm mt-4">Welcome to DJscovery</p>
            )}
          </SheetHeader>

          <Separator className="bg-white/8" />

          <nav
            className="flex-1 overflow-y-auto py-3 scrollbar-hide"
            aria-label="Mobile navigation"
          >
            <div className="px-3">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold px-2 mb-2">
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
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 cursor-not-allowed select-none"
                      aria-disabled="true"
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="flex-1">{item.label}</span>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-h_red/50 bg-h_red/10 px-1.5 py-0.5 rounded-full leading-none">
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
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                        isActive
                          ? "text-white bg-white/5"
                          : "text-gray-400 hover:text-white hover:bg-white/5",
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
                <Separator className="bg-white/8 my-3" />
                <div className="px-3">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold px-2 mb-2">
                    Account
                  </p>

                  {(username || djSlug) &&
                    (() => {
                      const profileHref =
                        navRole === "dj" && djSlug
                          ? `/djs/${djSlug}`
                          : navRole === "dj"
                            ? "/become-dj"
                            : `/profile/${username}`;
                      const isProfileActive =
                        pathname.startsWith("/djs/") ||
                        pathname.startsWith("/profile");
                      return (
                        <SheetClose asChild>
                          <Link
                            href={profileHref}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                              isProfileActive
                                ? "text-white bg-white/5"
                                : "text-gray-400 hover:text-white hover:bg-white/5",
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

                  <SheetClose asChild>
                    <Link
                      href="/settings"
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                        pathname === "/settings"
                          ? "text-white bg-white/5"
                          : "text-gray-400 hover:text-white hover:bg-white/5",
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
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <LogOut className="h-4 w-4 text-h_red shrink-0" aria-hidden />
                <span>Sign out</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-h_red/60 text-h_red hover:bg-h_red/15 hover:text-h_red hover:border-h_red"
                >
                  <SheetClose asChild>
                    <Link href="/sign-in">
                      <LogIn className="h-4 w-4 mr-2" aria-hidden />
                      Sign In
                    </Link>
                  </SheetClose>
                </Button>
                <Button
                  asChild
                  className="w-full bg-h_red hover:bg-h_redDark text-white"
                >
                  <SheetClose asChild>
                    <Link href="/sign-up">
                      <UserPlus className="h-4 w-4 mr-2" aria-hidden />
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
