import Image from "next/image";
import React from "react";

const Comments = () => {
  return (
    <div className="">
      {/* Field */}
      <div className=" flex items-center gap-4">
        <Image
          src="https://images.pexels.com/photos/743715/pexels-photo-743715.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt=""
          width={32}
          height={32}
          className=" w-8 h-8 rounded-full"
        />
        <div className=" flex flex-1 items-center justify-between bg-slate-100 rounded-xl text-sm px-6 py-2 w-full">
          <input
            type="text"
            placeholder="Write a comment ..."
            className=" bg-transparent outline-none flex-1"
          />
          <Image
            src="/emoji.png"
            alt=""
            width={16}
            height={16}
            className=" cursor-pointer"
          />
        </div>
      </div>
      {/* comments listing */}
      <div className="">
        {/* Comment */}
        <div className=" flex gap-4 justify-between mt-6">
          {/* Avatar */}
          <Image
            src="https://images.pexels.com/photos/743715/pexels-photo-743715.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt=""
            width={40}
            height={40}
            className=" w-10 h-10 rounded-full"
          />
          {/* Desc */}
          <div className=" flex flex-col gap-2 flex-1">
            <span className=" font-medium">Anwar Mansai</span>
            <p>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
              Inventore repudiandae, dolorem, necessitatibus quia suscipit ea
              sunt vero quam repellat libero quis incidunt! Magnam deserunt eum
              ad earum voluptate alias expedita.
            </p>
            <div className=" flex items-center gap-8 text-xs text-gray-500 mt-2">
              <div className=" flex items-center gap-4">
                <Image
                  src="/like.png"
                  alt=""
                  width={12}
                  height={12}
                  className=" cursor-pointer w-3 h-3"
                />
                <span className=" text-gray-300">|</span>
                <span className=" text-gray-500">123 Likes</span>
              </div>
              <div className="f">Reply</div>
            </div>
          </div>
          {/* Icon */}
          <Image
            src="/more.png"
            alt=""
            width={16}
            height={16}
            className=" cursor-pointer w-4 h-4"
          />
        </div>
      </div>
    </div>
  );
};

export default Comments;
