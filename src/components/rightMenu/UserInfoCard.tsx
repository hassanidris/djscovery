import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
    <div className="p-4 bg-h_blackLight/50 rounded-lg shadow-md text-sm flex flex-col gap-4">
      {/* Top */}
      <div className="flex justify-between items-center font-medium">
        <span className="text-gray-200">User Information</span>
        {currentUserId === user.id ? (
          <UpdateUser user={user} />
        ) : (
          <Link href="#" className="text-h_cyan text-xs">
            See all
          </Link>
        )}
      </div>
      {/* Bottom */}
      <div className="flex flex-col gap-4 text-h_white">
        <div className="flex items-center gap-2">
          <span className="text-xl text-h_white font-semibold">
            {user.username}
          </span>
          <span className="text-sm text-gray-400">@{user.username}</span>
        </div>
        <div className="flex gap-1 items-center text-xs justify-end">
          <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
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
