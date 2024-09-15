import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import {
  faBriefcase,
  faCalendar,
  faLink,
  faLocationDot,
  faSchool,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User } from "@prisma/client";
import Link from "next/link";
import React from "react";
import UserInfoCardInteraction from "./UserInfoCardInteraction";
import UpdateUser from "./UpdateUser";

const UserInfoCard = async ({ user }: { user: User }) => {
  const createdAtDate = new Date(user.createdAt);

  const formattedDate = createdAtDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let isUserBlocked = false;
  let isFollowing = false;
  let isFollowingSent = false;

  const { userId: currentUserId } = auth();

  if (currentUserId) {
    const blockRes = await prisma.block.findFirst({
      where: {
        blockerId: currentUserId,
        blockedId: user.id,
      },
    });

    blockRes ? (isUserBlocked = true) : (isUserBlocked = false);
    const followRes = await prisma.follower.findFirst({
      where: {
        followerId: currentUserId,
        followingId: user.id,
      },
    });

    followRes ? (isFollowing = true) : (isFollowing = false);
    const followReqRes = await prisma.followRequest.findFirst({
      where: {
        senderId: currentUserId,
        receiverId: user.id,
      },
    });

    followReqRes ? (isFollowingSent = true) : (isFollowingSent = false);
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-4">
      {/* Top */}
      <div className="flex justify-between items-center font-medium">
        <span className="text-gray-500">User Information</span>
        {currentUserId === user.id ? (
          <UpdateUser user={user} />
        ) : (
          <Link href="#" className="text-blue-500 text-xs">
            See all
          </Link>
        )}
      </div>
      {/* Bottom */}
      <div className=" flex flex-col gap-4 text-gray-500">
        <div className=" flex items-center gap-2">
          <span className=" text-xl text-black">
            {user.name && user.surname
              ? user.name + " " + user.surname
              : user.username}
          </span>
          <span className=" text-sm">@{user.username}</span>
        </div>
        {user.description && <p>{user.description}</p>}
        {user.city && (
          <div className=" flex items-center gap-2">
            <FontAwesomeIcon icon={faLocationDot} className=" w-4 h-4" />
            <span>
              Living in <b>{user.city}</b>
            </span>
          </div>
        )}
        {user.school && (
          <div className=" flex items-center gap-2">
            <FontAwesomeIcon icon={faSchool} className=" w-4 h-4" />
            <span>
              Went to <b>{user.school}</b>
            </span>
          </div>
        )}
        {user.work && (
          <div className=" flex items-center gap-2">
            <FontAwesomeIcon icon={faBriefcase} className=" w-4 h-4" />
            <span>
              Work at <b>{user.work}</b>
            </span>
          </div>
        )}
        <div className=" flex items-center justify-between">
          {user.website && (
            <div className=" flex items-center gap-2">
              <FontAwesomeIcon icon={faLink} className=" w-4 h-4" />
              <Link
                href={user.website}
                target="_blank"
                className="text-blue-500 font-medium"
              >
                {user.website}
              </Link>
            </div>
          )}
          <div className="flex gap-1 items-center text-xs">
            <FontAwesomeIcon icon={faCalendar} className=" w-4 h-4" />
            <span>Joined {formattedDate}</span>
          </div>
        </div>
        {currentUserId && currentUserId !== user.id && (
          <UserInfoCardInteraction
            userId={user.id}
            isUserBlocked={isUserBlocked}
            isFollowing={isFollowing}
            isFollowingSent={isFollowingSent}
          />
        )}
      </div>
    </div>
  );
};

export default UserInfoCard;
