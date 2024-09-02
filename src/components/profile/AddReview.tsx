import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const AddReview = () => {
  const testAction = async (formData: FormData) => {
    "use server";
    const { userId } = auth();

    console.log(userId + "helloooooooooooooo");

    if (!userId) return;
    const message = formData.get("message") as string;
    try {
      const res = await prisma.review.create({
        data: {
          message: message,
          user: {
            connect: {
              id: userId,
            },
          },
          dj: {
            connect: {
              id: "cm0kvymcx0000iu6uyfd9ewe0",
            },
          },
        },
      });
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form action={testAction} className="bg-gray-800 p-6 rounded-lg">
      <textarea
        className="w-full bg-gray-900 text-white p-4 rounded-lg mb-4"
        placeholder="Type your review and rate the DJ"
        name="message"
      ></textarea>
      <div className="flex justify-end items-center gap-4">
        <div className="flex space-x-1 ">
          {/* Star Rating */}
          <FontAwesomeIcon icon={faStar} className=" h-4 w-4" />
          <FontAwesomeIcon icon={faStar} className=" h-4 w-4" />
          <FontAwesomeIcon icon={faStar} className=" h-4 w-4" />
          <FontAwesomeIcon icon={faStar} className=" h-4 w-4" />
          <FontAwesomeIcon icon={faStar} className=" h-4 w-4" />
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
          Send
        </button>
      </div>
    </form>
  );
};

export default AddReview;
