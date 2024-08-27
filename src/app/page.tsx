import Hero from "@/components/Hero";
import TopRated from "@/components/TopRated";
import RecentAdded from "@/components/RecentAdded";
import Image from "next/image";
import DjsEvents from "@/components/DjsEvents";
import Subscription from "@/components/Subscription";

const Homepage = () => {
  return (
    <>
      {" "}
      <section className="relative w-full h-[80vh] bg-[url('/h-hero-img.png')] bg-cover bg-center ">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-black/10 flex justify-center items-center">
          <h1 className="text-[80px] text-title text-white">
            Find the Perfect DJ Near You! 🎧
          </h1>
        </div>
      </section>
      <Hero />
      <TopRated />
      <RecentAdded />
      <DjsEvents />
      <Subscription />
      <section></section>
    </>
  );
};

export default Homepage;
