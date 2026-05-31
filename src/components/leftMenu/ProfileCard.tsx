import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
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
          className="bg-h_purple hover:bg-h_purpleDark text-white text-xs py-2 px-4 rounded-md transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: { _count: { select: { followers: true } } },
  });

  if (!user) return null;
  return (
    <div className="p-4 bg-h_blackLight/50 rounded-lg shadow-md text-sm flex flex-col gap-6">
      <div className="h-20 relative">
        <Image
          src="/noCover.png"
          alt=""
          fill
          className="rounded-md object-cover ring-1 ring-gray-500"
        />
        <Image
          src="/noAvatar.png"
          alt=""
          width={48}
          height={48}
          className="rounded-full object-cover w-12 h-12 absolute left-0 right-0 m-auto -bottom-6 ring-1 ring-white z-10"
        />
      </div>
      <div className="h-20 flex flex-col gap-2 items-center mt-3">
        <span className="font-semibold text-h_white">{user.username}</span>
        <div className="flex items-center gap-4">
          <div className="flex">
            <Image
              src="https://images.pexels.com/photos/19578755/pexels-photo-19578755/free-photo-of-woman-watching-birds-and-landscape.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
              alt=""
              width={12}
              height={12}
              className="rounded-full object-cover w-3 h-3"
            />
            <Image
              src="https://images.pexels.com/photos/19578755/pexels-photo-19578755/free-photo-of-woman-watching-birds-and-landscape.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
              alt=""
              width={12}
              height={12}
              className="rounded-full object-cover w-3 h-3"
            />
            <Image
              src="https://images.pexels.com/photos/19578755/pexels-photo-19578755/free-photo-of-woman-watching-birds-and-landscape.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
              alt=""
              width={12}
              height={12}
              className="rounded-full object-cover w-3 h-3"
            />
          </div>
          <span className="text-xs text-gray-300">
            {user._count.followers} Followers
          </span>
        </div>
        <Link href={`/profile/${user.username}`}>
          <button className="bg-h_purple hover:bg-h_purpleDark text-white text-xs p-2 rounded-md">
            My Profile
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ProfileCard;
