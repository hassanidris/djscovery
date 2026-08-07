"use client";
import { useUser } from "@/lib/supabase/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { ImageIcon, Video, Music2, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import AddPostBtn from "./AddPostBtn";
import { addPost } from "@/lib/actions/feed";
import { AddPostSkeleton } from "@/components/ui/skeletons";

interface AddPostProps {
  avatarUrl?: string | null;
  displayName?: string | null;
}

const AddPost = ({ avatarUrl, displayName }: AddPostProps = {}) => {
  const { isLoaded, user } = useUser();
  const [img, setImg] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [mixUrl, setMixUrl] = useState("");
  const [activeMedia, setActiveMedia] = useState<
    "photo" | "video" | "mix" | null
  >(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const switchMedia = (type: "photo" | "video" | "mix") => {
    if (activeMedia === type) {
      setActiveMedia(null);
      setImg(null);
      setVideoUrl("");
      setMixUrl("");
    } else {
      setActiveMedia(type);
      setImg(null);
      setVideoUrl("");
      setMixUrl("");
    }
  };

  if (!isLoaded) return <AddPostSkeleton />;

  if (!user) {
    return (
      <div className="bg-h_blackLight/50 flex items-center justify-between gap-4 rounded-xl border border-gray-800/70 p-4 shadow-md">
        <p className="text-sm text-gray-400">
          Join the community to share posts and connect with DJs
        </p>
        <Link
          href="/sign-up"
          className="bg-h_red hover:bg-h_redDark shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  const initials = (displayName ?? user.email ?? "DJ")
    .slice(0, 2)
    .toUpperCase();

  const resetForm = () => {
    if (textareaRef.current) textareaRef.current.value = "";
    setImg(null);
    setVideoUrl("");
    setMixUrl("");
    setActiveMedia(null);
  };

  return (
    <div className="bg-h_blackLight/50 border-t-h_red overflow-hidden rounded-xl border border-t-2 border-gray-800/70 shadow-lg">
      <form
        action={async (formData) => {
          const content = (formData.get("content") as string | null) ?? "";
          const hasMedia = !!(img?.secure_url || videoUrl || mixUrl);
          if (!content.trim() && !hasMedia) {
            toast.error("Add some text or attach a photo, video, or mix.");
            return;
          }
          if (content.trim().length > 1000) {
            toast.error("Post text must be under 1000 characters.");
            return;
          }
          try {
            await addPost(formData, img?.secure_url || "");
            toast.success("Post shared with the community!");
            resetForm();
          } catch {
            toast.error("Failed to post. Try again.");
          }
        }}
      >
        {/* Hidden URL fields submitted with the form */}
        {videoUrl && <input type="hidden" name="videoUrl" value={videoUrl} />}
        {mixUrl && <input type="hidden" name="audioUrl" value={mixUrl} />}

        {/* ── Compose area ── */}
        <div className="flex gap-3 px-4 pt-4 pb-3">
          <Avatar className="mt-0.5 h-10 w-10 shrink-0 ring-1 ring-white/20">
            <AvatarImage src={avatarUrl ?? ""} alt={displayName ?? ""} />
            <AvatarFallback className="bg-white/10 text-sm font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 rounded-xl border border-white/15 px-3 py-2 transition-colors focus-within:border-white/30">
            <textarea
              ref={textareaRef}
              name="content"
              placeholder="Share something with the community…"
              rows={3}
              className="text-h_white w-full resize-none bg-transparent text-sm placeholder:text-white/30 focus:outline-none"
            />
          </div>
        </div>

        {/* ── Video URL input (toggled) ── */}
        {activeMedia === "video" && (
          <div className="px-4 pb-3">
            <div className="focus-within:ring-h_red/40 flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 ring-1 ring-white/10 transition-all">
              <Video className="h-4 w-4 shrink-0 text-white/50" />
              <input
                type="url"
                placeholder="Paste video link (YouTube, Vimeo…)"
                className="text-h_white flex-1 bg-transparent text-sm placeholder:text-white/30 focus:outline-none"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              {videoUrl && (
                <button
                  type="button"
                  onClick={() => setVideoUrl("")}
                  className="cursor-pointer text-white/30 transition-colors hover:text-white/60"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Mix / Sound URL input (toggled) ── */}
        {activeMedia === "mix" && (
          <div className="px-4 pb-3">
            <div className="focus-within:ring-h_red/40 flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 ring-1 ring-white/10 transition-all">
              <Music2 className="text-h_red/80/80 h-4 w-4 shrink-0" />
              <input
                type="url"
                placeholder="Paste mix link (SoundCloud, Mixcloud…)"
                className="text-h_white flex-1 bg-transparent text-sm placeholder:text-white/30 focus:outline-none"
                value={mixUrl}
                onChange={(e) => setMixUrl(e.target.value)}
              />
              {mixUrl && (
                <button
                  type="button"
                  onClick={() => setMixUrl("")}
                  className="text-white/30 transition-colors hover:text-white/60"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Photo preview ── */}
        {img && (
          <div className="relative px-4 pb-3">
            <Image
              src={img.secure_url}
              alt="preview"
              width={400}
              height={300}
              className="max-h-48 w-full rounded-lg object-cover"
              unoptimized
            />
            <button
              type="button"
              onClick={() => setImg(null)}
              className="absolute top-1 right-5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* ── Footer: attach buttons + submit ── */}
        <div className="flex items-center justify-between gap-2 border-t border-white/10 px-4 py-2.5">
          <div className="flex items-center gap-1">
            {/* Photo */}
            <CldUploadWidget
              uploadPreset="djscovery"
              onSuccess={(result, { widget }) => {
                setImg(result.info);
                setActiveMedia("photo");
                widget.close();
                toast.success("Photo added to your post");
              }}
              onError={() => toast.error("Photo upload failed. Try again.")}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => {
                    if (activeMedia === "photo") {
                      switchMedia("photo");
                    } else {
                      switchMedia("photo");
                      open();
                    }
                  }}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all ${
                    activeMedia === "photo"
                      ? "text-h_red/80 bg-h_red/10 border-h_red/20 border"
                      : "text-white/40 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Photo
                </button>
              )}
            </CldUploadWidget>

            {/* Video */}
            <button
              type="button"
              onClick={() => switchMedia("video")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all ${
                activeMedia === "video"
                  ? "text-h_red/80 bg-h_red/10 border-h_red/20 border"
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              Video
            </button>

            {/* Mix / Sound */}
            <button
              type="button"
              onClick={() => switchMedia("mix")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all ${
                activeMedia === "mix"
                  ? "text-h_red/80 bg-h_red/10 border-h_red/20 border"
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Music2 className="h-3.5 w-3.5" />
              Mix
            </button>
          </div>

          <AddPostBtn />
        </div>
      </form>
    </div>
  );
};

export default AddPost;
