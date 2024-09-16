"use client";
import { useUser } from "@clerk/clerk-react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useState } from "react";
import AddPostBtn from "./AddPostBtn";
import { addPost } from "@/lib/actions";

const AddPost = () => {
  const { isLoaded, user } = useUser();
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState<any>(null);

  if (!isLoaded) {
    return "Loading...";
  }
  if (!user) {
    return "You must be logged in to post";
  }
  return (
    <div className="p-4 bg-h_blackLight/50 shadow-md rounded-lg flex gap-4 justify-between text-sm">
      {/* Avatar */}
      <Image
        src={user?.imageUrl || "/noAvatar.png"}
        alt=""
        width={48}
        height={48}
        className="w-12 h-12 object-cover rounded-full ring-1 ring-gray-400"
      />
      {/* Post */}
      <div className="flex-1">
        {/* Text Input */}
        <form
          action={(formData) => addPost(formData, img?.secure_url || "")}
          className=" flex gap-4"
        >
          <textarea
            placeholder="What's on your mind?"
            className="flex-1 bg-gray-600 rounded-lg p-2 text-h_white"
            name="desc"
            // onClick={(e) => setDesc(e.target.value)}
          ></textarea>
          <div className=" self-end">
            {/* <Image
              src="/emoji.png"
              alt=""
              width={20}
              height={20}
              className="w-5 h-5 cursor-pointer self-end"
            /> */}
            <AddPostBtn />
          </div>
        </form>
        {/* Post Options */}
        <div className="flex items-center gap-4 mt-4 text-gray-400 flex-wrap">
          <CldUploadWidget
            uploadPreset="djscovery"
            onSuccess={(result, { widget }) => {
              setImg(result.info);
              widget.close();
            }}
          >
            {({ open }) => {
              return (
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => open()}
                >
                  <Image src="/addimage.png" alt="" width={20} height={20} />
                  Photo
                </div>
              );
            }}
          </CldUploadWidget>
          <div className="flex items-center gap-2 cursor-pointer">
            <Image src="/addVideo.png" alt="" width={20} height={20} />
            Video
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <Image src="/poll.png" alt="" width={20} height={20} />
            Poll
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <Image src="/addevent.png" alt="" width={20} height={20} />
            Event
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
