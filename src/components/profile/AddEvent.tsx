"use client";
import { faSquarePlus, faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User } from "@prisma/client";
import Link from "next/link";
import React, { useState } from "react";

const AddEvent = () => {
  const [open, setOpen] = useState(false);
  const [hasDressCode, setHasDressCode] = useState(false);
  const [hasEntryFee, setHasEntryFee] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <div>
        <span
          className="buy_butn flex items-center justify-end gap-1 font-thin text-[#c584f5] hover:text-[#523c90] text-[12px] cursor-pointer "
          onClick={() => setOpen(true)}
        >
          <FontAwesomeIcon icon={faSquarePlus} className=" h-4 w-4" />
          Add Event
        </span>
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/65 flex justify-center items-center z-50 overflow-y-scroll">
          <form
            action=""
            className=" relative p-12 bg-white rounded-lg shadow-md flex flex-col gap-2 w-full md:w-1/2 xl:w-1/3"
          >
            <h1 className=" text-2xl text-[#523c90] font-semibold">
              Add New Event
            </h1>
            {/* Fields here */}
            <div className=" flex flex-wrap justify-start gap-3 xl:gap-5 mt-4">
              {/* INPUT */}
              <div className=" flex flex-col gap-1">
                <label htmlFor="" className="text-xs text-gray-600 font-medium">
                  Event Date
                </label>
                <input
                  type="date"
                  //   placeholder={
                  //     user.dateOfBirth
                  //       ? new Date(user.dateOfBirth)
                  //           .toISOString()
                  //           .substring(0, 10)
                  //       : "1970-01-01"
                  //   }
                  className=" ring-1 ring-gray-300 p-2 rounded-md text-xs text-gray-800 font-normal"
                  name="dateOfBirth"
                />
              </div>

              {/* INPUT */}
              <div className=" flex flex-col gap-1">
                <label htmlFor="" className="text-xs text-gray-600 font-medium">
                  (Club / Bar) Name
                </label>
                <input
                  type="text"
                  //   placeholder={user.stageName || "Dj. John"}
                  className=" ring-1 ring-gray-300 p-2 rounded-md text-xs text-gray-800  font-normal"
                  name="stageName"
                />
              </div>
              {/* INPUT */}
              <div className=" flex flex-col gap-1">
                <label htmlFor="" className="text-xs text-gray-600 font-medium">
                  Event Name
                </label>
                <input
                  type="text"
                  //   placeholder={user.stageName || "Dj. John"}
                  className=" ring-1 ring-gray-300 p-2 rounded-md text-xs text-gray-800  font-normal"
                  name="stageName"
                />
              </div>
              {/* INPUT */}
              <div className=" flex flex-col gap-1 w-full">
                <label htmlFor="" className="text-xs text-gray-600 font-medium">
                  Address
                </label>
                <input
                  type="text"
                  //   placeholder={user.stageName || "Dj. John"}
                  className=" ring-1 ring-gray-300 p-2 rounded-md text-xs text-gray-800  font-normal"
                  name="stageName"
                />
              </div>

              {/* INPUT */}
              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs text-gray-600 font-medium">
                  Dress Code
                </label>
                <div className="flex items-center gap-4">
                  <label className="text-xs text-gray-600 font-normal">
                    <input
                      type="radio"
                      name="dressCode"
                      value="no"
                      checked={!hasDressCode}
                      onChange={() => setHasDressCode(false)}
                    />{" "}
                    No
                  </label>
                  <label className="text-xs text-gray-600 font-normal">
                    <input
                      type="radio"
                      name="dressCode"
                      value="yes"
                      checked={hasDressCode}
                      onChange={() => setHasDressCode(true)}
                    />{" "}
                    Yes
                  </label>
                </div>
                {hasDressCode && (
                  <input
                    type="text"
                    placeholder="Specify dress code"
                    className="ring-1 ring-gray-300 p-2 rounded-md text-xs text-gray-800 font-normal"
                    name="dressCodeDetails"
                  />
                )}
              </div>

              {/* INPUT */}
              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs text-gray-600 font-medium">
                  Entry Fee
                </label>
                <div className="flex items-center gap-4">
                  <label className="text-xs text-gray-600 font-normal">
                    <input
                      type="radio"
                      name="entryFee"
                      value="no"
                      checked={!hasEntryFee}
                      onChange={() => setHasEntryFee(false)}
                    />{" "}
                    No
                  </label>
                  <label className="text-xs text-gray-600 font-normal">
                    <input
                      type="radio"
                      name="entryFee"
                      value="yes"
                      checked={hasEntryFee}
                      onChange={() => setHasEntryFee(true)}
                    />{" "}
                    Yes
                  </label>
                </div>
                {hasEntryFee && (
                  <input
                    type="number"
                    placeholder="Enter fee amount"
                    className="ring-1 ring-gray-300 p-2 rounded-md text-xs text-gray-800 font-normal"
                    name="entryFeeAmount"
                  />
                )}
              </div>
              {/* INPUT */}
              <div className=" flex flex-col gap-1 w-full">
                <label htmlFor="" className="text-xs text-gray-600 font-medium">
                  Event Link
                </label>
                <input
                  type="text"
                  //   placeholder={user.stageName || "Dj. John"}
                  className=" ring-1 ring-gray-300 p-2 rounded-md text-xs text-gray-800 min-w-max"
                  name="stageName"
                />
              </div>

              {/* INPUT */}
              <div className=" flex flex-col gap-1 w-full">
                <label htmlFor="" className="text-xs text-gray-600 font-medium">
                  Google Map Link
                </label>
                <input
                  type="text"
                  //   placeholder={user.stageName || "Dj. John"}
                  className=" ring-1 ring-gray-300 p-2 rounded-md text-xs text-gray-800"
                  name="stageName"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-[#523c90] text-white p-2 mt-8 rounded-md text-sm"
            >
              Add
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
    </>
  );
};

export default AddEvent;
