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

type Props = {
  avatarSrc: string | null;
  displayName: string;
  initials: string;
  djSlug: string | null;
};

export default function DjHeaderAvatar({
  avatarSrc,
  displayName,
  initials,
  djSlug,
}: Props) {
  const signOutFormRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form ref={signOutFormRef} action={signOut} className="hidden" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="focus-visible:ring-h_red rounded-full outline-none focus-visible:ring-2">
            <Avatar className="ring-h_red hover:ring-h_redDark size-14 cursor-pointer ring-2 transition-all">
              <AvatarImage
                src={avatarSrc ?? "/noAvatar.png"}
                alt={displayName}
              />
              <AvatarFallback className="bg-h_redDark text-lg font-semibold text-white">
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
          <DropdownMenuItem
            asChild
            className="cursor-pointer text-gray-300 focus:bg-white/5 focus:text-white"
          >
            <Link href="/dj/overview">DJ Dashboard</Link>
          </DropdownMenuItem>

          {djSlug && (
            <DropdownMenuItem
              asChild
              className="cursor-pointer text-gray-300 focus:bg-white/5 focus:text-white"
            >
              <Link href={`/djs/${djSlug}`}>View Public Profile</Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-white/10" />

          <DropdownMenuItem
            asChild
            className="cursor-pointer text-gray-300 focus:bg-white/5 focus:text-white"
          >
            <Link href="/dj/settings">Profile Settings</Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer text-gray-300 focus:bg-white/5 focus:text-white"
          >
            <Link href="/dj/account">Account Settings</Link>
          </DropdownMenuItem>

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
