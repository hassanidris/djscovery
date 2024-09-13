"use client";
import { updateInformation } from "@/lib/actions";
import { faSquareXmark, faUserPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User } from "@prisma/client";
import Image from "next/image";
import React, { useState } from "react";

const UpdateUserCardInfo = ({
  user,
  availableGenres,
  userGenres, // Receive the user's current genres as an array of strings
}: {
  user: User;
  availableGenres: string[];
  userGenres: string[]; // Expect an array of genre names
}) => {
  const [open, setOpen] = useState(false);
  const [genres, setGenres] = useState(userGenres); // Initialize with user's current genres
  const [newGenre, setNewGenre] = useState(""); // State for adding new genre

  // Filter available genres to remove those already selected by the user
  const availableGenresForSelection = availableGenres.filter(
    (genre) => !genres.includes(genre)
  );

  const handleClose = () => {
    setOpen(false);
  };

  const handleSelectGenre = (selectedGenre: string) => {
    if (!genres.includes(selectedGenre)) {
      setGenres([...genres, selectedGenre]);
    }
  };

  const handleRemoveGenre = (genreToRemove: string) => {
    setGenres(genres.filter((genre) => genre !== genreToRemove));
  };

  return (
    <div className=" relative">
      <div className=" flex gap-2 font-thin text-[#c584f5] text-[12px] cursor-pointer ">
        <span
          className="buy_butn flex justify-end gap-2 font-thin text-[#c584f5] hover:text-[#523c90] text-[12px] cursor-pointer absolute top-2 right-2 min-w-28"
          onClick={() => setOpen(true)}
        >
          <FontAwesomeIcon icon={faUserPen} className=" h-4 w-4" />
          <span className="w-min text-nowrap">Update information</span>
        </span>
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/65 flex justify-center items-center z-50 overflow-y-scroll">
          <form
            action={updateInformation}
            // onSubmit={handleSubmit}
            method="post" // Change to "post" if you're using a server
            className=" relative p-12 bg-white rounded-lg shadow-md flex flex-col gap-2 w-full md:w-1/2 xl:w-1/3"
          >
            <h1 className=" text-3xl text-[#523c90] font-semibold">
              Update Profile
            </h1>
            <p>Use the navbar profile to change the avatar or username</p>
            <div className=" flex flex-col gap-4 my-3">
              <label htmlFor="" className="text-sm text-gray-600 font-medium">
                Cover Picture
              </label>
              <div className=" flex items-center gap-2 cursor-pointer">
                <Image
                  src={user.cover || "/noCover.png"}
                  alt=""
                  width={48}
                  height={32}
                  className=" w-12 h-8 rounded-md object-cover"
                />
                <span className=" text-xs underline text-gray-600">Change</span>
              </div>
            </div>
            <div className=" flex flex-wrap justify-start gap-3 xl:gap-5">
              {/* INPUT */}
              <div className=" flex flex-col gap-1">
                <label htmlFor="" className="text-xs text-gray-600 font-medium">
                  Stage Name
                </label>
                <input
                  type="text"
                  placeholder={user.stageName || "Dj. John"}
                  className=" ring-1 ring-gray-300 p-2 rounded-md text-xs text-gray-800"
                  name="stageName"
                />
              </div>

              {/* INPUT */}
              <div className=" flex flex-col gap-1">
                <label htmlFor="" className="text-xs text-gray-600 font-medium">
                  Real Name
                </label>
                <input
                  type="text"
                  placeholder={user.realName || "Daniel"}
                  className=" ring-1 ring-gray-300 p-2 rounded-md text-xs text-gray-800"
                  name="realName"
                />
              </div>

              {/* INPUT */}
              {/* <div className=" flex flex-col gap-1">
                <label htmlFor="" className="text-xs text-gray-600 font-medium">
                  Date of Birth
                </label>
                <input
                  type="date"
                  placeholder={
                    user.dateOfBirth
                      ? new Date(user.dateOfBirth)
                          .toISOString()
                          .substring(0, 10)
                      : "1970-01-01"
                  }
                  className=" ring-1 ring-gray-300 p-2 rounded-md text-xs text-gray-800"
                  name="dateOfBirth"
                />
              </div> */}

              {/* INPUT */}
              <div className=" flex flex-col gap-1">
                <label htmlFor="" className="text-xs text-gray-600 font-medium">
                  City
                </label>
                <input
                  type="text"
                  placeholder={user.city || "Eskilstuna"}
                  className=" ring-1 ring-gray-300 p-2 rounded-md text-xs text-gray-800"
                  name="city"
                />
              </div>

              {/* INPUT */}

              <div className=" flex flex-col gap-1">
                <label htmlFor="" className="text-xs text-gray-600 font-medium">
                  Country
                </label>
                <input
                  type="text"
                  placeholder={user.country || "Sweden"}
                  className=" ring-1 ring-gray-300 p-2 rounded-md text-xs text-gray-800"
                  name="country"
                />
              </div>

              {/* INPUT */}
              {/* Genre Selection */}
              <div className="flex flex-col gap-1 w-full">
                <label
                  htmlFor="genres"
                  className="text-xs text-gray-600 font-medium"
                >
                  Genres
                </label>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <div
                      key={genre}
                      className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-2 text-gray-800 text-xs"
                    >
                      {genre}
                      <button
                        type="button"
                        onClick={() => handleRemoveGenre(genre)}
                        className="text-red-600 text-sm"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>

                {/* Genre selection dropdown */}
                <select
                  onChange={(e) => handleSelectGenre(e.target.value)}
                  className="ring-1 ring-gray-300 p-2 rounded-md text-xs text-gray-800"
                >
                  <option value="" disabled selected>
                    Select a genre
                  </option>
                  {availableGenresForSelection.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* INPUT */}

              <div className=" flex flex-col gap-1">
                <label htmlFor="" className="text-xs text-gray-600 font-medium">
                  Bio
                </label>
                <textarea
                  placeholder={user.bio || "Enter your biography here..."}
                  className=" ring-1 ring-gray-300 p-2 rounded-md text-xs text-gray-800 w-full"
                  rows={4}
                  cols={80}
                  name="bio"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-[#523c90] text-white p-2 mt-8 rounded-md"
            >
              Update
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

export default UpdateUserCardInfo;
