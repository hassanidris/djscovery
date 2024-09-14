import {
  faBriefcase,
  faCalendar,
  faGlobe,
  faLink,
  faLocation,
  faLocationDot,
  faSchool,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const UserMediaCard = ({ userId }: { userId?: string }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-4">
      {/* Top */}
      <div className="flex justify-between items-center font-medium">
        <span className="text-gray-500">User Media</span>
        <Link href="#" className="text-blue-500 text-xs">
          See all
        </Link>
      </div>
      {/* Bottom */}
      <div className=" flex gap-4 justify-between flex-wrap">
        <div className="relative w-1/5 h-24">
          <Image
            src="https://images.pexels.com/photos/625644/pexels-photo-625644.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt=""
            fill
            className=" object-cover rounded-md"
          />
        </div>
        <div className="relative w-1/5 h-24">
          <Image
            src="https://images.pexels.com/photos/625644/pexels-photo-625644.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt=""
            fill
            className=" object-cover rounded-md"
          />
        </div>
        <div className="relative w-1/5 h-24">
          <Image
            src="https://images.pexels.com/photos/625644/pexels-photo-625644.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt=""
            fill
            className=" object-cover rounded-md"
          />
        </div>
        <div className="relative w-1/5 h-24">
          <Image
            src="https://images.pexels.com/photos/625644/pexels-photo-625644.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt=""
            fill
            className=" object-cover rounded-md"
          />
        </div>
        <div className="relative w-1/5 h-24">
          <Image
            src="https://images.pexels.com/photos/625644/pexels-photo-625644.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt=""
            fill
            className=" object-cover rounded-md"
          />
        </div>
        <div className="relative w-1/5 h-24">
          <Image
            src="https://images.pexels.com/photos/625644/pexels-photo-625644.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt=""
            fill
            className=" object-cover rounded-md"
          />
        </div>
        <div className="relative w-1/5 h-24">
          <Image
            src="https://images.pexels.com/photos/625644/pexels-photo-625644.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt=""
            fill
            className=" object-cover rounded-md"
          />
        </div>
        <div className="relative w-1/5 h-24">
          <Image
            src="https://images.pexels.com/photos/625644/pexels-photo-625644.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt=""
            fill
            className=" object-cover rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

export default UserMediaCard;
