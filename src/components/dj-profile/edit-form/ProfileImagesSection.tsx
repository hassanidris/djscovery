"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { uploadDjAvatar, uploadDjCover } from "@/lib/actions/dj-upload";
import { SectionCard } from "@/components/forms/SectionCard";

export function ProfileImagesSection({
  avatarUrl,
  coverImageUrl,
  onAvatarChange,
  onCoverChange,
  onUploadingChange,
}: {
  avatarUrl: string;
  coverImageUrl: string;
  onAvatarChange: (url: string) => void;
  onCoverChange: (url: string) => void;
  onUploadingChange: (avatar: boolean, cover: boolean) => void;
}) {
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(file: File | undefined) {
    if (!file) return;
    setIsUploadingAvatar(true);
    onUploadingChange(true, isUploadingCover);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadDjAvatar(fd);
      if ("error" in result) throw new Error(result.error);
      onAvatarChange(result.url);
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingAvatar(false);
      onUploadingChange(false, isUploadingCover);
    }
  }

  async function handleCoverChange(file: File | undefined) {
    if (!file) return;
    setIsUploadingCover(true);
    onUploadingChange(isUploadingAvatar, true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadDjCover(fd);
      if ("error" in result) throw new Error(result.error);
      onCoverChange(result.url);
      toast.success("Cover image updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingCover(false);
      onUploadingChange(isUploadingAvatar, false);
    }
  }

  return (
    <SectionCard title="Profile Images" subtitle="Your avatar and cover photo">
      <div className="flex flex-col gap-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-white/5 ring-2 ring-white/10">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="avatar"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Camera className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <p className="mb-0.5 text-xs font-medium text-white">
              Profile Photo
            </p>
            <p className="mb-2 text-xs text-gray-400">
              Shown on your profile and directory card
            </p>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                handleAvatarChange(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
              className="border-white/15 text-gray-300 hover:bg-white/5"
            >
              {isUploadingAvatar ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="mr-1.5 h-3.5 w-3.5" />
              )}
              {avatarUrl ? "Change Avatar" : "Upload Avatar"}
            </Button>
          </div>
        </div>

        <Separator className="bg-white/8" />

        {/* Cover Image */}
        <div>
          <p className="mb-0.5 text-xs font-medium text-white">Cover Image</p>
          <p className="mb-3 text-xs text-gray-400">
            The banner shown at the top of your profile
          </p>
          {coverImageUrl && (
            <div className="relative mb-3 h-24 w-full overflow-hidden rounded-lg bg-white/5">
              <Image
                src={coverImageUrl}
                alt="cover"
                fill
                className="object-cover opacity-70"
              />
            </div>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              handleCoverChange(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploadingCover}
            onClick={() => coverInputRef.current?.click()}
            className="border-white/15 text-gray-300 hover:bg-white/5"
          >
            {isUploadingCover ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="mr-1.5 h-3.5 w-3.5" />
            )}
            {coverImageUrl ? "Change Cover" : "Upload Cover"}
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}
