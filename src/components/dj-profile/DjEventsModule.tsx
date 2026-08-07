"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Plus, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, isValid, parseISO } from "date-fns";
import type { EventItem } from "@/components/dj-profile/dj-profile-shared";
import MediaVideoModal from "@/components/dj-profile/MediaVideoModal";
import { getMediaProvider, getVideoThumbnailUrl } from "@/lib/media-utils";

type CalendarDay = {
  day: number;
  status: "available" | "booked" | "tentative" | "free";
};

type Props = {
  events: EventItem[];
  calendarDays: CalendarDay[];
  calendarLabel: string;
  isOwner?: boolean;
  djName?: string;
  featuredPerformanceUrl?: string;
  featuredPerformanceContext?: string;
  featuredPerformanceThumbnailUrl?: string;
  showCalendar?: boolean;
};

function EventCard({ e, isOwner }: { e: EventItem; isOwner?: boolean }) {
  const parsedDate = parseISO(e.date);
  const month = isValid(parsedDate) ? format(parsedDate, "MMM") : "—";
  const day = isValid(parsedDate) ? format(parsedDate, "d") : "—";

  return (
    <Card className="bg-h_blackLight/30 min-w-65 gap-0 border-white/8 p-4 transition-colors hover:border-white/15 sm:min-w-0">
      <div className="flex items-start gap-4">
        <div className="bg-h_red/10 border-h_red/20 flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md border">
          <span className="text-h_redLight text-[10px] leading-none font-bold uppercase">
            {month}
          </span>
          <span className="mt-0.5 text-base leading-none font-bold text-white">
            {day}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{e.title}</p>
          <p className="mt-1 text-xs text-gray-400">
            {[e.venue, e.city].filter(Boolean).join(" · ")}
          </p>
          <div className="mt-2 flex items-center gap-2">
            {e.status === "tentative" && (
              <Badge className="h-4 border-amber-500/20 bg-amber-500/10 text-[11px] text-amber-400">
                TBC
              </Badge>
            )}
          </div>
        </div>
        {e.slug ? (
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-8 shrink-0 border-white/15 px-3 text-xs text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <Link href={`/events/${e.slug}`}>See Details</Link>
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

function PastEventRow({ e }: { e: EventItem }) {
  const parsedDate = parseISO(e.date);
  const formattedDate = isValid(parsedDate)
    ? format(parsedDate, "MMM d, yyyy")
    : e.date;

  return (
    <div className="flex min-w-65 items-center gap-4 rounded-lg border border-white/5 bg-white/5 px-4 py-3 sm:min-w-0">
      <span className="shrink-0 text-xs text-gray-400">{formattedDate}</span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
        {e.title}
      </span>
      <span className="shrink-0 text-xs text-gray-400">{e.venue}</span>
      <span className="shrink-0 text-xs text-gray-400">{e.city}</span>
    </div>
  );
}

export default function DjEventsModule({
  events,
  calendarDays,
  calendarLabel,
  isOwner = false,
  djName,
  featuredPerformanceUrl,
  featuredPerformanceContext,
  featuredPerformanceThumbnailUrl,
  showCalendar = true,
}: Props) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const upcoming = events.filter((e) => !e.isPast);
  const past = events.filter((e) => e.isPast);

  const [pastYearFilter, setPastYearFilter] = useState<string>("all");
  const [pastCategoryFilter, setPastCategoryFilter] = useState<string>("all");

  const pastYears = Array.from(
    new Set(past.map((e) => new Date(e.date).getFullYear().toString())),
  ).sort((a, b) => Number(b) - Number(a));
  const pastCategories = Array.from(
    new Set(past.map((e) => e.category).filter(Boolean)),
  ).sort();

  const filteredPast = past.filter((e) => {
    const yearMatch =
      pastYearFilter === "all" ||
      new Date(e.date).getFullYear().toString() === pastYearFilter;
    const categoryMatch =
      pastCategoryFilter === "all" || e.category === pastCategoryFilter;
    return yearMatch && categoryMatch;
  });

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-xl text-white">Events</h2>
        {isOwner && upcoming.length === 0 && (
          <Button
            size="sm"
            variant="outline"
            asChild
            className="h-7 gap-1.5 border-white/15 px-3 text-xs text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <Link href="/dj/events/new">
              <Plus className="h-3 w-3" />
              Add Event
            </Link>
          </Button>
        )}
      </div>

      {/* Featured Performance Card */}
      <div>
        {featuredPerformanceUrl && (
          <MediaVideoModal
            videoUrl={featuredPerformanceUrl}
            thumbnail={
              featuredPerformanceThumbnailUrl ||
              getVideoThumbnailUrl(featuredPerformanceUrl) ||
              "/gallery-2.png"
            }
            title="Featured Performance"
          >
            <Card className="bg-h_blackLight/30 group mb-4 cursor-pointer gap-0 overflow-hidden border-white/8 transition-all hover:border-white/15">
              <div className="flex flex-col sm:flex-row sm:gap-3">
                <div className="relative aspect-video w-full shrink-0 overflow-hidden sm:w-48">
                  <Image
                    src={
                      featuredPerformanceThumbnailUrl ||
                      getVideoThumbnailUrl(featuredPerformanceUrl) ||
                      "/gallery-2.png"
                    }
                    alt="Featured Performance"
                    fill
                    className="object-cover opacity-60 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/50 transition-colors group-hover:bg-black/70 sm:size-8">
                      <Play className="ml-0.5 h-5 w-5 text-white sm:h-4 sm:w-4" />
                    </div>
                  </div>
                  <div className="absolute top-1.5 right-1.5">
                    <Badge className="border-white/10 bg-black/60 text-[9px] text-gray-300 capitalize">
                      {getMediaProvider(featuredPerformanceUrl)}
                    </Badge>
                  </div>
                </div>
                {featuredPerformanceContext && (
                  <div className="flex flex-col justify-center p-3">
                    <p className="text-xs font-semibold text-white">
                      Featured Performance
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {featuredPerformanceContext}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </MediaVideoModal>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-white/8">
        {[
          {
            key: "upcoming" as const,
            label: "Upcoming",
            count: upcoming.length,
          },
          { key: "past" as const, label: "Past", count: past.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "relative px-4 py-2.5 text-xs font-medium transition-colors",
              activeTab === tab.key
                ? "text-white"
                : "text-gray-400 hover:text-gray-300",
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 text-gray-400">({tab.count})</span>
            )}
            {activeTab === tab.key && (
              <div className="bg-h_red absolute right-0 bottom-0 left-0 h-0.5" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "upcoming" && (
        <div className="flex gap-3 overflow-x-auto pb-2 sm:flex-col sm:overflow-visible">
          {upcoming.length === 0 ? (
            <div className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-white/10 px-4 py-8 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-white/5">
                <CalendarDays className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-400">
                Currently booking for Q3 2026 — check availability
              </p>
              {isOwner && (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="mt-4 h-8 border-white/15 px-4 text-xs text-gray-400 hover:bg-white/5 hover:text-white"
                >
                  <Link href="/dj/events/new">
                    <Plus className="mr-1.5 h-3 w-3" />
                    Add Event
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            upcoming.map((e) => (
              <EventCard key={e.id} e={e} isOwner={isOwner} />
            ))
          )}
        </div>
      )}

      {activeTab === "past" && (
        <div className="space-y-3">
          {(pastYears.length > 1 || pastCategories.length > 1) && (
            <div className="flex flex-wrap gap-2">
              {pastYears.length > 1 && (
                <select
                  value={pastYearFilter}
                  onChange={(e) => setPastYearFilter(e.target.value)}
                  className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="all">All years</option>
                  {pastYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              )}
              {pastCategories.length > 1 && (
                <select
                  value={pastCategoryFilter}
                  onChange={(e) => setPastCategoryFilter(e.target.value)}
                  className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="all">All event types</option>
                  {pastCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-col sm:overflow-visible">
            {filteredPast.length === 0 ? (
              <div className="min-w-0 flex-1 py-8 text-center text-sm text-gray-400">
                No past events match the selected filters
              </div>
            ) : (
              filteredPast.map((e) => <PastEventRow key={e.id} e={e} />)
            )}
          </div>
        </div>
      )}

      {/* Calendar Availability — Premium only */}
      {showCalendar && (
        <div className="mt-8">
          <h3 className="mb-4 text-sm font-semibold text-white">
            Calendar Availability
          </h3>
          <div className="mb-4 flex items-center gap-4">
            {[
              { color: "bg-emerald-500", label: "Available" },
              { color: "bg-h_red", label: "Booked" },
              { color: "bg-amber-500", label: "Tentative" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={cn("size-2.5 rounded-full", l.color)} />
                <span className="text-xs text-gray-400">{l.label}</span>
              </div>
            ))}
          </div>
          <Card className="bg-h_blackLight/30 gap-0 border-white/8 p-5">
            <div className="mb-3 text-xs text-gray-400">{calendarLabel}</div>
            <div className="grid grid-cols-7 gap-1.5">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div
                  key={d}
                  className="pb-1 text-center text-[11px] font-semibold text-gray-400"
                >
                  {d}
                </div>
              ))}
              {calendarDays.map(({ day, status }) => (
                <div
                  key={day}
                  className={cn(
                    "flex h-9 cursor-pointer items-center justify-center rounded-md text-xs font-medium transition-all",
                    status === "booked" &&
                      "bg-h_red/20 text-h_redLight border-h_red/30 border",
                    status === "tentative" &&
                      "border border-amber-500/30 bg-amber-500/20 text-amber-400",
                    status === "available" &&
                      "border border-emerald-500/25 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25",
                    status === "free" && "text-gray-400 hover:bg-white/5",
                  )}
                >
                  {day}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </section>
  );
}
