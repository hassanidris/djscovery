import prisma from "@/lib/client";
import { User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const UserMediaCard = async ({ user }: { user: User }) => {
  const mediaItems = await prisma.media.findMany({
    where: {
      post: { userId: user.id, deletedAt: null },
      type: "IMAGE",
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 bg-h_blackLight/50 rounded-lg shadow-md text-sm flex flex-col gap-4">
      {/* Top */}
      <div className="flex justify-between items-center font-medium">
        <span className="text-gray-200">User Media</span>
        <Link
          href="#"
          className="text-h_purple hover:text-h_purpleDark text-xs"
        >
          See all
        </Link>
      </div>
      {/* Bottom */}
      <div className="flex gap-4 justify-between flex-wrap">
        {mediaItems.length ? (
          mediaItems.map((media) => (
            <div className="relative w-1/5 h-24" key={media.id}>
              <Image
                src={media.url}
                alt=""
                fill
                className="object-cover rounded-md ring-1 ring-h_black"
              />
            </div>
          ))
        ) : (
          <p className="text-h_white text-xs">No media found!</p>
        )}
      </div>
    </div>
  );
};

export default UserMediaCard;
