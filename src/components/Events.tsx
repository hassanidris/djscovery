import React from "react";
import { Event as EventType, User } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faLocationDot,
  faPersonDress,
  faSackDollar,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import DeleteUserEvent from "./profile/DeleteUserEvent";

type EventListType = EventType & { user: User };

const Events = ({ event }: { event: EventListType }) => {
  const { userId } = auth();

  const eventDate = new Date(event.date);
  const eventDateStr = eventDate.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const year = eventDate.getFullYear();
  const month = eventDate.toLocaleString("en-US", { month: "short" }); // Get short month text
  const day = eventDate.getDate();
  console.log(eventDateStr);
  return (
    <div className="data_row">
      <div className="flex flex-wrap lg:flex-nowrap ">
        <div className="lg:w-1/5 pr-4 pl-4">
          <h2 className="num text-white flex">
            {" "}
            {day}
            <sup className=" text-lg">{month}</sup>
          </h2>
        </div>
        <div className="lg:w-1/4 pr-4 pl-4">
          <p className="text-white font-bold text-2xl">
            {" "}
            {event.user.stageName}
          </p>
          <p className="loc">
            {" "}
            {event.user.city}, {event.user.country}{" "}
          </p>
        </div>
        <div className="lg:w-2/5 pr-4 pl-4 space-y-2 ">
          <h5 className="font-bold text-white">
            {" "}
            {event.eventName || event.clubName}
          </h5>
          <p className="text-white/80 text-sm">
            {" "}
            <span className="text-[#B3B3B3] inline-block mr-1">
              {" "}
              <FontAwesomeIcon icon={faLocationDot} className="  h-4 w-4" />
            </span>{" "}
            {event.location || "No Address Provided"}
            {/* Nybrogatan 3, 632 18 Eskilstuna, Paris{" "} */}
          </p>
          <p className="text-white/80 text-sm">
            {" "}
            <span className="text-[#B3B3B3] inline-block mr-1">
              {" "}
              <FontAwesomeIcon
                icon={faPersonDress}
                className="  h-4 w-4"
              />{" "}
            </span>{" "}
            {event.dressCode || "No Dress Code"}
          </p>
          <p className="text-white/80 text-sm">
            {" "}
            <span className="text-[#B3B3B3]  inline-block mr-1">
              {" "}
              <FontAwesomeIcon icon={faSackDollar} className="  h-4 w-4" />
            </span>{" "}
            {event.entryFees || "No Entry Fees"}
          </p>
        </div>
        <div className="lg:w-1/5 pr-4 pl-4 space-y-3">
          {event.eventUrl ? (
            <Link
              href={`${event.eventUrl}`}
              target="_blank"
              className="justify-end text-xs flex gap-1 font-normal hover:text-[#523c90]"
            >
              {" "}
              {event.eventUrl}
              <FontAwesomeIcon
                icon={faArrowUpRightFromSquare}
                className=" h-3 w-3"
              />
            </Link>
          ) : (
            <span className=" text-xs text-[#c584f5] flex font-normal justify-end">
              No link provided
            </span>
          )}
          {event.mapUrl ? (
            <Link
              href={`${event.mapUrl}`}
              target="_blank"
              className="flex justify-end gap-1 font-normal text-[#c584f5] hover:text-[#523c90] text-xs cursor-pointer"
            >
              {" "}
              Google Map
              <FontAwesomeIcon
                icon={faArrowUpRightFromSquare}
                className=" h-3 w-3"
              />
            </Link>
          ) : (
            <span className=" text-xs text-[#c584f5] flex font-normal justify-end">
              No link provided
            </span>
          )}
          {userId === event.user.id && (
            <div>
              <DeleteUserEvent eventId={event.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
