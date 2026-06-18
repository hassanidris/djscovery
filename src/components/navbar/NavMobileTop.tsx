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
    <div className="relative flex h-14 items-center justify-between md:hidden">
      {/* Left: Burger menu trigger */}
      <BurgerMenu {...props} />

      {/* Center: Logo (absolutely centered to avoid flex offset) */}
      <Link
        href="/"
        aria-label="DJscovery — Go to home"
        className="focus-visible:ring-h_red absolute left-1/2 -translate-x-1/2 rounded-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        <div className="flex items-center gap-2 py-1">
          <Image src="/logo_v2.svg" alt="" width={130} height={70} priority />
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

        {props.isLoggedIn && (
          <button
            type="button"
            disabled
            aria-disabled="true"
            aria-label="Notifications — Coming Soon"
            title="Notifications — Coming Soon"
            className="flex size-9 cursor-not-allowed items-center justify-center rounded-lg text-gray-500"
          >
            <Bell className="h-5 w-5" aria-hidden />
          </button>
        )}
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
