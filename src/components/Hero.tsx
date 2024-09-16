import { faHeadphones } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

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
            <h1 className=" font-bold text-5xl w-3/4">
              Find the{" "}
              <span className="font-bold leading-snug text-h_purple">
                Perfect DJ{" "}
              </span>
              For You!{" "}
              <span className="font-bold leading-snug text-h_purple">
                <FontAwesomeIcon
                  icon={faHeadphones}
                  className=" w-12 h-12 inline"
                />
              </span>
            </h1>
            <p className=" mt-2 tracking-widest">
              On the world's first & largest DJ&apos;s Community.
            </p>

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
