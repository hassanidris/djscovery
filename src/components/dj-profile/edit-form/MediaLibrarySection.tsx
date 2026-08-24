"use client";

import MediaLibrary from "@/components/dj-profile/MediaLibrary";
import { SectionCard } from "@/components/forms/SectionCard";
import type { MediaItem } from "@/lib/actions/dj-media";

export function MediaLibrarySection({
  profileId,
  plan,
  initialMedia,
  onMediaChange,
}: {
  profileId: number;
  plan: "FREE" | "PREMIUM";
  initialMedia: MediaItem[];
  onMediaChange: (changed: boolean) => void;
}) {
  return (
    <SectionCard
      title="Media Library"
      subtitle="Manage your photos, videos, and audio"
    >
      <MediaLibrary
        profileId={profileId}
        plan={plan}
        initialMedia={initialMedia}
        onMediaChange={onMediaChange}
      />
    </SectionCard>
  );
}
