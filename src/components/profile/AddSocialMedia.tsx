"use client";
import { faSquarePlus, faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { PlusCircle, X } from "lucide-react";
import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faTiktok,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { socialPlatforms } from "@/lib/data";

const AddSocialMedia = () => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="">
      <div>
        <span
          className="buy_butn flex items-center justify-end gap-1 font-thin text-[#c584f5] hover:text-[#523c90] text-[12px] cursor-pointer "
          onClick={() => setOpen(true)}
        >
          <FontAwesomeIcon icon={faSquarePlus} className=" h-4 w-4" />
          Add
        </span>
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/65 flex justify-center items-center z-50 overflow-y-scroll">
          <form
            action=""
            className="relative p-12 bg-white rounded-lg shadow-md flex flex-col gap-2 w-full md:w-1/2 xl:w-1/3"
          >
            <h1 className=" text-2xl text-[#523c90] font-semibold mb-6">
              Add New Social Media Link
            </h1>
            <div className="space-y-4">
              {socialPlatforms.map((platform) => (
                <div className="flex gap-4 items-center" key={platform.id}>
                  <span className=" text-gray-600 font-normal w-20">
                    {platform.platformName}:
                  </span>
                  <input
                    type={platform.url}
                    placeholder="Enter URL"
                    className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-normal text-sm flex-1"
                  />
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="bg-[#523c90] text-white p-2 mt-8 rounded-md text-sm"
            >
              Save Changes
            </button>

            <div
              className=" absolute text-xl right-2 top-3 cursor-pointer"
              onClick={handleClose}
            >
              <FontAwesomeIcon
                icon={faSquareXmark}
                className=" h-8 w-8 text-[#523c90]"
              />
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddSocialMedia;
