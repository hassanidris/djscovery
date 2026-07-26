import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { Calendar } from "lucide-react";
import { User } from "@prisma/client";
import Link from "next/link";
import React from "react";
import UserInfoCardInteraction from "./UserInfoCardInteraction";
import UpdateUser from "./UpdateUser";

const UserInfoCard = async ({ user }: { user: User }) => {
  const formattedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const currentUserId = authUser?.id;

  let isFollowing = false;

  if (currentUserId && currentUserId !== user.id) {
    const followRes = await prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: user.id,
        },
      },
    });
    isFollowing = !!followRes;
  }

  return (
    <div className="bg-h_blackLight/50 flex flex-col gap-4 rounded-lg p-4 text-sm shadow-md">
      {/* Top */}
      <div className="flex items-center justify-between font-medium">
        <span className="text-gray-200">User Information</span>
        {currentUserId === user.id ? (
          <UpdateUser user={user} />
        ) : (
          <Link href="#" className="text-h_red text-xs">
            See all
          </Link>
        )}
      </div>
      {/* Bottom */}
      <div className="text-h_white flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-h_white text-xl font-semibold">
            {user.username}
          </span>
          <span className="text-sm text-gray-400">@{user.username}</span>
        </div>
        <div className="flex items-center justify-end gap-1 text-xs">
          <Calendar className="h-4 w-4" />
          <span>Joined {formattedDate}</span>
        </div>
        {currentUserId && currentUserId !== user.id && (
          <UserInfoCardInteraction userId={user.id} isFollowing={isFollowing} />
        )}
      </div>
    </div>
  );
};

export default UserInfoCard;
