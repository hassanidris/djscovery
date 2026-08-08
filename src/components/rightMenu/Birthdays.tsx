import Image from "next/image";
import Link from "next/link";
import React from "react";

const Birthdays = () => {
  return (
    <div className="bg-h_blackLight/50 flex flex-col gap-4 rounded-lg p-4 text-sm shadow-md">
      {/* TOP */}
      <div className="flex items-center justify-between font-medium">
        <span className="text-gray-200">Birthdays</span>
      </div>
      {/* USER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="https://images.pexels.com/photos/18207381/pexels-photo-18207381/free-photo-of-window-in-bar.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
            alt=""
            width={40}
            height={40}
            className="right-1 h-10 w-10 rounded-full object-cover ring-gray-300"
          />
          <span className="font-semibol text-h_white">Wayne Burton</span>
        </div>
        <div className="flex justify-end gap-3">
          <button className="bg-h_red hover:bg-h_redDark rounded-md px-2 py-1 text-xs text-white">
            Celebrate
          </button>
        </div>
      </div>
      {/* UPCOMING */}
      <div className="right-1 flex items-center gap-4 rounded-lg bg-slate-100 p-4 ring-gray-300">
        <Image src="/gift.png" alt="" width={24} height={24} />
        <Link href="/" className="flex flex-col gap-1 text-xs">
          <span className="font-semibold text-gray-700">
            Upcoming Birthdays
          </span>
          <span className="text-gray-400">
            See other 16 have upcoming birthdays
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Birthdays;
