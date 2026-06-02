import { faHeadphones } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <>
      <section className="bg-zinc-800 h-[40vh] lg:h-[50vh] w-full relative">
        <video
          className="w-full h-full object-cover bg-bottom"
          autoPlay
          muted
          loop
          disableRemotePlayback
        >
          <source src="/bnr.mp4" type="video/mp4" />
          {/* <source
          autoPlay
          src={`${BASENAME}/video/welcome_to_stockholm.mp4`}
          type="video/mp4"
        /> */}
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-40 z-10"></div>
        <div className="absolute top-0 left-0 h-full w-full flex justify-center sm:justify-start items-center z-10">
          <div className="flex flex-col px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 text-white ">
            <h1 className=" font-bold text-4xl md:text-7xl w-3/4">
              Find the{" "}
              <span className="font-bold leading-snug text-h_cyan">
                Perfect DJ{" "}
              </span>
              For You!{" "}
              <span className="font-bold leading-snug text-h_cyan">
                <FontAwesomeIcon
                  icon={faHeadphones}
                  className=" w-16 h-16 inline"
                />
              </span>
            </h1>
            <p className=" mt-2 tracking-widest">
              On the world&apos;s first & largest DJ&apos;s Community.
            </p>

            <div className="flex gap-4 mt-6">
              <Button
                asChild
                className="bg-h_cyan hover:bg-h_cyanDark text-black font-semibold h-auto py-3 px-6 text-sm md:text-base"
              >
                <Link href="/sign-up?role=dj">Join as DJ</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-h_cyan text-h_cyan hover:bg-h_cyan hover:text-black font-semibold h-auto py-3 px-6 text-sm md:text-base"
              >
                <Link href="/sign-up?role=organiser">Join as Organiser</Link>
              </Button>
            </div>

            {/* <h1 class="title text-white word txt_anim">
                        Find the <span class="color-primary fw-bold"> Perfect DJ </span>   <br>
                        ear You! 
                        <img src="images/headphone.png" class="icon" alt="">
                    </h1> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
