"use client";
import { useUser } from "@/lib/supabase/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CldUploadWidget } from "next-cloudinary";
import { ImageIcon, Video, Music2, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import AddPostBtn from "./AddPostBtn";
import { addPost } from "@/lib/actions";
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
      <div className="p-4 bg-h_blackLight/50 rounded-xl border border-gray-800/70 shadow-md flex items-center justify-between gap-4">
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
    <div className="bg-h_blackLight/50 rounded-xl border border-gray-800/70 border-t-2 border-t-h_red shadow-lg overflow-hidden">
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
          <Avatar className="w-10 h-10 shrink-0 ring-1 ring-white/20 mt-0.5">
            <AvatarImage src={avatarUrl ?? ""} alt={displayName ?? ""} />
            <AvatarFallback className="bg-white/10 text-white text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 rounded-xl border border-white/15 px-3 py-2 focus-within:border-white/30 transition-colors">
            <textarea
              ref={textareaRef}
              name="content"
              placeholder="Share something with the community…"
              rows={3}
              className="w-full bg-transparent text-h_white placeholder:text-white/30 resize-none focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* ── Video URL input (toggled) ── */}
        {activeMedia === "video" && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 bg-black/20 ring-1 ring-white/10 focus-within:ring-h_red/40 rounded-lg px-3 py-2 transition-all">
              <Video className="w-4 h-4 text-white/50 shrink-0" />
              <input
                type="url"
                placeholder="Paste video link (YouTube, Vimeo…)"
                className="flex-1 bg-transparent text-sm text-h_white placeholder:text-white/30 focus:outline-none"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              {videoUrl && (
                <button
                  type="button"
                  onClick={() => setVideoUrl("")}
                  className="text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Mix / Sound URL input (toggled) ── */}
        {activeMedia === "mix" && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 bg-black/20 ring-1 ring-white/10 focus-within:ring-h_red/40 rounded-lg px-3 py-2 transition-all">
              <Music2 className="w-4 h-4 text-h_red/80 shrink-0" />
              <input
                type="url"
                placeholder="Paste mix link (SoundCloud, Mixcloud…)"
                className="flex-1 bg-transparent text-sm text-h_white placeholder:text-white/30 focus:outline-none"
                value={mixUrl}
                onChange={(e) => setMixUrl(e.target.value)}
              />
              {mixUrl && (
                <button
                  type="button"
                  onClick={() => setMixUrl("")}
                  className="text-white/30 hover:text-white/60 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Photo preview ── */}
        {img && (
          <div className="px-4 pb-3 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.secure_url}
              alt="preview"
              className="w-full max-h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => setImg(null)}
              className="absolute top-1 right-5 bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* ── Footer: attach buttons + submit ── */}
        <div className="border-t border-white/10 px-4 py-2.5 flex items-center justify-between gap-2">
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
                  className={`flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    activeMedia === "photo"
                      ? "text-h_red bg-h_red/10 border border-h_red/20"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Photo
                </button>
              )}
            </CldUploadWidget>

            {/* Video */}
            <button
              type="button"
              onClick={() => switchMedia("video")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-xs transition-all ${
                activeMedia === "video"
                  ? "text-h_red bg-h_red/10 border border-h_red/20"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              Video
            </button>

            {/* Mix / Sound */}
            <button
              type="button"
              onClick={() => switchMedia("mix")}
              className={`flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                activeMedia === "mix"
                  ? "text-h_red bg-h_red/10 border border-h_red/20"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <Music2 className="w-3.5 h-3.5" />
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
