import React from "react";
import GallerySwiper from "./GallerySwiper";

const UserPhotoGallery = () => {
  return (
    <div>
      <div className="gallery_sec bg-transparent my-5">
        <h1 className="w-full px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
          {" "}
          Media{" "}
        </h1>
      </div>
      <GallerySwiper />
    </div>
  );
};

export default UserPhotoGallery;
