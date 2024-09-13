"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
// import "swiper/css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const GallerySwiper = () => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y]}
      spaceBetween={0}
      slidesPerView={4}
      navigation
      pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
      onSwiper={(swiper) => console.log(swiper)}
      onSlideChange={() => console.log("slide change")}
      breakpoints={{
        400: {
          slidesPerView: 1,
        },
        640: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 3,
        },
        1024: {
          slidesPerView: 5,
        },
      }}
    >
      <SwiperSlide>
        <img
          src="https://images.pexels.com/photos/63703/pexels-photo-63703.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Image 1"
        />
      </SwiperSlide>
      <SwiperSlide>
        <img
          src="https://images.pexels.com/photos/2381596/pexels-photo-2381596.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Image 2"
        />
      </SwiperSlide>
      <SwiperSlide>
        <img
          src="https://images.pexels.com/photos/1649691/pexels-photo-1649691.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Image 3"
        />
      </SwiperSlide>
      <SwiperSlide>
        <img
          src="https://images.pexels.com/photos/2111016/pexels-photo-2111016.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Image 4"
        />
      </SwiperSlide>
      <SwiperSlide>
        <img
          src="https://images.pexels.com/photos/219101/pexels-photo-219101.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Image 4"
        />
      </SwiperSlide>
      <SwiperSlide>
        <img
          src="https://images.pexels.com/photos/332688/pexels-photo-332688.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Image 4"
        />
      </SwiperSlide>
    </Swiper>
  );
};

export default GallerySwiper;
