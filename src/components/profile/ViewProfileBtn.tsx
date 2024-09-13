import React from "react";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import Link from "next/link";

const ViewProfileBtn = async () => {
  const { userId } = auth();

  if (!userId) return null;

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  if (!user) return null;
  return (
    <Link
      href={/profile/${user.username}}
      className=" flex gap-2 border border-black py-1 px-2 rounded-md  butn primary_border_butn text-white ms-4"
    >
      <span>View Profile</span>
    </Link>
  );
};

export default ViewProfileBtn;