"use client";
import React from "react";

const TopRated = () => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const cards = [
    {
      image: "/rated-1.webp",
      title: "David Guetta",
      city: "Paris",
      country: "France",
      genere: "House, Future Rave",
    },
    {
      image: "/rated-2.webp",
      title: "Dimitri Vegas & Like Mike",
      city: "Terssul",
      country: "Belgium",
      genere: "House, HipHop, Trance",
    },
    {
      image: "/rated-3.webp",
      title: "Martin Garrix",
      city: "Amestrdam",
      country: "The Netherlands",
      genere: "House, HipHop, Trance",
    },
    {
      image: "/rated-4.webp",
      title: "Alok",
      city: "Amestrdam",
      country: "The Netherlands",
      genere: "House, HipHop, Trance",
    },
    {
      image: "/rated-5.webp",
      title: "Peggy Gou",
      city: "Amestrdam",
      country: "The Netherlands",
      genere: "House, HipHop, Trance",
    },
    {
      image: "/rated-6.webp",
      title: "Armin Van Buuren",
      city: "Amestrdam",
      country: "The Netherlands",
      genere: "Trance",
    },
    {
      image: "/rated-7.webp",
      title: "Vintage Culture",
      city: "Rio",
      country: "Brazil",
      genere: "House, tech-house, melodic house",
    },
    {
      image: "/rated-8.webp",
      title: "Calvin Harris",
      city: "Dumfries",
      country: "UK",
      genere: "Dance-pop, party anthems",
    },
    {
      image: "/rated-9.webp",
      title: "Don Diablo",
      city: "Amestrdam",
      country: "The Netherlands",
      genere: "Future music",
    },
    {
      image: "/rated-10.webp",
      title: "KSHMR",
      city: "Berkeley",
      country: "CA",
      genere: "Indian, big room, hip-hop",
    },
  ];

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + cards.length) % cards.length
    );
  };
  if (currentIndex > cards.length - 6) {
    console.log(currentIndex);
    setCurrentIndex(0);
    console.log("hi");
  }
  return (
    <div className="mt-16 container mx-auto flex justify-between items-center">
      <div className="">
        <h2 className=" text-title text-3xl mb-6">Top Rated DJs</h2>
        <div className="relative">
          <div className="flex space-x-6 overflow-x-hidden">
            {cards.slice(currentIndex, currentIndex + 6).map((card, index) => (
              <div
                className="flex-none w-1/6 h-72 p-4 bg-white/10 rounded-lg shadow-md border-[2px] border-[#8951e6]"
                key={index}
              >
                <img
                  className="w-full h-32 object-cover mb-4 rounded-lg"
                  src={card.image}
                  alt="Card"
                />
                <h3 className="text-md font-bold">{card.title}</h3>
                <p className="text-white/60 text-sm">
                  {card.country}, {card.city}
                </p>
                <p className="text-white/60 text-sm mt-6">{card.genere}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 relative  bottom-44 ">
            <button
              className="w-10 h-10 rounded-xl bg-[#8951e6]  relative right-5"
              onClick={handlePrev}
            >
              &lt;
            </button>
            <button
              className="w-10 h-10 rounded-xl bg-[#8951e6] relative left-5"
              onClick={handleNext}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopRated;
