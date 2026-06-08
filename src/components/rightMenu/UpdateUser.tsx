"use client";

import { updateDjProfile } from "@/lib/actions";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User } from "@prisma/client";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import UpdateBtn from "./UpdateBtn";

const UpdateUser = ({ user }: { user: User }) => {
  const [open, setOpen] = useState(false);

  const [state, formAction] = useActionState(updateDjProfile, {
    success: false,
    error: false,
  });

  const router = useRouter();
  const isFirstRender = useRef(true);

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (state.success) {
      toast.success("Profile updated");
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error("Update failed. Please try again.");
    }
  }, [state]);

  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

  return (
    <div>
      <span
        className="text-blue-500 text-xs cursor-pointer"
        onClick={() => setOpen(true)}
      >
        Update
      </span>
      {open && (
        <div className="absolute w-screen h-screen top-0 left-0 bg-black bg-opacity-65 flex items-center justify-center z-50">
          <form
            action={(formData) => formAction({ formData })}
            className="p-12 bg-white rounded-lg shadow-md flex flex-col gap-2 w-full md:w-1/2 xl:w-1/3 relative overflow-y-scroll"
          >
            <h1 className="text-2xl font-semibold">Update DJ Profile</h1>
            <div className="mt-4 text-sm text-gray-500">
              Update your DJ stage name and bio.
            </div>

            <div className="flex justify-start flex-wrap gap-2 xl:gap-3">
              <div className="flex flex-col gap-1 w-full">
                <label className="text-xs text-gray-500">DJ Stage Name</label>
                <input
                  type="text"
                  placeholder="Dj. Echo"
                  className="w-full ring-1 ring-gray-300 p-3.25 rounded-md text-sm"
                  name="stageName"
                />
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label className="text-xs text-gray-500">Bio</label>
                <textarea
                  placeholder="Tell your fans about yourself..."
                  className="w-full ring-1 ring-gray-300 p-3.25 rounded-md text-sm resize-none"
                  name="bio"
                  rows={3}
                />
              </div>
            </div>

            <UpdateBtn />
            <div
              className="absolute text-xl right-3 top-3 cursor-pointer"
              onClick={handleClose}
            >
              <FontAwesomeIcon icon={faClose} />
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UpdateUser;
