import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import type { NavRole } from "@/config/navigation";

export type NavUserData = {
  navRole: NavRole;
  isLoggedIn: boolean;
  isOrganizer: boolean;
  username: string | null;
  djSlug: string | null;
  organizerSlug: string | null;
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
      isOrganizer: false,
      username: null,
      djSlug: null,
      organizerSlug: null,
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
      organizerProfile: {
        select: {
          slug: true,
          status: true,
          deletedAt: true,
          logoUrl: true,
          displayName: true,
        },
      },
    },
  });

  const roles = profile?.roles.map((r) => r.role) ?? [];
  let navRole: NavRole = "fan";
  if (roles.includes("ADMIN")) navRole = "admin";
  else if (roles.includes("DJ")) navRole = "dj";
  else if (roles.includes("ORGANIZER")) navRole = "organizer";

  const displayName =
    profile?.djProfile?.stageName ??
    profile?.organizerProfile?.displayName ??
    profile?.username ??
    user.email ??
    "?";
  const avatarSrc =
    profile?.djProfile?.avatar ?? profile?.organizerProfile?.logoUrl ?? null;
  const initials = displayName.slice(0, 2).toUpperCase();

  const orgProfile = profile?.organizerProfile;
  const organizerSlug =
    orgProfile?.status === "ACTIVE" && orgProfile?.deletedAt === null
      ? (orgProfile.slug ?? null)
      : null;

  return {
    navRole,
    isLoggedIn: true,
    isOrganizer: roles.includes("ORGANIZER"),
    username: profile?.username ?? null,
    djSlug: profile?.djProfile?.slug ?? null,
    organizerSlug,
    displayName,
    avatarSrc,
    initials,
  };
});
