"use client";

import { updateDjProfile } from "@/lib/actions";
import { X } from "lucide-react";
import { User } from "@prisma/client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import UpdateBtn from "./UpdateBtn";

const UpdateUser = ({ user }: { user: User }) => {
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const [, formAction] = useActionState(
    async (
      prev: { success: boolean; error: boolean },
      payload: { formData: FormData },
    ) => {
      const result = await updateDjProfile(prev, payload);
      if (result.success) {
        toast.success("Profile updated");
        setOpen(false);
        router.refresh();
      } else if (result.error) {
        toast.error("Update failed. Please try again.");
      }
      return result;
    },
    { success: false, error: false },
  );

  const handleClose = () => {
    setOpen(false);
  };

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
        className="cursor-pointer text-xs text-blue-500"
        onClick={() => setOpen(true)}
      >
        Update
      </span>
      {open && (
        <div className="bg-opacity-65 absolute top-0 left-0 z-50 flex h-screen w-screen items-center justify-center bg-black">
          <form
            action={(formData) => formAction({ formData })}
            className="relative flex w-full flex-col gap-2 overflow-y-scroll rounded-lg bg-white p-12 shadow-md md:w-1/2 xl:w-1/3"
          >
            <h1 className="text-2xl font-semibold">Update DJ Profile</h1>
            <div className="mt-4 text-sm text-gray-500">
              Update your DJ stage name and bio.
            </div>

            <div className="flex flex-wrap justify-start gap-2 xl:gap-3">
              <div className="flex w-full flex-col gap-1">
                <label className="text-xs text-gray-500">DJ Stage Name</label>
                <input
                  type="text"
                  placeholder="Dj. Echo"
                  className="w-full rounded-md p-3.25 text-sm ring-1 ring-gray-300"
                  name="stageName"
                />
              </div>

              <div className="flex w-full flex-col gap-1">
                <label className="text-xs text-gray-500">Bio</label>
                <textarea
                  placeholder="Tell your fans about yourself..."
                  className="w-full resize-none rounded-md p-3.25 text-sm ring-1 ring-gray-300"
                  name="bio"
                  rows={3}
                />
              </div>
            </div>

            <UpdateBtn />
            <div
              className="absolute top-3 right-3 cursor-pointer text-xl"
              onClick={handleClose}
            >
              <X />
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UpdateUser;
