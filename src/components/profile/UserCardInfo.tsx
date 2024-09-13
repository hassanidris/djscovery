import { faUserPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User as PrismaUser } from "@prisma/client";
import Link from "next/link";
import React from "react";
import UpdateUserCardInfo from "./UpdateUserCardInfo";
import { auth } from "@clerk/nextjs/server";

// Define types for User and Genre
type Genre = {
  id: string;
  name: string;
};

type UserGenre = {
  genre: Genre;
};

type User = PrismaUser & {
  genres: UserGenre[];
};

const UserCardInfo = ({
  user,
  availableGenres,
}: {
  user: User;
  availableGenres: string[];
}) => {
  const { userId: currentUserId } = auth();

  // Filter only the user's genres that are also available in the database
  const userGenreNames = user.genres
    .map((userGenre) => userGenre.genre.name)
    .filter((genre) => availableGenres.includes(genre));

  return (
    <div className="prof_box">
      <div className="flex flex-wrap relative">
        <div className=" absolute top-0 right-0">
          {currentUserId === user.id ? (
            <UpdateUserCardInfo
              user={user} // Pass the full user object if needed
              availableGenres={availableGenres} // Available genres as a list of strings
              userGenres={userGenreNames} // Pass the user's current genres as an array of strings
            />
          ) : null}
        </div>
        <div className="lg:w-2/5 pr-4 pl-4">
          <img src={user.avatar || "/noAvatar.png"} className="secImg" alt="" />
        </div>
        <div className="lg:w-3/5 pr-4 pl-4">
          <div className="flex-auto p-6">
            <h6 className="name font-bold text-white text-2xl mb-4">
              {user.stageName}
            </h6>
            <div className="">
              {user.realName && (
                <p>
                  <span className="text-white"> Real Name:</span>{" "}
                  {user.realName}
                </p>
              )}
              {user.city && (
                <p>
                  <span className="text-white"> City:</span> {user.city}
                </p>
              )}
              {user.country && (
                <p>
                  <span className="text-white"> Country:</span> {user.country}
                </p>
              )}

              <p className="p">
                <span className="text-white"> Date:</span> 20 July 2024
              </p>

              {/* Genres Section */}
              <div className="mb-4">
                <h6 className="text-white mb-3">Genres:</h6>
                <div className="genres flex flex-wrap">
                  {userGenreNames.length > 0 ? (
                    userGenreNames.map((genre) => (
                      <span
                        key={genre}
                        className="bg-gray-800 text-white px-2 py-1 rounded mr-2 mb-2 text-xs"
                      >
                        {genre}
                      </span>
                    ))
                  ) : (
                    <p className="text-white">No genres listed.</p>
                  )}
                </div>
              </div>

              {/* Bio Section */}
              {user.bio && (
                <p>
                  <span className="text-white"> Bio: </span> {user.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCardInfo;
