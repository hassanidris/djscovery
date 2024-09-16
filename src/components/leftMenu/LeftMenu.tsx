import React from "react";
import ProfileCard from "./ProfileCard";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faChartLine,
  faImage,
  faNewspaper,
  faShop,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { faViadeo } from "@fortawesome/free-brands-svg-icons";
import Ad from "../rightMenu/Ad";

const LeftMenu = ({ type }: { type: "home" | "profile" }) => {
  return (
    <div className=" flex flex-col gap-6">
      {type === "home" && <ProfileCard />}
      <div className="p-4 bg-h_blackLight/50 rounded-lg shadow-md text-sm text-h_white flex flex-col gap-2">
        <Link
          href="/"
          className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-600"
        >
          <FontAwesomeIcon icon={faNewspaper} className=" w-5 h-5" />
          <span>My Posts</span>
        </Link>
        <hr className="border-t-1 border-gray-600 w-[95%] self-center" />
        <Link
          href="/"
          className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-600"
        >
          <FontAwesomeIcon icon={faChartLine} className=" w-5 h-5" />
          <span>Activity</span>
        </Link>
        <hr className="border-t-1 border-gray-600 w-[95%] self-center px-3" />
        <Link
          href="/"
          className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-600"
        >
          <FontAwesomeIcon icon={faShop} className=" w-5 h-5" />
          <span>Marketplace</span>
        </Link>
        <hr className="border-t-1 border-gray-600 w-[95%] self-center" />
        <Link
          href="/"
          className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-600"
        >
          <FontAwesomeIcon icon={faCalendarDays} className=" w-5 h-5" />
          <span>Events</span>
        </Link>
        <hr className="border-t-1 border-gray-600 w-[95%] self-center" />
        <Link
          href="/"
          className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-600"
        >
          <FontAwesomeIcon icon={faImage} className=" w-5 h-5" />
          <span>Albums</span>
        </Link>
        <hr className="border-t-1 border-gray-600 w-[95%] self-center" />
        <Link
          href="/"
          className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-600"
        >
          <FontAwesomeIcon icon={faVideo} className=" w-5 h-5" />
          <span>Videos</span>
        </Link>
        <hr className="border-t-1 border-gray-600 w-[95%] self-center" />
        <Link
          href="/"
          className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-600"
        >
          <FontAwesomeIcon icon={faNewspaper} className=" w-5 h-5" />
          <span>News</span>
        </Link>
      </div>
      <Ad size="sm" />
    </div>
  );
};

export default LeftMenu;
