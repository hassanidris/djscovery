"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Search } from "lucide-react";
import BurgerMenu from "@/components/navbar/BurgerMenu";
import SearchModal from "@/components/navbar/SearchModal";
import type { NavUserData } from "@/lib/auth/getNavUser";

export default function NavMobileTop(props: NavUserData) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex md:hidden h-14 items-center justify-between relative">
      {/* Left: Burger menu trigger */}
      <BurgerMenu {...props} />

      {/* Center: Logo (absolutely centered to avoid flex offset) */}
      <Link
        href="/"
        aria-label="DJscovery — Go to home"
        className="absolute left-1/2 -translate-x-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-h_red rounded-sm"
      >
        <Image
          src="/dj-logo-blue.svg"
          alt="DJscovery"
          width={44}
          height={37}
          priority
        />
      </Link>

      {/* Right: Search + Bell */}
      <div className="flex items-center gap-0.5">
        <button
          aria-label="Open search"
          onClick={() => setSearchOpen(true)}
          className="size-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-h_red"
        >
          <Search className="h-5 w-5" aria-hidden />
        </button>

        {props.isLoggedIn && (
          <button
            type="button"
            disabled
            aria-disabled="true"
            aria-label="Notifications — Coming Soon"
            title="Notifications — Coming Soon"
            className="size-9 flex items-center justify-center rounded-lg text-gray-500 cursor-not-allowed"
          >
            <Bell className="h-5 w-5" aria-hidden />
          </button>
        )}
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
