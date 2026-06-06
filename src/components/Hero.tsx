import { faHeadphones } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";

const Hero = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userRole = user
    ? await prisma.userRole.findFirst({
        where: { userId: user.id, role: { in: ["DJ", "ORGANIZER"] } },
      })
    : null;

  const joinHref = user ? "/select-role" : "/sign-up";
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
        <div className="absolute top-0 left-0 h-full w-full flex items-center z-10">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-start text-white">
            <h1 className="font-bold text-4xl md:text-6xl lg:text-7xl max-w-xl md:max-w-2xl lg:max-w-3xl leading-tight">
              Find the{" "}
              <span className="font-bold text-h_red/80">Perfect DJ </span>
              For You!{" "}
              <span className="font-bold text-h_red/80">
                <FontAwesomeIcon
                  icon={faHeadphones}
                  className="w-10 h-10 md:w-14 md:h-14 inline"
                />
              </span>
            </h1>
            <p className="mt-3 text-sm md:text-base text-white/80 tracking-wide">
              On the world&apos;s first & largest DJ&apos;s Community.
            </p>

            <div className="flex gap-4 mt-6">
              {userRole?.role === "DJ" ? (
                <>
                  <Button
                    asChild
                    className="bg-h_red hover:bg-h_redDark text-white font-semibold h-auto py-3 px-6 text-sm md:text-base"
                  >
                    <Link href="/dj/dashboard">My DJ Dashboard</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-h_red text-red-300 hover:bg-h_red hover:text-white font-semibold h-auto py-3 px-6 text-sm md:text-base"
                  >
                    <Link href="/directory">Browse Open Gigs</Link>
                  </Button>
                </>
              ) : userRole?.role === "ORGANIZER" ? (
                <>
                  <Button
                    asChild
                    className="bg-h_red hover:bg-h_redDark text-white font-semibold h-auto py-3 px-6 text-sm md:text-base"
                  >
                    <Link href="/organizer/dashboard">Post a Gig</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-h_red text-red-300 hover:bg-h_red hover:text-white font-semibold h-auto py-3 px-6 text-sm md:text-base"
                  >
                    <Link href="/directory">Find DJs</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    className="bg-h_red hover:bg-h_redDark text-white font-semibold h-auto py-3 px-6 text-sm md:text-base"
                  >
                    <Link href={joinHref}>Join as DJ</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-h_red text-red-300 hover:bg-h_red hover:text-white font-semibold h-auto py-3 px-6 text-sm md:text-base"
                  >
                    <Link href={joinHref}>Join as Organiser</Link>
                  </Button>
                </>
              )}
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
