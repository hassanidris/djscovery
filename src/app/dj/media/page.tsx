"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Headphones, Play, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import MediaCard from "@/components/dj/MediaCard";
import MediaForm from "@/components/dj/MediaForm";
import {
  getDjMedia,
  deleteMediaItem,
  getCurrentDjSlug,
} from "@/lib/actions/dj-media";
import type { MediaItem } from "@/lib/actions/dj-media";

const TABS = [
  { value: "AUDIO", label: "Mixes", icon: Headphones },
  { value: "VIDEO", label: "Videos", icon: Play },
  { value: "IMAGE", label: "Photos", icon: ImageIcon },
] as const;

export default function DjMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [djSlug, setDjSlug] = useState<string>("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [deletingMedia, setDeletingMedia] = useState<MediaItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<MediaItem["type"]>("AUDIO");

  // Initial fetch on mount
  useEffect(() => {
    async function load() {
      const [mediaResult, slugResult] = await Promise.all([
        getDjMedia(),
        getCurrentDjSlug(),
      ]);
      if ("media" in mediaResult) {
        const items = mediaResult.media;
        setMedia(items);
        // Default to first non-empty tab
        const firstType = TABS.find((t) =>
          items.some((i) => i.type === t.value),
        )?.value;
        setActiveTab(firstType ?? "AUDIO");
      }
      if ("slug" in slugResult) {
        setDjSlug(slugResult.slug);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const filtered = (type: MediaItem["type"]) =>
    media.filter((item) => item.type === type);

  const handleRefresh = async () => {
    const result = await getDjMedia();
    if ("media" in result) {
      setMedia(result.media);
    }
  };

  const handleDelete = () => {
    if (!deletingMedia) return;
    startTransition(async () => {
      const result = await deleteMediaItem(deletingMedia.id);
      setDeletingMedia(null);
      if ("success" in result) {
        await handleRefresh();
      }
    });
  };

  return (
    <div className="flex flex-col gap-6" data-testid="media-page">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1
            className="text-2xl font-bold text-white"
            data-testid="media-page-title"
          >
            Media
          </h1>
          <p className="text-sm text-gray-400">
            Manage your mixes, videos, and press photos in one place.
          </p>
        </div>
        <Button
          className="mt-2 sm:mt-0"
          onClick={() => {
            setEditingMedia(null);
            setFormOpen(true);
          }}
          data-testid="add-media-button"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Media
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as MediaItem["type"])}
        className="w-full"
      >
        <TabsList className="mb-6 w-fit bg-white/5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = filtered(tab.value).length;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-active:bg-h_redDark flex-initial gap-1 px-4 data-active:text-white"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {count > 0 && (
                  <span className="text-xs opacity-70">({count})</span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TABS.map((tab) => {
          const items = filtered(tab.value);
          return (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
              {isLoading ? (
                <LoadingGrid />
              ) : items.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <MediaCard
                      key={item.id}
                      media={item}
                      djSlug={djSlug}
                      onEdit={(m) => {
                        setEditingMedia(m);
                        setFormOpen(true);
                      }}
                      onDelete={(m) => setDeletingMedia(m)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState type={tab.value} onAdd={() => setFormOpen(true)} />
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Media form modal */}
      <MediaForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingMedia(null);
        }}
        mode={
          editingMedia
            ? { mode: "edit", media: editingMedia }
            : { mode: "create" }
        }
        onSuccess={handleRefresh}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deletingMedia}
        onOpenChange={(open) => !open && setDeletingMedia(null)}
      >
        <AlertDialogContent className="bg-h_black border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete media?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently remove &quot;
              {deletingMedia?.title || "Untitled"}&quot; from your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              disabled={isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5"
        >
          <div className="aspect-video bg-white/5" />
          <div className="space-y-2 p-4">
            <div className="h-5 w-3/4 rounded bg-white/5" />
            <div className="h-4 w-1/2 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  type,
  onAdd,
}: {
  type: MediaItem["type"];
  onAdd: () => void;
}) {
  const labels: Record<
    MediaItem["type"],
    { title: string; description: string }
  > = {
    AUDIO: {
      title: "No mixes yet",
      description:
        "Upload your SoundCloud or Mixcloud mixes to showcase your sound.",
    },
    VIDEO: {
      title: "No videos yet",
      description: "Add YouTube or Vimeo videos of your performances and sets.",
    },
    IMAGE: {
      title: "No photos yet",
      description: "Upload high-quality press photos for organizers and fans.",
    },
  };

  const { title, description } = labels[type];

  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-16 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
        {description}
      </p>
      <Button className="mt-6" onClick={onAdd}>
        <Plus className="mr-1 h-4 w-4" />
        Add Media
      </Button>
    </div>
  );
}
