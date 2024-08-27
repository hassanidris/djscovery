import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className=" bg-[#2E2D2D]">
      <div className="w-full px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 py-16 space-y-12 md:flex items-start justify-between gap-24">
        <div className=" flex-1 space-y-6">
          <Image src="/logo.svg" alt="" width={160} height={160} />
          <p className=" leading-loose text-base">
            DJscovery is your go-to hub for showcasing your talent and
            connecting with fans. Whether you're new or established, bring your
            music, bio, events, and more into one accessible profile. Our vision
            is to build a vibrant community where DJs can share their unique
            sounds, grow their audience, and shape the future of music. Join us
            to promote your craft and be part of a movement that celebrates
            creativity and the power of music to unite.
          </p>

          <div className="flex space-x-4">
            <Link
              href="#"
              className="text-white border py-3 px-5 rounded-lg hover:bg-white/25"
            >
              <Image src="/w-icon-facebook.svg" alt="" width={10} height={10} />
            </Link>

            <Link
              href="#"
              className="text-white border py-3 px-5 rounded-lg hover:bg-white/25"
            >
              <Image src="/w-icon-instgram.svg" alt="" width={20} height={20} />
            </Link>
            <Link
              href="#"
              className="text-white border py-3 px-5 rounded-lg hover:bg-white/25"
            >
              <Image src="/w-icon-twitter.svg" alt="" width={20} height={20} />
            </Link>
            <Link
              href="#"
              className="text-white border py-3 px-5 rounded-lg hover:bg-white/25"
            >
              <Image src="/w-icon-linkedin.svg" alt="" width={20} height={20} />
            </Link>
          </div>
        </div>
        <div className=" flex-1">
          {/* Form  */}
          <div className="mb-4 space-y-2">
            <h4 className="text-xl font-bold">Let's connect</h4>
            <p className="text-base">
              Reach out and let the magic of collaboration illuminate our skies.
            </p>
          </div>
          <form>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full text-sm bg-white/5 text-white p-3 rounded-lg ring-white/20 focus:outline-none ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full text-sm bg-white/5 text-white p-3 rounded-lg ring-white/20 focus:outline-none ring-2 focus:ring-purple-600"
              />
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Message"
                className="w-full text-sm bg-white/5 text-white p-3 rounded-lg ring-white/20 focus:outline-none ring-2 focus:ring-purple-600 h-32"
              ></textarea>
            </div>
            <button
              type="submit"
              className="inline-block bg-red-600 text-white py-3 px-8 rounded-lg hover:bg-red-700 transition-colors duration-300"
            >
              Send
            </button>
          </form>
        </div>
      </div>
      <div className=" border-t-[1px] border-white/60 text-center py-6">
        <p className=" text-white/60">
          &copy; 2024 DJSCOVERY. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
