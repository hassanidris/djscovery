"use client";

import { updateProfile } from "@/lib/actions";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User } from "@prisma/client";
import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { useRouter } from "next/navigation";
import UpdateBtn from "./UpdateBtn";

const UpdateUser = ({ user }: { user: User }) => {
  const [open, setOpen] = useState(false);
  const [cover, setCover] = useState<any>(false);

  const [state, formAction] = useActionState(updateProfile, {
    success: false,
    error: false,
  });

  const router = useRouter();

  const handleClose = () => {
    setOpen(false);
    state.success && router.refresh();
  };

  // Prevent background scrolling when the modal is open
  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Clean up by removing the class when the component unmounts
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
        <div className="absolute w-screen h-screen top-0 left-0 bg-black bg-opacity-65 flex items-center justify-center z-50  ">
          <form
            action={(formData) =>
              formAction({ formData, cover: cover?.secure_url || "" })
            }
            className="p-12 bg-white rounded-lg shadow-md flex flex-col gap-2 w-full md:w-1/2 xl:w-1/3 relative overflow-y-scroll"
          >
            {/* TITLE */}
            <h1 className=" text-2xl font-semibold">Update Profile</h1>
            <div className="mt-4 text-sm text-gray-500">
              Use the navbar profile to change the avatar or username.
            </div>
            {/* COVER PIC UPLOAD */}

            <CldUploadWidget
              uploadPreset="djscovery"
              onSuccess={(result) => setCover(result.info)}
            >
              {({ open }) => {
                return (
                  <div
                    className="flex flex-col gap-4 my-4"
                    onClick={() => open()}
                  >
                    <label htmlFor="">Cover Picture</label>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <Image
                        src={user.cover || "/noCover.png"}
                        alt=""
                        width={48}
                        height={32}
                        className="w-12 h-8 rounded-md object-cover"
                      />
                      <span className="text-xs underline text-gray-600">
                        Change
                      </span>
                    </div>
                  </div>
                );
              }}
            </CldUploadWidget>

            {/* WRAPPER */}
            <div className="flex justify-start flex-wrap  gap-2 xl:gap-3">
              {/* INPUT */}
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="" className="text-xs text-gray-500">
                  Dj Name
                </label>
                <input
                  type="text"
                  placeholder={user.stageName || "Dj. Echo"}
                  className=" w-full ring-1 ring-gray-300 p-[13px] rounded-md text-sm"
                  name="stageName"
                />
              </div>

              {/* INPUT */}
              <div className="flex flex-col gap-1">
                <label htmlFor="" className="text-xs text-gray-500">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder={user.name || "John"}
                  className="ring-1 ring-gray-300 p-[13px] rounded-md text-sm"
                  name="name"
                />
              </div>

              {/* INPUT */}
              <div className="flex flex-col gap-1">
                <label htmlFor="" className="text-xs text-gray-500">
                  Surname
                </label>
                <input
                  type="text"
                  placeholder={user.surname || "Doe"}
                  className="ring-1 ring-gray-300 p-[13px] rounded-md text-sm"
                  name="surname"
                />
              </div>
              {/* INPUT */}
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="" className="text-xs text-gray-500">
                  Description
                </label>
                <input
                  type="text"
                  placeholder={user.description || "Life is beautiful..."}
                  className=" w-full ring-1 ring-gray-300 p-[13px] rounded-md text-sm"
                  name="description"
                />
              </div>
              {/* INPUT */}
              <div className="flex flex-col gap-1">
                <label htmlFor="" className="text-xs text-gray-500">
                  City
                </label>
                <input
                  type="text"
                  placeholder={user.city || "New York"}
                  className="ring-1 ring-gray-300 p-[13px] rounded-md text-sm"
                  name="city"
                />
              </div>

              {/* INPUT */}
              <div className="flex flex-col gap-1">
                <label htmlFor="" className="text-xs text-gray-500">
                  Country
                </label>
                <input
                  type="text"
                  placeholder={user.country || "USA"}
                  className="ring-1 ring-gray-300 p-[13px] rounded-md text-sm"
                  name="country"
                />
              </div>
              {/* INPUT */}

              {/* <div className="flex flex-col gap-1">
                <label htmlFor="" className="text-xs text-gray-500">
                  School
                </label>
                <input
                  type="text"
                  placeholder={user.school || "MIT"}
                  className="ring-1 ring-gray-300 p-[13px] rounded-md text-sm"
                  name="school"
                />
              </div> */}
              {/* INPUT */}

              {/* <div className="flex flex-col gap-1">
                <label htmlFor="" className="text-xs text-gray-500">
                  Work
                </label>
                <input
                  type="text"
                  placeholder={user.work || "Apple Inc."}
                  className="ring-1 ring-gray-300 p-[13px] rounded-md text-sm"
                  name="work"
                />
              </div> */}

              {/* INPUT */}
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="" className="text-xs text-gray-500">
                  Genres
                </label>
                <input
                  type="text"
                  placeholder={user.genres || "Hip hop, RnB, Techno,...."}
                  className="ring-1 ring-gray-300 p-[13px] rounded-md text-sm"
                  name="genres"
                />
              </div>

              {/* INPUT */}
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="" className="text-xs text-gray-500">
                  Website
                </label>
                <input
                  type="text"
                  placeholder={user.website || "www.djecho.com"}
                  className="ring-1 ring-gray-300 p-[13px] rounded-md text-sm"
                  name="website"
                />
              </div>
            </div>

            <UpdateBtn />
            {state.success && (
              <span className="text-green-500">Profile has been updated!</span>
            )}
            {state.error && (
              <span className="text-red-500">Something went wrong!</span>
            )}
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
