import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCommentDots,
  faHouse,
  faUsers,
  faCompactDisc,
} from "@fortawesome/free-solid-svg-icons";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import NavbarAvatar from "@/components/NavbarAvatar";
import prisma from "@/lib/client";

const Navbar = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          username: true,
          djProfile: { select: { avatar: true, stageName: true } },
        },
      })
    : null;

  const avatarSrc = profile?.djProfile?.avatar ?? null;
  const displayName =
    profile?.djProfile?.stageName ?? profile?.username ?? user?.email ?? "?";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <div className="h-24 flex items-center justify-between">
        {/* LEFT — Logo */}
        <div className="md:hidden lg:block w-[20%]">
          <Link href="/">
            <Image src="/logo.svg" alt="DJscovery" width={100} height={100} />
          </Link>
        </div>

        {/* CENTER — Nav links + Search */}
        <div className="hidden md:flex w-[50%] text-sm items-center justify-between">
          <div className="flex gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faHouse} className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              href="/directory"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faCompactDisc} className="h-4 w-4" />
              <span>Directory</span>
            </Link>
            <Link
              href="/community"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faUsers} className="h-4 w-4" />
              <span>Community</span>
            </Link>
          </div>
          <div className="hidden xl:flex p-2 bg-transparent items-center rounded-xl ring-1 ring-gray-600">
            <input
              type="text"
              placeholder="Search DJs, genres..."
              className="bg-transparent outline-none text-white placeholder:text-gray-500 w-40"
            />
            <Image src="/search.png" alt="" width={14} height={14} />
          </div>
        </div>

        {/* RIGHT — Auth actions */}
        <div className="w-[30%] flex items-center gap-3 xl:gap-5 justify-end">
          {user ? (
            <>
              <button className="size-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                <FontAwesomeIcon icon={faCommentDots} className="h-5.5 w-5.5" />
              </button>
              <button className="size-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                <FontAwesomeIcon icon={faBell} className="h-5.5 w-5.5" />
              </button>
              <NavbarAvatar
                avatarSrc={avatarSrc}
                displayName={displayName}
                initials={initials}
                username={profile?.username ?? null}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-white/5"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-h_purple hover:bg-h_purpleDark text-white"
              >
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
