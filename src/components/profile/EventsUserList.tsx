// "use client";
import {
  faArrowUpRightFromSquare,
  faLocationDot,
  faPersonDress,
  faSackDollar,
  faSquarePlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import AddEvent from "./AddEvent";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import Events from "../Events";

const EventsList = async ({ username }: { username?: string }) => {
  const { userId } = auth();

  let events: any[] = [];

  if (username) {
    events = await prisma.event.findMany({
      where: {
        user: {
          username: username,
        },
        date: {
          gte: new Date(),
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  if (!username && userId) {
    const ids = [userId];
    events = await prisma.event.findMany({
      where: {
        userId: {
          in: ids,
        },
        date: {
          gte: new Date(),
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  // if (!username) return null;

  // Check if the profile belongs to the logged-in user
  // const isCurrentUserProfile =
  //   userId &&
  //   username ===
  //     (await prisma.user.findUnique({ where: { id: userId } }))?.username;

  return (
    <>
      <div className="tours_sec bg-transparent my-5">
        <h1 className="text-white mb-5 lg:ps-12 word txt_anim text-3xl font-bold flex gap-4 justify-items-end">
          {" "}
          <span>Upcoming Events</span>
          {/* {isCurrentUserProfile && ( */}
          <div>
            <span>
              <AddEvent />
            </span>
          </div>
          {/* )} */}
        </h1>
        <div className="">
          {events.length
            ? events.map((event) => <Events event={event} key={event.id} />)
            : "No Events found!"}
        </div>
      </div>
    </>
  );
};

export default EventsList;
