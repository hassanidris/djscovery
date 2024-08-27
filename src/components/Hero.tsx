import Image from "next/image";
import React from "react";

const Hero = () => {
  return (
    <section className="bg-gradient-to-b from-[#8951E6] to-[#692fdc] py-8">
      <div className="container mx-auto flex justify-between items-center">
        <p className=" text-2xl text-white w-[45ch] leading-loose tracking-wide">
          Join thousands of DJs, explore diverse genres, and connect with music
          lovers in cities worldwide.
        </p>
        <div className=" flex gap-10 ">
          <div className=" flex flex-col justify-between items-center gap-4 p-4">
            <Image src="/h-cd-icon.svg" alt="" width={130} height={79} />
            <span className=" text-xl"> +50 DJs</span>
          </div>
          <div className=" flex flex-col justify-between items-center gap-4 p-4">
            <Image src="/h-audio-icon.svg" alt="" width={88} height={79} />
            <span className=" text-xl"> +10 Genere</span>
          </div>
          <div className=" flex flex-col justify-between items-center gap-4 p-4">
            <Image src="/h-globe-icon.svg" alt="" width={78} height={78} />
            <span className=" text-xl"> +12 Cities</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
