"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Headphones,
  ImageIcon,
  Star,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MediaItem } from "@/lib/actions/dj-media";

type MediaCardProps = {
  media: MediaItem;
  djSlug: string;
  onEdit: (media: MediaItem) => void;
  onDelete: (media: MediaItem) => void;
};

const TYPE_META: Record<
  MediaItem["type"],
  {
    label: string;
    icon: React.ElementType;
    statLabel: string;
    statKey: "playCount" | "viewCount";
  }
> = {
  AUDIO: {
    label: "Mix",
    icon: Headphones,
    statLabel: "plays",
    statKey: "playCount",
  },
  VIDEO: {
    label: "Video",
    icon: Play,
    statLabel: "views",
    statKey: "viewCount",
  },
  IMAGE: {
    label: "Photo",
    icon: ImageIcon,
    statLabel: "views",
    statKey: "viewCount",
  },
};

export default function MediaCard({
  media,
  djSlug,
  onEdit,
  onDelete,
}: MediaCardProps) {
  const meta = TYPE_META[media.type];
  const Icon = meta.icon;
  const stat = (media[meta.statKey] ?? 0) as number;

  const thumbnailUrl =
    media.type === "IMAGE" ? media.url : media.thumbnail || null;
  const displayTitle =
    media.title ||
    (media.type === "IMAGE" ? "Gallery photo" : "Untitled media");

  return (
    <Card className="group flex flex-col overflow-hidden border-white/10 bg-white/5 transition-colors hover:border-white/20">
      <div className="relative aspect-video overflow-hidden bg-black">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={media.title || "Media thumbnail"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="from-h_redDark/30 flex h-full w-full items-center justify-center bg-linear-to-br to-black">
            <Icon className="h-12 w-12 text-white/20" />
          </div>
        )}

        <div className="absolute top-2 left-2 flex gap-1.5">
          <Badge
            variant="secondary"
            className="bg-black/60 text-xs text-white backdrop-blur-sm"
          >
            {meta.label}
          </Badge>
          {media.isSpotlight && (
            <Badge className="border-0 bg-amber-500/20 text-xs text-amber-300 backdrop-blur-sm">
              <Star className="mr-1 h-2.5 w-2.5" />
              Spotlight
            </Badge>
          )}
        </div>

        <div className="absolute right-2 bottom-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7 bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
            onClick={() => onEdit(media)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="h-7 w-7 bg-black/60 backdrop-blur-sm hover:bg-red-600/80"
            onClick={() => onDelete(media)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-semibold text-white">
          {displayTitle}
        </h3>

        <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {stat.toLocaleString()} {meta.statLabel}
          </span>
          <Link
            href={`/djs/${djSlug}`}
            className="text-h_red hover:text-h_redLight"
            target="_blank"
          >
            View on profile
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
