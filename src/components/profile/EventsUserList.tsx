import {
  faArrowUpRightFromSquare,
  faLocationDot,
  faPersonDress,
  faSackDollar,
  faSquarePlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";
import AddEvent from "./AddEvent";
import { auth } from "@clerk/nextjs/server";
import { User } from "@prisma/client";

const EventsList = ({ user }: { user: User }) => {
  const { userId: currentUserId } = auth();
  return (
    <>
      <div className="tours_sec bg-transparent my-5">
        <h1 className="text-white mb-5 lg:ps-12 word txt_anim text-3xl font-bold flex gap-4 justify-items-end">
          {" "}
          <span>Upcoming Events</span>
          <span>{currentUserId && <AddEvent />}</span>
        </h1>
        <div className="">
          <div className="data_row">
            <div className="flex flex-wrap lg:flex-nowrap ">
              <div className="lg:w-1/5 pr-4 pl-4">
                <h2 className="num text-white flex">
                  {" "}
                  25 <sup className=" text-lg">Oct</sup>
                </h2>
              </div>
              <div className="lg:w-1/4 pr-4 pl-4">
                <p className="text-white font-bold text-2xl">
                  {" "}
                  {user.stageName}
                </p>
                <p className="loc">
                  {" "}
                  {user.city}, {user.country}{" "}
                </p>
              </div>
              <div className="lg:w-2/5 pr-4 pl-4 space-y-2 ">
                <h5 className="font-bold text-white">
                  {" "}
                  Restaurang Grappa Matsal & Bar{" "}
                </h5>
                <p className="text-white/80 text-sm">
                  {" "}
                  <span className="text-[#B3B3B3] inline-block mr-1">
                    {" "}
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      className="  h-4 w-4"
                    />
                  </span>{" "}
                  Nybrogatan 3, 632 18 Eskilstuna, Paris{" "}
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
                  No Dress Code{" "}
                </p>
                <p className="text-white/80 text-sm">
                  {" "}
                  <span className="text-[#B3B3B3]  inline-block mr-1">
                    {" "}
                    <FontAwesomeIcon
                      icon={faSackDollar}
                      className="  h-4 w-4"
                    />
                  </span>{" "}
                  No Entry Fees{" "}
                </p>
              </div>
              <div className="lg:w-1/5 pr-4 pl-4 space-y-3">
                <Link href="#" className="buy_butn flex gap-1 font-normal">
                  {" "}
                  Buy Ticket now{" "}
                  <FontAwesomeIcon
                    icon={faArrowUpRightFromSquare}
                    className=" h-3 w-3"
                  />
                </Link>
                <Link href="#" className="buy_butn flex gap-1 font-normal">
                  {" "}
                  Google Map{" "}
                  <FontAwesomeIcon
                    icon={faArrowUpRightFromSquare}
                    className=" h-3 w-3"
                  />
                </Link>
              </div>
            </div>
          </div>
          <div className="data_row">
            <div className="flex flex-wrap lg:flex-nowrap ">
              <div className="lg:w-1/5 pr-4 pl-4">
                <h2 className="num text-white flex">
                  {" "}
                  12 <sup className=" text-lg">Jun</sup>
                </h2>
              </div>
              <div className="lg:w-1/4 pr-4 pl-4">
                <p className="text-white font-bold text-2xl"> Dj. Vishnu </p>
                <p className="loc"> Bangalore, India </p>
              </div>
              <div className="lg:w-2/5 pr-4 pl-4 space-y-2 ">
                <h5 className="font-bold text-white">
                  {" "}
                  Restaurang Grappa Matsal & Bar{" "}
                </h5>
                <p className="text-white/80 text-sm">
                  {" "}
                  <span className="text-[#B3B3B3] inline-block mr-1">
                    {" "}
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      className="  h-4 w-4"
                    />
                  </span>{" "}
                  Nybrogatan 3, 632 18 Eskilstuna, Paris{" "}
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
                  No Dress Code{" "}
                </p>
                <p className="text-white/80 text-sm">
                  {" "}
                  <span className="text-[#B3B3B3]  inline-block mr-1">
                    {" "}
                    <FontAwesomeIcon
                      icon={faSackDollar}
                      className="  h-4 w-4"
                    />
                  </span>{" "}
                  No Entry Fees{" "}
                </p>
              </div>
              <div className="lg:w-1/5 pr-4 pl-4">
                <Link href="#" className="buy_butn flex gap-1 font-normal">
                  {" "}
                  Buy Ticket now{" "}
                  <FontAwesomeIcon
                    icon={faArrowUpRightFromSquare}
                    className=" h-3 w-3"
                  />
                </Link>
              </div>
            </div>
          </div>

          <div className="data_row">
            <div className="flex flex-wrap lg:flex-nowrap ">
              <div className="lg:w-1/5 pr-4 pl-4">
                <h2 className="num text-white flex">
                  {" "}
                  12 <sup className=" text-lg">Jun</sup>
                </h2>
              </div>
              <div className="lg:w-1/4 pr-4 pl-4">
                <p className="text-white font-bold text-2xl"> Dj. Explosive </p>
                <p className="loc"> Eskilstuna, Sweden </p>
              </div>
              <div className="lg:w-2/5 pr-4 pl-4 space-y-2 ">
                <h5 className="font-bold text-white">
                  {" "}
                  Restaurang Grappa Matsal & Bar{" "}
                </h5>
                <p className="text-white/80 text-sm">
                  {" "}
                  <span className="text-[#B3B3B3] inline-block mr-1">
                    {" "}
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      className="  h-4 w-4"
                    />
                  </span>{" "}
                  Nybrogatan 3, 632 18 Eskilstuna, Paris{" "}
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
                  No Dress Code{" "}
                </p>
                <p className="text-white/80 text-sm">
                  {" "}
                  <span className="text-[#B3B3B3]  inline-block mr-1">
                    {" "}
                    <FontAwesomeIcon
                      icon={faSackDollar}
                      className="  h-4 w-4"
                    />
                  </span>{" "}
                  No Entry Fees{" "}
                </p>
              </div>
              <div className="lg:w-1/5 pr-4 pl-4">
                <Link href="#" className="buy_butn flex gap-1 font-normal">
                  {" "}
                  Link not Available{" "}
                  {/* <FontAwesomeIcon
                        icon={faArrowUpRightFromSquare}
                        className=" h-3 w-3"
                      /> */}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventsList;
