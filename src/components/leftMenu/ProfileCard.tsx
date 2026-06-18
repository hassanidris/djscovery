import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";

const ProfileCard = async () => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const userId = authUser?.id;

  if (!userId) {
    return (
      <div className="bg-h_blackLight/50 flex flex-col items-center gap-3 rounded-lg p-4 text-center text-sm shadow-md">
        <div className="text-3xl">👤</div>
        <p className="text-xs text-gray-400">Sign in to see your profile</p>
        <Link
          href="/sign-in"
          className="bg-h_red hover:bg-h_redDark rounded-md px-4 py-2 text-xs text-white transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: {
      _count: { select: { followers: true } },
      djProfile: {
        select: { avatar: true, coverImage: true, stageName: true, slug: true },
      },
    },
  });

  if (!user) return null;

  const avatarSrc = user.djProfile?.avatar ?? user.image ?? "/noAvatar.png";
  const coverSrc = user.djProfile?.coverImage ?? "/noCover.png";
  const displayName = user.djProfile?.stageName ?? user.username;
  const profileHref = user.djProfile?.slug
    ? `/djs/${user.djProfile.slug}`
    : "/account";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="bg-h_blackLight/50 overflow-hidden rounded-xl border border-gray-800/70 text-sm shadow-md">
      {/* ── Banner ── */}
      <div className="relative h-20">
        <Image src={coverSrc} alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* ── Avatar row — overlaps banner ── */}
      <div className="-mt-6 flex items-end justify-between px-4">
        <Avatar className="ring-h_red h-14 w-14 shadow-lg ring-2">
          <AvatarImage src={avatarSrc} alt={displayName} />
          <AvatarFallback className="bg-white/10 text-base font-bold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <Link
          href={profileHref}
          className="bg-h_red hover:bg-h_redDark mb-1 inline-flex cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors"
        >
          My Profile
        </Link>
      </div>

      {/* ── Info ── */}
      <div className="px-4 pt-2 pb-4">
        <p className="text-h_white text-sm leading-tight font-semibold">
          {user.djProfile ? `Dj. ${displayName}` : displayName}
        </p>
        <p className="mt-0.5 text-xs text-white/40">
          @{user.djProfile?.slug ?? user.username}
        </p>
        <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3">
          <span className="text-h_white text-xs font-semibold">
            {user._count.followers}
          </span>
          <span className="text-xs text-white/40">Followers</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
