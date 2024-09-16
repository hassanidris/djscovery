import Image from "next/image";
import Link from "next/link";
import React from "react";

const RecentAdded = () => {
  return (
    <div className="p-4 bg-h_blackLight/50 rounded-lg shadow-md text-sm flex flex-col gap-4">
      {/* Top */}
      <div className="flex justify-between items-center font-medium">
        <span className="text-gray-200">Recent Added Djs</span>
        <Link href="#" className="text-h_purple text-xs">
          See all
        </Link>
      </div>
      {/* User */}

      <div className=" flex items-center justify-between">
        <Link href="#">
          <div className=" flex items-center gap-4">
            <Image
              src="/rated-2.webp"
              alt=""
              width={40}
              height={40}
              className=" w-10 h-10 object-cover rounded-full ring-1 ring-gray-400"
            />
            <div className=" flex flex-col gap-1">
              <span className=" text-h_white">
                Dj. Dimitri Vegas & Like Mike
              </span>
              <span className=" text-gray-400 text-xs">Belgium</span>
            </div>
          </div>
        </Link>
        <div className="flex gap-3 justify-end">
          <button className="bg-h_purple hover:bg-h_purpleDark text-white text-xs px-2 py-1 rounded-md">
            Follow
          </button>
        </div>
      </div>
      <hr className="border-t-1 border-gray-800 w-full self-center" />
      <div className=" flex items-center justify-between">
        <Link href="#">
          <div className=" flex items-center gap-4">
            <Image
              src="/rated-3.webp"
              alt=""
              width={40}
              height={40}
              className=" w-10 h-10 object-cover rounded-full ring-1 ring-gray-400"
            />
            <div className=" flex flex-col gap-1">
              <span className=" text-h_white">Dj. Martin Garrix</span>
              <span className=" text-gray-400 text-xs">
                The Netherlands, Amesterdam
              </span>
            </div>
          </div>
        </Link>
        <div className="flex gap-3 justify-end">
          <button className="bg-h_purple hover:bg-h_purpleDark text-white text-xs px-2 py-1 rounded-md">
            Follow
          </button>
        </div>
      </div>
      <hr className="border-t-1 border-gray-800 w-full self-center" />
      <div className=" flex items-center justify-between">
        <Link href="#">
          <div className=" flex items-center gap-4">
            <Image
              src="/rated-4.webp"
              alt=""
              width={40}
              height={40}
              className=" w-10 h-10 object-cover rounded-full ring-1 ring-gray-400"
            />
            <div className=" flex flex-col gap-1">
              <span className=" text-h_white">Dj. Alok</span>
              <span className=" text-gray-400 text-xs">Brazil, Rio</span>
            </div>
          </div>
        </Link>
        <div className="flex gap-3 justify-end">
          <button className="bg-h_purple hover:bg-h_purpleDark text-white text-xs px-2 py-1 rounded-md">
            Follow
          </button>
        </div>
      </div>
      <hr className="border-t-1 border-gray-800 w-full self-center" />
      <div className=" flex items-center justify-between">
        <Link href="#">
          <div className=" flex items-center gap-4">
            <Image
              src="/rated-5.webp"
              alt=""
              width={40}
              height={40}
              className=" w-10 h-10 object-cover rounded-full ring-1 ring-gray-400"
            />
            <div className=" flex flex-col gap-1">
              <span className=" text-h_white">Dj. Timmy Trumpet</span>
              <span className=" text-gray-400 text-xs">Australia, Sydney</span>
            </div>
          </div>
        </Link>
        <div className="flex gap-3 justify-end">
          <button className="bg-h_purple hover:bg-h_purpleDark text-white text-xs px-2 py-1 rounded-md">
            Follow
          </button>
        </div>
      </div>
      <hr className="border-t-1 border-gray-800 w-full self-center" />
      <div className=" flex items-center justify-between">
        <Link href="#">
          <div className=" flex items-center gap-4">
            <Image
              src="/rated-6.webp"
              alt=""
              width={40}
              height={40}
              className=" w-10 h-10 object-cover rounded-full ring-1 ring-gray-400"
            />
            <div className=" flex flex-col gap-1">
              <span className=" text-h_white">Dj. Armin Van Buuren</span>
              <span className=" text-gray-400 text-xs">
                The Netherlands, Amesterdam
              </span>
            </div>
          </div>
        </Link>
        <div className="flex gap-3 justify-end">
          <button className="bg-h_purple hover:bg-h_purpleDark text-white text-xs px-2 py-1 rounded-md">
            Follow
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentAdded;
