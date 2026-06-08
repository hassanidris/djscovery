"use client";
import { useUser } from "@/lib/supabase/useUser";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import AddPostBtn from "./AddPostBtn";
import { addPost } from "@/lib/actions";

const AddPost = () => {
  const { isLoaded, user } = useUser();
  const [img, setImg] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isLoaded) {
    return "Loading...";
  }
  if (!user) {
    return (
      <div className="p-4 bg-h_blackLight/50 shadow-md rounded-lg flex items-center justify-between gap-4">
        <p className="text-gray-400 text-sm">
          Join the community to share posts and connect with DJs
        </p>
        <Link
          href="/sign-up"
          className="shrink-0 bg-h_red hover:bg-h_redDark text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Sign Up
        </Link>
      </div>
    );
  }
  return (
    <div className="p-4 bg-h_blackLight/50 shadow-md rounded-lg flex gap-4 justify-between text-sm">
      {/* Avatar */}
      <Image
        src="/noAvatar.png"
        alt=""
        width={48}
        height={48}
        className="w-12 h-12 object-cover rounded-full ring-1 ring-gray-400"
      />
      {/* Post */}
      <div className="flex-1">
        {/* Text Input */}
        <form
          action={async (formData) => {
            try {
              await addPost(formData, img?.secure_url || "");
              toast.success("Post shared with the community!");
              if (textareaRef.current) textareaRef.current.value = "";
              setImg(null);
            } catch {
              toast.error("Failed to post. Try again.");
            }
          }}
          className="flex gap-4"
        >
          <textarea
            ref={textareaRef}
            placeholder="What's on your mind?"
            className="flex-1 bg-gray-600 rounded-lg p-2 text-h_white"
            name="content"
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
              toast.success("Photo added to your post");
            }}
            onError={() => {
              toast.error("Photo upload failed. Try again.");
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
