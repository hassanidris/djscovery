"use client";
import React from "react";
import { useFormStatus } from "react-dom";

const AddEventBtn = () => {
  const { pending } = useFormStatus();
  return (
    <button
      className=" bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
      disabled={pending}
    >
      {pending ? (
        <div className=" flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900">
            Adding
          </div>
        </div>
      ) : (
        "Add"
      )}
    </button>
  );
};

export default AddEventBtn;
