import Image from "next/image";
import Link from "next/link";
import React from "react";

const Subscription = () => {
  return (
    <section
      className="mt-16 relative text-white py-28 bg-no-repeat bg-right bg-cover md:bg-contain bg-scroll"
      style={{
        backgroundImage: "url('/register-banner.png')",
        backgroundPositionX: "right",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-purple-800/15 z-10" />
      <div className="relative z-20 text-left px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-6 text-title">
            Inspire and Be Discovered
          </h2>
          <p className="text-lg mb-8 max-w-3xl leading-loose">
            Join our DJ community to showcase your talent, share your story, and
            reach a wider audience. Gather all your information in one place and
            inspire others with your beats!
          </p>
          <Link
            href="/register"
            className="inline-block bg-red-600 text-white py-3 px-8 rounded-lg hover:bg-red-700 transition-colors duration-300"
          >
            Register Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Subscription;
