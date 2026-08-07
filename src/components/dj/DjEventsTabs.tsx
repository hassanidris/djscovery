"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CalendarDays,
  MapPin,
  Eye,
  Heart,
  ImageIcon,
  Star,
  Lock,
  ArrowRight,
  Pencil,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type DjEventItem = {
  id: number;
  slug: string;
  title: string;
  eventType: string;
  category: string;
  status: string;
  startDate: Date;
  endDate: Date | null;
  venue: string | null;
  posterUrl: string | null;
  featured: boolean;
  viewCount: number;
  location: string;
  ownerStageName: string;
  ownerSlug: string;
  role: string;
  savedCount: number;
  galleryCount: number;
  isOwner: boolean;
};

type Props = {
  events: DjEventItem[];
  djSlug: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  CLUB_NIGHT: "Club Night",
  FESTIVAL: "Festival",
  WEDDING: "Wedding",
  BIRTHDAY: "Birthday",
  CORPORATE: "Corporate",
  BEACH_PARTY: "Beach Party",
  LOUNGE: "Lounge",
  RESTAURANT_SET: "Restaurant Set",
  PRIVATE_PARTY: "Private Party",
  OPEN_AIR: "Open Air",
  LUXURY_EVENT: "Luxury Event",
  OTHER: "Other",
};

const STATUS_THEME: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-500/15 text-gray-300" },
  PUBLISHED: {
    label: "Published",
    className: "bg-emerald-500/15 text-emerald-300",
  },
  COMPLETED: { label: "Completed", className: "bg-blue-500/15 text-blue-300" },
  CANCELLED: { label: "Cancelled", className: "bg-red-500/15 text-red-300" },
  ARCHIVED: { label: "Archived", className: "bg-zinc-500/15 text-zinc-300" },
};

export default function DjEventsTabs({ events, djSlug }: Props) {
  const now = new Date();

  const upcoming = events.filter(
    (e) =>
      e.status === "PUBLISHED" &&
      new Date(e.startDate).getTime() >= now.getTime(),
  );
  const past = events.filter(
    (e) =>
      e.status === "COMPLETED" ||
      e.status === "CANCELLED" ||
      e.status === "ARCHIVED" ||
      (e.status === "PUBLISHED" &&
        new Date(e.startDate).getTime() < now.getTime()),
  );
  const drafts = events.filter((e) => e.status === "DRAFT");

  const tabs = [
    { value: "upcoming", label: "Upcoming", count: upcoming.length },
    { value: "past", label: "Past", count: past.length },
    { value: "drafts", label: "Drafts", count: drafts.length },
  ];

  const [activeTab, setActiveTab] = useState(
    upcoming.length > 0 ? "upcoming" : past.length > 0 ? "past" : "drafts",
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-6 w-fit bg-white/5">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="data-active:bg-h_redDark flex-initial gap-1 px-4 data-active:text-white"
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="text-xs opacity-70">({tab.count})</span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="upcoming" className="mt-0">
        {upcoming.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} djSlug={djSlug} />
            ))}
          </div>
        ) : (
          <EmptyState message="No upcoming events." />
        )}
      </TabsContent>

      <TabsContent value="past" className="mt-0">
        {past.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {past.map((event) => (
              <EventCard key={event.id} event={event} djSlug={djSlug} />
            ))}
          </div>
        ) : (
          <EmptyState message="No past events." />
        )}
      </TabsContent>

      <TabsContent value="drafts" className="mt-0">
        {drafts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {drafts.map((event) => (
              <EventCard key={event.id} event={event} djSlug={djSlug} />
            ))}
          </div>
        ) : (
          <EmptyState message="No draft events." />
        )}
      </TabsContent>
    </Tabs>
  );
}

function EventCard({ event, djSlug }: { event: DjEventItem; djSlug: string }) {
  const router = useRouter();
  const categoryLabel = CATEGORY_LABELS[event.category] ?? event.category;
  const statusTheme = STATUS_THEME[event.status] ?? {
    label: event.status,
    className: "bg-gray-500/15 text-gray-300",
  };
  const isPrivate = event.eventType === "PRIVATE";
  const isOwnEvent = event.ownerSlug === djSlug;

  const dateDisplay = new Date(event.startDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-colors hover:border-white/20 hover:bg-white/3"
    >
      <div className="relative h-40 overflow-hidden">
        {event.posterUrl ? (
          <Image
            src={event.posterUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="from-h_redDark/30 flex h-full w-full items-center justify-center bg-linear-to-br to-black">
            <ImageIcon className="h-10 w-10 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isPrivate && (
            <span className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-zinc-400 backdrop-blur-sm">
              <Lock className="h-2.5 w-2.5" />
              Private
            </span>
          )}
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-zinc-300 backdrop-blur-sm">
            {categoryLabel}
          </span>
          {event.featured && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] text-amber-300 backdrop-blur-sm">
              <Star className="h-2.5 w-2.5" />
              Featured
            </span>
          )}
        </div>

        {event.isOwner && (
          <div className="absolute top-3 right-3">
            <Button
              size="sm"
              variant="secondary"
              className="h-7 gap-1 bg-black/60 text-xs text-white backdrop-blur-sm hover:bg-black/80"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/events/${event.slug}/edit`);
              }}
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
          </div>
        )}

        <div className="absolute right-3 bottom-3 left-3">
          <h3 className="text-lg leading-tight font-bold text-white drop-shadow-md">
            {event.title}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={`${statusTheme.className} border-0`}
          >
            {statusTheme.label}
          </Badge>
          <span className="text-xs text-gray-400">{event.role}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-300">
          <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
          <span>{dateDisplay}</span>
          {event.venue && (
            <>
              <span className="text-gray-400">·</span>
              <span className="text-gray-400">{event.venue}</span>
            </>
          )}
        </div>

        {event.location && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3 text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {event.viewCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {event.savedCount}
            </span>
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3.5 w-3.5" />
              {event.galleryCount}
            </span>
          </div>
          <span className="text-h_redLight group-hover:text-h_redLightLight flex items-center gap-1">
            Details
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-16 text-center">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
