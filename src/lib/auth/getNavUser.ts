import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import type { NavRole } from "@/config/navigation";

export type NavUserData = {
  navRole: NavRole;
  isLoggedIn: boolean;
  username: string | null;
  djSlug: string | null;
  displayName: string;
  avatarSrc: string | null;
  initials: string;
};

export const getNavUser = cache(async (): Promise<NavUserData> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      navRole: "guest",
      isLoggedIn: false,
      username: null,
      djSlug: null,
      displayName: "Guest",
      avatarSrc: null,
      initials: "G",
    };
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      username: true,
      roles: { select: { role: true } },
      djProfile: { select: { avatar: true, stageName: true, slug: true } },
    },
  });

  const roles = profile?.roles.map((r) => r.role) ?? [];
  let navRole: NavRole = "fan";
  if (roles.includes("ADMIN")) navRole = "admin";
  else if (roles.includes("DJ")) navRole = "dj";
  else if (roles.includes("ORGANIZER")) navRole = "organizer";

  const displayName =
    profile?.djProfile?.stageName ?? profile?.username ?? user.email ?? "?";
  const avatarSrc = profile?.djProfile?.avatar ?? null;
  const initials = displayName.slice(0, 2).toUpperCase();

  return {
    navRole,
    isLoggedIn: true,
    username: profile?.username ?? null,
    djSlug: profile?.djProfile?.slug ?? null,
    displayName,
    avatarSrc,
    initials,
  };
});
