import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const AddReview = () => {
  const { userId } = auth();

  return (
    <form action="" className="bg-gray-800 p-6 rounded-lg">
      <textarea
        className="w-full bg-gray-900 text-white p-4 rounded-lg mb-4"
        placeholder="Type your review and rate the DJ"
        name="message"
      ></textarea>
      <div className="flex justify-end items-center gap-4">
        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
          Send
        </button>
      </div>
    </form>
  );
};

export default AddReview;
