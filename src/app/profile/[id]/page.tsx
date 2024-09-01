// import { UserProfile } from "@clerk/nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faInstagram,
  faSoundcloud,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

import Footer from "@/components/Footer";
import Subscription from "@/components/Subscription";
import Image from "next/image";
import { faSpotify } from "@fortawesome/free-brands-svg-icons/faSpotify";

const ProfilePage = () => {
  return (
    <>
      <div className=" mt-28">
        <section className="relative w-full h-[30vh] bg-[url('/profile-banner.png')] bg-cover bg-center ">
          <div className="absolute inset-0 bg-gradient-to-b from-black to-black/10 flex justify-center items-center">
            <h2 className="text-[40px] text-title text-white">
              Dj. Martin Garrix
            </h2>
          </div>
        </section>
        <section className="mt-8 w-full px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 flex space-y-8 md:space-y-0 justify-between gap-6">
          {/* <div className="flex-[5] bg-black grid grid-cols-1 md:grid-cols-2 ">
            <Image
              src="/rated-3.webp"
              alt=""
              width={300}
              height={400}
              className=" bg-cover bg-center rounded-lg"
            />
            <div className="flex flex-col justify-center items-center space-y-4"></div>
            image and info
          </div> */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-5 w-full md:w-3/4 space-x-4">
              <div className=" col-span-2">
                <img
                  src="/rated-3.webp"
                  alt="Dj. Martin Garrix"
                  className="w-full h-full rounded-lg mb-6 object-cover"
                />
              </div>
              <div className=" col-span-3">
                <h2 className="text-3xl font-bold">Dj. Martin Garrix</h2>
                <p className="text-gray-400">Real Name: Martin Garrix</p>
                <p className="text-gray-400">Date of Birth: 01/09/1985</p>
                <p className="text-gray-400">Location: The Netherlands</p>
                <p className="text-gray-400">
                  Genres: Progressive House, Big Room, Future Bass, Pop EDM
                </p>
                <p className="text-gray-400 mt-4">
                  Bio: Martin Garrix, born Martijn Garritsen, is a Dutch
                  electronic music producer and DJ who has taken the global
                  music scene by storm. At just 17 years old, he released his
                  breakout track "Animals," which catapulted him to
                  international fame.
                </p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/4 space-y-8 items-end">
            <div>
              <h3 className="text-xl font-bold">Music Samples</h3>
              <div className="flex space-x-4 mt-4 ">
                <a href="#" className="text-white/30 hover:text-white">
                  <FontAwesomeIcon icon={faSoundcloud} className=" h-8 w-8" />
                </a>
                <a href="#" className="text-white/30 hover:text-white">
                  <FontAwesomeIcon icon={faSpotify} className=" h-8 w-8" />
                </a>
                <a href="#" className="text-white/30 hover:text-white">
                  <FontAwesomeIcon icon={faYoutube} className=" h-8 w-8" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold">Social Media</h3>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-white/30 hover:text-white">
                  <FontAwesomeIcon icon={faFacebook} className=" h-8 w-8" />
                </a>
                <a href="#" className="text-white/30 hover:text-white">
                  <FontAwesomeIcon icon={faXTwitter} className=" h-8 w-8" />
                </a>
                <a href="#" className="text-white/30 hover:text-white">
                  <FontAwesomeIcon icon={faInstagram} className=" h-8 w-8" />
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="mt-8 w-full px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
          releases
        </section>
        <section className="mt-8 w-full px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Events */}
            <div className="col-span-1 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold">Events</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <p className="text-2xl font-bold">25 AUG, 2024</p>
                  <p>Ultra Music Festival</p>
                  <p className="text-gray-400">Anders Lume, FL</p>
                  <p className="text-gray-400">Dress Code: No</p>
                  <p className="text-gray-400">Entry Fee: No</p>
                </li>
                <li>
                  <p className="text-2xl font-bold">15 SEPT, 2024</p>
                  <p>Tomorrowland</p>
                  <p className="text-gray-400">Anasio, Boom, Belgium</p>
                  <p className="text-gray-400">Dress Code: No</p>
                  <p className="text-gray-400">Entry Fee: No</p>
                </li>
                <li>
                  <p className="text-2xl font-bold">05 OCT, 2024</p>
                  <p>Ushuaïa</p>
                  <p className="text-gray-400">Anders Lume, Ibiza, Spain</p>
                  <p className="text-gray-400">Dress Code: No</p>
                  <p className="text-gray-400">Entry Fee: No</p>
                </li>
              </ul>
            </div>

            {/* Gallery */}
            <div className="col-span-2 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold">Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 overflow-y-scroll h-[400px]">
                <img
                  src="https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Gallery Image 1"
                  className="w-full rounded-lg"
                />
                <img
                  src="https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Gallery Image 2"
                  className="w-full rounded-lg"
                />
                <img
                  src="https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Gallery Image 3"
                  className="w-full rounded-lg"
                />
                <img
                  src="https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Gallery Image 4"
                  className="w-full rounded-lg"
                />
                <img
                  src="https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Gallery Image 4"
                  className="w-full rounded-lg"
                />
                <img
                  src="https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Gallery Image 4"
                  className="w-full rounded-lg"
                />
                <img
                  src="https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Gallery Image 4"
                  className="w-full rounded-lg"
                />
                <img
                  src="https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Gallery Image 4"
                  className="w-full rounded-lg"
                />
                <img
                  src="https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Gallery Image 4"
                  className="w-full rounded-lg"
                />
                <img
                  src="https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Gallery Image 4"
                  className="w-full rounded-lg"
                />
                <img
                  src="https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Gallery Image 4"
                  className="w-full rounded-lg"
                />
                <img
                  src="https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Gallery Image 4"
                  className="w-full rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="">
          <div className="mt-8 w-full px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
            {/* Videos Section */}
            <div className="bg-gradient-to-r from-purple-800 to-black mt-12 py-12 px-6 rounded-lg">
              <h3 className="text-3xl font-bold text-center">Videos</h3>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <img
                    src="https://images.pexels.com/photos/3249760/pexels-photo-3249760.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Video 1"
                    className="w-full rounded-lg mb-4"
                  />
                  <a
                    href="#"
                    className="text-lg font-bold text-white hover:text-purple-400"
                  >
                    Watch Video
                  </a>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <img
                    src="https://images.pexels.com/photos/3249760/pexels-photo-3249760.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Video 2"
                    className="w-full rounded-lg mb-4"
                  />
                  <a
                    href="#"
                    className="text-lg font-bold text-white hover:text-purple-400"
                  >
                    Watch Video
                  </a>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <img
                    src="https://images.pexels.com/photos/3249760/pexels-photo-3249760.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Video 3"
                    className="w-full rounded-lg mb-4"
                  />
                  <a
                    href="#"
                    className="text-lg font-bold text-white hover:text-purple-400"
                  >
                    Watch Video
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mt-8 w-full px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
          {/* Reviews Section */}
          <div className="mt-12">
            <h3 className="text-3xl font-bold text-center mb-8">Reviews</h3>
            <div className="bg-gray-800 p-6 rounded-lg">
              <textarea
                className="w-full bg-gray-900 text-white p-4 rounded-lg mb-4"
                placeholder="Type your review and rate the DJ"
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
            </div>
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
        <Footer />
      </div>
    </>
  );
};

{
  /* <UserProfile path="/user-profile" /> */
}

export default ProfilePage;
