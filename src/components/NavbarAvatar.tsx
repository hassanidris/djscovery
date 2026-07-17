"use client";

import { useRef } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/actions/auth";
import { toast } from "sonner";
import type { NavRole } from "@/config/navigation";

type Props = {
  avatarSrc: string | null;
  displayName: string;
  initials: string;
  username: string | null;
  navRole: NavRole;
  djSlug: string | null;
  organizerSlug: string | null;
  isOrganizer: boolean;
};

export default function NavbarAvatar({
  avatarSrc,
  displayName,
  initials,
  username,
  navRole,
  djSlug,
  organizerSlug,
  isOrganizer,
}: Props) {
  const signOutFormRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form ref={signOutFormRef} action={signOut} className="hidden" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="focus-visible:ring-h_red rounded-full outline-none focus-visible:ring-2">
            <Avatar className="ring-h_red hover:ring-h_redDark size-8 cursor-pointer ring-2 transition-all">
              <AvatarImage
                src={avatarSrc ?? "/noAvatar.png"}
                alt={displayName}
              />
              <AvatarFallback className="bg-h_redDark text-sm font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="bg-h_blackLight w-52 border border-white/10 text-white"
        >
          {navRole !== "guest" && (
            <DropdownMenuItem
              asChild
              className="cursor-pointer text-gray-300 focus:bg-white/5 focus:text-white"
            >
              <Link
                href={
                  navRole === "dj" && djSlug
                    ? `/djs/${djSlug}`
                    : navRole === "dj"
                      ? "/become-dj"
                      : isOrganizer && organizerSlug
                        ? `/organizers/${organizerSlug}`
                        : "/account"
                }
              >
                My Profile
              </Link>
            </DropdownMenuItem>
          )}

          {navRole === "dj" && (
            <DropdownMenuItem
              asChild
              className="cursor-pointer text-gray-300 focus:bg-white/5 focus:text-white"
            >
              <Link href="/dj/overview">DJ Dashboard</Link>
            </DropdownMenuItem>
          )}

          {isOrganizer && (
            <DropdownMenuItem
              asChild
              className="cursor-pointer text-gray-300 focus:bg-white/5 focus:text-white"
            >
              <Link href="/organizer/dashboard">Organizer Dashboard</Link>
            </DropdownMenuItem>
          )}

          {navRole !== "admin" && navRole !== "guest" && (
            <DropdownMenuItem
              asChild
              className="cursor-pointer text-gray-300 focus:bg-white/5 focus:text-white"
            >
              <Link
                href={
                  navRole === "dj"
                    ? "/dj/account"
                    : navRole === "organizer"
                      ? "/organizer/account"
                      : "/fan/account"
                }
              >
                Settings
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-white/10" />

          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer focus:bg-red-500/10"
            onSelect={() => {
              toast.info("Signing out...");
              signOutFormRef.current?.requestSubmit();
            }}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
