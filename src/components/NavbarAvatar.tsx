"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="outline-none rounded-full focus-visible:ring-2 focus-visible:ring-h_purple">
          <Avatar className="size-10 ring-2 ring-h_purple hover:ring-h_purpleDark transition-all cursor-pointer">
            <AvatarImage src={avatarSrc ?? "/noAvatar.png"} alt={displayName} />
            <AvatarFallback className="bg-h_purpleDark text-white text-sm font-semibold">
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
        <DropdownMenuLabel className="flex items-center gap-3 py-3 px-3">
          <Avatar className="size-9 ring-1 ring-h_purple shrink-0">
            <AvatarImage src={avatarSrc ?? "/noAvatar.png"} alt={displayName} />
            <AvatarFallback className="bg-h_purpleDark text-white text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-white text-sm font-semibold truncate">
              {displayName}
            </span>
            {username && (
              <span className="text-gray-500 text-xs truncate">@{username}</span>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/10" />

        {username && (
          <DropdownMenuItem asChild className="cursor-pointer text-gray-300 focus:text-white focus:bg-white/5">
            <Link href={`/profile/${username}`}>My Profile</Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild className="cursor-pointer text-gray-300 focus:text-white focus:bg-white/5">
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer focus:bg-red-500/10"
          asChild
        >
          <form action={signOut} className="w-full">
            <button type="submit" className="w-full text-left">
              Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
