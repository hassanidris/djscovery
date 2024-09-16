import AddPost from "@/components/feed/AddPost";
import Feed from "@/components/feed/Feed";
import LeftMenu from "@/components/leftMenu/LeftMenu";
import RightMenu from "@/components/rightMenu/RightMenu";
import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";

const ProfilePage = async ({ params }: { params: { username: string } }) => {
  const username = params.username;

  const user = await prisma.user.findFirst({
    where: {
      username,
    },
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

  const { userId: currentUserId } = auth();

  let isBlocked;

  if (currentUserId) {
    const res = await prisma.block.findFirst({
      where: {
        blockerId: user.id,
        blockedId: currentUserId,
      },
    });

    if (res) isBlocked = true;
  } else {
    isBlocked = false;
  }

  if (isBlocked) return notFound();

  return (
    <div className=" px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
      <div className=" flex gap-6 py-6">
        <div className=" hidden xl:block w-[20%]">
          <LeftMenu type="profile" />
        </div>
        <div className=" w-full lg:w-[70%] xl:w-[50%]">
          <div className="flex flex-col gap-6">
            <div className=" flex flex-col items-center justify-center">
              <div className=" w-full h-64 relative">
                <Image
                  src={user.cover || "/noCover.png"}
                  alt=""
                  fill
                  className=" rounded-md object-cover ring-1 ring-gray-700"
                />
                <Image
                  src={user.avatar || "/noAvatar.png"}
                  alt=""
                  width={128}
                  height={128}
                  className=" w-32 h-32 rounded-full absolute right-0 left-0 m-auto -bottom-16 ring-4 ring-gray-800 object-cover"
                />
              </div>
              <h1 className=" mt-20 mb-4 text-2xl font-medium text-h_white">
                {user.name && user.surname
                  ? user.name + " " + user.surname
                  : user.username}
              </h1>
              <div className=" flex justify-center items-center gap-12 mb-4 text-gray-200">
                <div className=" flex flex-col items-center">
                  <span className=" font-medium">{user._count.posts}</span>
                  <span className=" text-sm">Posts</span>
                </div>
                <div className=" flex flex-col items-center">
                  <span className=" font-medium">{user._count.followers}</span>
                  <span className=" text-sm">Followers</span>
                </div>
                <div className=" flex flex-col items-center">
                  <span className=" font-medium">{user._count.followings}</span>
                  <span className=" text-sm">Following</span>
                </div>
              </div>
            </div>
            <AddPost />
            <Feed username={user.username} />
          </div>
        </div>
        <div className="hidden xl:block w-[30%]">
          <RightMenu user={user} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
