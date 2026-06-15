import { faHeadphones } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import Image from "next/image";

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

  const djHref = user ? "/become-dj" : "/sign-up?role=dj";
  const organizerHref = user ? "/become-organizer" : "/sign-up?role=organizer";
  return (
    <>
      <section className="relative h-[60vh] w-full bg-zinc-800 md:h-[50vh] lg:h-[55vh]">
        {/* Background image - maybe later I will change alt to (DJ performing at electronic music event)*/}
        <Image
          src="/cover-hero.png"
          alt=""
          width={1920}
          height={1080}
          className="h-full w-full bg-bottom object-cover"
          priority
        />
        {/* <video
          className="w-full h-full object-cover bg-bottom"
          autoPlay
          muted
          loop
          disableRemotePlayback
        >
          <source src="/bnr.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video> */}
        {/* Overlay for for video was opacity text readability */}
        <div className="absolute top-0 left-0 z-10 h-full w-full bg-black opacity-70"></div>
        <div className="absolute top-0 left-0 z-10 flex h-full w-full items-center">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-start px-4 text-white md:px-8">
            <h1 className="max-w-xl text-2xl font-bold drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-3xl md:max-w-2xl md:text-4xl lg:max-w-3xl lg:text-5xl xl:text-6xl">
              Get Discovered. <br />
              Get Booked.
              <br />
              <span className="text-h_red font-bold">
                Build Your Reputation.{" "}
              </span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
              Join a growing network of DJs and organizers, showcase your
              talent, and unlock new opportunities.
            </p>

            <div className="mt-6 flex gap-4">
              {userRole?.role === "DJ" ? (
                <>
                  <Button
                    asChild
                    className="bg-h_red hover:bg-h_redDark h-auto px-6 py-3 text-sm font-semibold text-white md:text-base"
                  >
                    <Link href="/dj/dashboard">My DJ Dashboard</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-h_red hover:bg-h_red h-auto px-6 py-3 text-sm font-semibold text-red-300 hover:text-white md:text-base"
                  >
                    <Link href="/directory">Browse Open Gigs</Link>
                  </Button>
                </>
              ) : userRole?.role === "ORGANIZER" ? (
                <>
                  <Button
                    asChild
                    className="bg-h_red hover:bg-h_redDark h-auto px-6 py-3 text-sm font-semibold text-white md:text-base"
                  >
                    <Link href="/dashboard/organizer/gigs/new">Post a Gig</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-h_red hover:bg-h_red h-auto px-6 py-3 text-sm font-semibold text-red-300 hover:text-white md:text-base"
                  >
                    <Link href="/directory">Find DJs</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    className="bg-h_red hover:bg-h_redDark h-auto px-6 py-3 text-sm font-semibold text-white md:text-base"
                  >
                    <Link href={djHref}>Join as DJ</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-h_red hover:bg-h_red h-auto px-6 py-3 text-sm font-semibold text-red-300 hover:text-white md:text-base"
                  >
                    <Link href={organizerHref}>Join as Organizer</Link>
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
