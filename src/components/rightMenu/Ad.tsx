import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import React from "react";

const Ad = ({ size }: { size: "sm" | "md" | "lg" }) => {
  return (
    <div className="p-4 bg-h_blackLight/50 rounded-lg shadow-md text-sm ">
      {/* TOP */}
      <div className="flex items-center justify-between text-gray-200 font-medium">
        <span>Sponsored Ads</span>
        {/* <Image src="/more.png" alt="" width={16} height={16} /> */}
        <FontAwesomeIcon icon={faEllipsis} className=" text-gray-200 w-4 h-4" />
      </div>
      {/* BOTTOM */}
      <div
        className={`flex flex-col mt-4 ${size === "sm" ? "gap-2" : "gap-4"}`}
      >
        <div
          className={`relative w-full ${
            size === "sm" ? "h-24" : size === "md" ? "h-36" : "h-48"
          }`}
        >
          <Image
            src="https://images.pexels.com/photos/63703/pexels-photo-63703.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt=""
            fill
            className="rounded-lg object-cover ring-1 ring-gray-400"
          />
        </div>
        <div className="flex items-center gap-4">
          <Image
            src="https://images.pexels.com/photos/23193135/pexels-photo-23193135.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
            alt=""
            width={24}
            height={24}
            className="rounded-full w-6 h-6 object-cover ring-1 ring-gray-400"
          />
          <span className=" text-h_purple font-medium">
            Dj Controller for Sell
          </span>
        </div>
        <div className=" text-h_white">
          <p className={size === "sm" ? "text-xs" : "text-sm"}>
            {size === "sm"
              ? "I'm selling my DJ controller, which is in excellent condition."
              : size === "md"
              ? "I'm selling my DJ controller, which is in excellent condition. It features a range of built-in effects and is fully compatible with popular DJ software. I've kept it well-maintained and am offering it at a competitive price. Feel free to reach out for more details or to arrange a viewing!"
              : "I'm selling my DJ controller, which is in excellent condition. It features a range of built-in effects and is fully compatible with popular DJ software. I've kept it well-maintained and am offering it at a competitive price. Feel free to reach out for more details or to arrange a viewing!"}
          </p>
        </div>
        <button className="bg-gray-200 text-gray-500 p-2 text-xs rounded-lg">
          Learn more
        </button>
      </div>
    </div>
  );
};

export default Ad;
