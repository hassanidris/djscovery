"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useIsDesktop } from "@/lib/hooks/useIsDesktop";
import BurgerMenu from "@/components/navbar/BurgerMenu";
import type { NavUserData } from "@/lib/auth/getNavUser";

// Lazy-load the search modal so its JS only ships when a user opens search.
const SearchModal = dynamic(() => import("@/components/navbar/SearchModal"), {
  ssr: false,
  loading: () => null,
});

export default function NavMobileTop(props: NavUserData) {
  const [searchOpen, setSearchOpen] = useState(false);
  const isDesktop = useIsDesktop();

  return (
    <div className="relative flex h-14 items-center justify-between md:hidden">
      {/* Left: Burger menu trigger */}
      <BurgerMenu {...props} />

      {/* Center: Logo (absolutely centered to avoid flex offset) */}
      <Link
        href="/"
        aria-label="DJcovery — Go to home"
        className="focus-visible:ring-h_red absolute left-1/2 -translate-x-1/2 rounded-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        <div className="flex items-center gap-2 py-1">
          <Image
            src="/dj_logo-new.svg"
            alt="DJcovery Logo"
            width={130}
            height={31}
            priority
          />
          {/* <span className="font-heading text-xl leading-none tracking-tight text-white">
            <span className="font-bold">DJ</span>
            <span className="font-semibold">scovery</span>
          </span> */}
        </div>
      </Link>

      {/* Right: Search + Bell */}
      <div className="flex items-center gap-0.5">
        <button
          aria-label="Open search"
          onClick={() => setSearchOpen(true)}
          className="focus-visible:ring-h_red flex size-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:outline-none"
        >
          <Search className="h-5 w-5" aria-hidden />
        </button>

        {props.isLoggedIn && !isDesktop && <NotificationBell />}
      </div>

      {searchOpen && (
        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      )}
    </div>
  );
}
