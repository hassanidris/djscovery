import Image from "next/image";
import Link from "next/link";
import React from "react";

const DJS = [
  {
    id: 1,
    imgSrc: "/rated-2.webp",
    name: "Dj. Dimitri Vegas & Like Mike",
    location: "Belgium",
  },
  {
    id: 2,
    imgSrc: "/rated-3.webp",
    name: "Dj. Martin Garrix",
    location: "The Netherlands, Amsterdam",
  },
  { id: 3, imgSrc: "/rated-4.webp", name: "Dj. Alok", location: "Brazil, Rio" },
  {
    id: 4,
    imgSrc: "/rated-5.webp",
    name: "Dj. Timmy Trumpet",
    location: "Australia, Sydney",
  },
  {
    id: 5,
    imgSrc: "/rated-6.webp",
    name: "Dj. Armin Van Buuren",
    location: "The Netherlands, Amsterdam",
  },
];

const RecentAdded = () => {
  return (
    <div className="bg-h_blackLight/50 flex flex-col gap-4 rounded-lg p-4 text-sm shadow-md">
      {/* Top */}
      <div className="flex items-center justify-between font-medium">
        <span className="text-gray-200">Recent Added Djs</span>
        <Link href="#" className="text-h_red/80 text-xs">
          See all
        </Link>
      </div>
      {/* Users */}
      {DJS.map((dj, index) => (
        <React.Fragment key={dj.id}>
          <div className="flex items-center justify-between">
            <Link href="#">
              <div className="flex items-center gap-4">
                <Image
                  src={dj.imgSrc}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover ring-1 ring-gray-400"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-h_white">{dj.name}</span>
                  <span className="text-xs text-gray-400">{dj.location}</span>
                </div>
              </div>
            </Link>
            <div className="flex justify-end gap-3">
              <button className="bg-h_red hover:bg-h_redDark rounded-md px-2 py-1 text-xs text-white">
                Follow
              </button>
            </div>
          </div>
          {index < DJS.length - 1 && (
            <hr className="w-full self-center border-t border-gray-800" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default RecentAdded;
