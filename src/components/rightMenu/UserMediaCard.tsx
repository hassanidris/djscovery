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
    <div className="bg-h_blackLight/50 flex flex-col gap-4 rounded-lg p-4 text-sm shadow-md">
      {/* Top */}
      <div className="flex items-center justify-between font-medium">
        <span className="text-gray-200">User Media</span>
        <Link
          href="#"
          className="text-h_redLight hover:text-h_redLightDark text-xs"
        >
          See all
        </Link>
      </div>
      {/* Bottom */}
      <div className="flex flex-wrap justify-between gap-4">
        {mediaItems.length ? (
          mediaItems.map((media) => (
            <div className="relative h-24 w-1/5" key={media.id}>
              <Image
                src={media.url}
                alt=""
                fill
                className="ring-h_black rounded-md object-cover ring-1"
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
