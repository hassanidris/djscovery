import Image from "next/image";
import React from "react";
import Comments from "./Comments";

const Post = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* USER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="https://images.pexels.com/photos/8517921/pexels-photo-8517921.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=378&fit=crop&h=612"
            width={40}
            height={40}
            alt=""
            className="w-10 h-10 rounded-full"
          />
          <span className="font-medium">Hassen</span>
        </div>
        <Image src="/more.png" width={16} height={16} alt="" />
      </div>
      {/* DESC */}
      <div className="flex flex-col gap-4">
        <div className="w-full min-h-96 relative">
          <Image
            src="https://images.pexels.com/photos/240561/pexels-photo-240561.jpeg?auto=compress&cs=tinysrgb&w=800"
            fill
            className="object-cover rounded-md"
            alt=""
          />
        </div>
        <p>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti
          officiis illum dolor modi expedita, rerum id numquam porro sunt,
          veniam repellendus tempora neque laborum iste recusandae, voluptatum
          ipsam! Accusantium, odio.
        </p>
      </div>
      {/* INTERACTION */}
      <div className="flex items-center justify-between text-sm my-4">
        <div className="flex gap-8">
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
            <Image
              src="/like.png"
              width={16}
              height={16}
              alt=""
              className=" cursor-pointer"
            />
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">
              123
              <span className="hidden md:inline"> Likes</span>
            </span>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
            <Image
              src="/comment.png"
              width={16}
              height={16}
              alt=""
              className=" cursor-pointer"
            />
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">
              123
              <span className="hidden md:inline"> Comments</span>
            </span>
          </div>
        </div>
        <div className="">
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
            <Image
              src="/share.png"
              width={16}
              height={16}
              alt=""
              className=" cursor-pointer"
            />
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">
              123
              <span className="hidden md:inline"> Shares</span>
            </span>
          </div>
        </div>
      </div>
      <Comments />
    </div>
  );
};

export default Post;
