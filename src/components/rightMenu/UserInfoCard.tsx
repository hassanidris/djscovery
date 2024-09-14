import {
  faBriefcase,
  faCalendar,
  faLink,
  faLocationDot,
  faSchool,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";

const UserInfoCard = ({ userId }: { userId?: string }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-4">
      {/* Top */}
      <div className="flex justify-between items-center font-medium">
        <span className="text-gray-500">User Information</span>
        <Link href="#" className="text-blue-500 text-xs">
          See all
        </Link>
      </div>
      {/* Bottom */}
      <div className=" flex flex-col gap-4 text-gray-500">
        <div className=" flex items-center gap-2">
          <span className=" text-xl text-black">Lloyd Fleming</span>
          <span className=" text-sm">@lloyd</span>
        </div>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi neque
          odit harum. Quos laborum mollitia cupiditate facilis, dicta omnis.
        </p>
        <div className=" flex items-center gap-2">
          <FontAwesomeIcon icon={faLocationDot} className=" w-4 h-4" />
          <span>
            Living in <b>Denver</b>
          </span>
        </div>
        <div className=" flex items-center gap-2">
          <FontAwesomeIcon icon={faSchool} className=" w-4 h-4" />
          <span>
            Went to <b>Arafat</b>
          </span>
        </div>
        <div className=" flex items-center gap-2">
          <FontAwesomeIcon icon={faBriefcase} className=" w-4 h-4" />
          <span>
            Work at <b>Google</b>
          </span>
        </div>
        <div className=" flex items-center justify-between">
          <div className=" flex items-center gap-2">
            <FontAwesomeIcon icon={faLink} className=" w-4 h-4" />
            <Link
              href="#"
              target="_blank"
              className="text-blue-500 font-medium"
            >
              www.google.com
            </Link>
          </div>
          <div className="flex gap-1 items-center">
            <FontAwesomeIcon icon={faCalendar} className=" w-4 h-4" />
            <span>Joined November 2024</span>
          </div>
        </div>
        <button className=" bg-blue-500 text-white text-sm rounded-md p-2">
          Follow
        </button>
        <span className=" text-red-400 self-end text-xs cursor-pointer">
          Block User
        </span>
      </div>
    </div>
  );
};

export default UserInfoCard;
