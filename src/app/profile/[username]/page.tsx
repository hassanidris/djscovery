// import { UserProfile } from "@clerk/nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faStar } from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faInstagram,
  faItunes,
  faSoundcloud,
  faTiktok,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";

import Footer from "@/components/Footer";
import Subscription from "@/components/Subscription";
import Image from "next/image";
import { faSpotify } from "@fortawesome/free-brands-svg-icons/faSpotify";
import AddReview from "@/components/profile/AddReview";
import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import "@/lib/swiper.js";
import EventsUserList from "@/components/profile/EventsUserList";
import UserCardInfo from "@/components/profile/UserCardInfo";
import SocialMediaList from "@/components/profile/SocialMediaList";
import UserPhotoGallery from "@/components/profile/UserPhotoGallery";
// import Events from "@/components/"

const ProfilePage = async ({ params }: { params: { username: string } }) => {
  const username = params.username;
  const user = await prisma.user.findFirst({
    where: {
      username,
    },
    include: {
      genres: {
        include: {
          genre: true, // Include the Genre model inside UserGenre
        },
      },
    },
  });

  // Fetch all available genres from the database
  const availableGenres = await prisma.genre.findMany({
    select: {
      name: true, // Only fetch the name of the genre
    },
  });

  if (!user) return notFound();

  // Extract the genre names from availableGenres
  const genreNames = availableGenres.map((genre) => genre.name);

  const { userId: currentUserID } = auth();
  return (
    <>
      <section className="relative w-full h-[30vh] bg-[url('/profile-banner.png')] bg-cover bg-center  mt-28 ">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-black/10 flex justify-center items-center">
          <h2 className="text-[40px] text-title text-white">
            {user?.stageName}
          </h2>
        </div>
      </section>
      <div className="profile_pg section">
        <section className="mt-8 w-full px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 flex space-y-8 md:space-y-0 justify-between gap-6 ">
          <div className="flex flex-wrap ">
            <div className="lg:w-3/4 pr-4 pl-4">
              <UserCardInfo user={user} availableGenres={genreNames} />
            </div>
            <div className="lg:w-1/4 pr-4 pl-4">
              <div className="sm_box space-y-6">
                <SocialMediaList user={user} />
                <div className="">
                  <h6 className="text-white mb-3 font-bold"> Music Samples </h6>
                  <div className="social_links text-white/30 flex flex-wrap ">
                    <Link href="#" className=" mb-1">
                      <FontAwesomeIcon
                        icon={faSpotify}
                        className=" h-8 w-8  bg-black hover:text-[#523c90] hover:bg-white/90 p-1 rounded-lg"
                      />
                    </Link>
                    <Link href="#" className=" mb-1">
                      <FontAwesomeIcon
                        icon={faSoundcloud}
                        className=" h-8 w-8  bg-black hover:text-[#523c90] hover:bg-white/90 p-1 rounded-lg"
                      />
                    </Link>
                    <Link href="#" className="mb-1">
                      <FontAwesomeIcon
                        icon={faItunes}
                        className=" h-8 w-8  bg-black hover:text-[#523c90] hover:bg-white/90 p-1 rounded-lg"
                      />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="sm_box">
                <h6 className="text-white mb-3 font-bold">
                  {" "}
                  Collaboration with Artist{" "}
                </h6>
                <div className="col_artist"> “Gold Skies” (2014) </div>
                <div className="col_artist"> “Sentio” (2022) </div>
              </div>
            </div>
          </div>
        </section>
        {/* <section className="mt-8 w-full px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
          releases
        </section> */}
        <section className="mt-16 w-full px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
          {/* <Events username={user.username} /> */}
          <EventsUserList user={user} />
        </section>
        <section className="mt-16 ">
          <UserPhotoGallery />
        </section>

        <section className="mt-8 w-full px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
          {/* Reviews Section */}
          <div className="mt-12">
            <h3 className="text-3xl font-bold text-center mb-8">Reviews</h3>

            <AddReview />
            <div className="mt-8 space-y-8">
              {/* Review Item */}
              <div className="bg-gray-800 p-6 rounded-lg flex items-start">
                <img
                  src="/images/reviewer1.jpg"
                  alt="Reviewer 1"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="text-lg font-bold">Veronika Limonovna</p>
                  <p className="text-gray-400 text-sm">Moscow, Russia</p>
                  <p className="mt-2">Great DJ! Really enjoyed the set!</p>
                  <div className="flex space-x-1 mt-4">
                    {/* Star Rating */}
                    <FontAwesomeIcon
                      icon={faStar}
                      className=" h-4 w-4 text-yellow-500"
                    />
                    <FontAwesomeIcon
                      icon={faStar}
                      className=" h-4 w-4 text-yellow-500"
                    />
                    <FontAwesomeIcon
                      icon={faStar}
                      className=" h-4 w-4 text-yellow-500"
                    />
                    <FontAwesomeIcon icon={faStar} className=" h-4 w-4" />
                    <FontAwesomeIcon icon={faStar} className=" h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* More reviews... */}
              <button className="block w-full bg-gray-700 text-white font-bold py-3 rounded-lg text-center mt-4">
                Load More Reviews
              </button>
            </div>
          </div>
        </section>
        <Subscription />
      </div>

      <Footer />
    </>
  );
};

{
  /* <UserProfile path="/user-profile" /> */
}

export default ProfilePage;
