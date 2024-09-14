"use client";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

const DeleteUserEvent = ({ eventId }: { eventId: number }) => {
  const [open, setOpen] = useState(false);
  // const deleteEventWithId = deleteEvent.bind(null, eventId);
  return (
    <form action="" className=" flex justify-end mt-8">
      <button className="text-red-500 flex justify-center items-center gap-1 text-xs">
        Delete
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </form>
  );
};

export default DeleteUserEvent;
