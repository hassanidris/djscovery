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

type Props = {
  avatarSrc: string | null;
  displayName: string;
  initials: string;
  username: string | null;
};

export default function NavbarAvatar({
  avatarSrc,
  displayName,
  initials,
  username,
}: Props) {
  const signOutFormRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form ref={signOutFormRef} action={signOut} className="hidden" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="outline-none rounded-full focus-visible:ring-2 focus-visible:ring-h_red">
            <Avatar className="size-8 ring-2 ring-h_red hover:ring-h_redDark transition-all cursor-pointer">
              <AvatarImage
                src={avatarSrc ?? "/noAvatar.png"}
                alt={displayName}
              />
              <AvatarFallback className="bg-h_redDark text-white text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-52 bg-h_blackLight border border-white/10 text-white"
        >
          {username && (
            <DropdownMenuItem
              asChild
              className="cursor-pointer text-gray-300 focus:text-white focus:bg-white/5"
            >
              <Link href={`/profile/${username}`}>My Profile</Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            asChild
            className="cursor-pointer text-gray-300 focus:text-white focus:bg-white/5"
          >
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-white/10" />

          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer focus:bg-red-500/10"
            onSelect={() => signOutFormRef.current?.requestSubmit()}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
