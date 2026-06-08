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
      <div className="p-4 bg-h_blackLight/50 rounded-lg shadow-md text-sm flex flex-col items-center gap-3 text-center">
        <div className="text-3xl">👤</div>
        <p className="text-gray-400 text-xs">Sign in to see your profile</p>
        <Link
          href="/sign-in"
          className="bg-h_red hover:bg-h_redDark text-white text-xs py-2 px-4 rounded-md transition-colors"
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
    : `/profile/${user.username}`;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="bg-h_blackLight/50 rounded-xl border border-gray-800/70 shadow-md overflow-hidden text-sm">
      {/* ── Banner ── */}
      <div className="h-20 relative">
        <Image src={coverSrc} alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* ── Avatar row — overlaps banner ── */}
      <div className="-mt-6 px-4 flex items-end justify-between">
        <Avatar className="w-14 h-14 ring-2 ring-h_red shadow-lg">
          <AvatarImage src={avatarSrc} alt={displayName} />
          <AvatarFallback className="bg-white/10 text-white text-base font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <Link
          href={profileHref}
          className="mb-1 inline-flex bg-h_red hover:bg-h_redDark text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          My Profile
        </Link>
      </div>

      {/* ── Info ── */}
      <div className="px-4 pt-2 pb-4">
        <p className="text-h_white font-semibold text-sm leading-tight">
          {user.djProfile ? `Dj. ${displayName}` : displayName}
        </p>
        <p className="text-white/40 text-xs mt-0.5">
          @{user.djProfile?.slug ?? user.username}
        </p>
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-1.5">
          <span className="text-h_white font-semibold text-xs">
            {user._count.followers}
          </span>
          <span className="text-white/40 text-xs">Followers</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
