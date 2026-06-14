import AddPost from "@/components/feed/AddPost";
import Feed from "@/components/feed/Feed";
import LeftMenu from "@/components/leftMenu/LeftMenu";
import RightMenu from "@/components/rightMenu/RightMenu";
import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import React from "react";

const ProfilePage = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}) => {
  const { username } = await params;

  const user = await prisma.user.findFirst({
    where: { username },
    include: {
      _count: {
        select: {
          followers: true,
          followings: true,
          posts: true,
        },
      },
    },
  });

  if (!user) return notFound();

  // Organizers have a dedicated public profile page — redirect there
  const orgProfile = await prisma.organizerProfile.findFirst({
    where: { userId: user.id, status: "ACTIVE", deletedAt: null },
    select: { slug: true },
  });
  if (orgProfile) redirect(`/organizers/${orgProfile.slug}`);

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const currentUserId = authUser?.id;

  return (
    <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
      <div className="flex gap-6 py-6">
        <div className="hidden w-[20%] xl:block">
          <LeftMenu type="profile" />
        </div>
        <div className="w-full lg:w-[70%] xl:w-[50%]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center justify-center">
              <div className="relative h-64 w-full">
                <Image
                  src="/noCover.png"
                  alt=""
                  fill
                  className="rounded-md object-cover ring-1 ring-gray-700"
                />
                <Image
                  src="/noAvatar.png"
                  alt=""
                  width={128}
                  height={128}
                  className="absolute right-0 -bottom-16 left-0 m-auto h-32 w-32 rounded-full object-cover ring-4 ring-gray-800"
                />
              </div>
              <h1 className="text-h_white mt-20 mb-4 text-2xl font-medium">
                {user.username}
              </h1>
              <div className="mb-4 flex items-center justify-center gap-12 text-gray-200">
                <div className="flex flex-col items-center">
                  <span className="font-medium">{user._count.posts}</span>
                  <span className="text-sm">Posts</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-medium">{user._count.followers}</span>
                  <span className="text-sm">Followers</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-medium">{user._count.followings}</span>
                  <span className="text-sm">Following</span>
                </div>
              </div>
            </div>
            {currentUserId === user.id ? <AddPost /> : null}
            <Feed username={user.username} />
          </div>
        </div>
        <div className="hidden w-[30%] xl:block">
          <RightMenu user={user} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
