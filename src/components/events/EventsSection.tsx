"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ScrollableCarousel from "@/components/ScrollableCarousel";
import { EventCard, type EventCardItem } from "./EventCard";

type EventInput = {
  id: number;
  slug: string;
  title: string;
  eventType: string;
  category: string;
  startDate: Date;
  posterUrl: string | null;
  location: string;
  djName: string;
  djSlug: string;
  isDemo: boolean;
};

interface Props {
  trendingEvents: EventInput[];
  newEvents: EventInput[];
  savedEventIds?: number[];
}

function toEventCardItems(
  events: EventInput[],
  savedEventIds: number[],
): EventCardItem[] {
  return events.map((event) => ({
    slug: event.slug,
    title: event.title,
    eventType: event.eventType,
    category: event.category,
    startDate: event.startDate,
    posterUrl: event.posterUrl,
    location: event.location,
    djName: event.djName,
    djSlug: event.djSlug,
    isDemo: event.isDemo,
    eventId: event.isDemo ? undefined : event.id,
  }));
}

export function EventsSection({
  trendingEvents,
  newEvents,
  savedEventIds = [],
}: Props) {
  const [activeTab, setActiveTab] = useState<"trending" | "new">("trending");

  if (trendingEvents.length === 0 && newEvents.length === 0) {
    return null;
  }

  const trendingItems = toEventCardItems(trendingEvents, savedEventIds);
  const newItems = toEventCardItems(newEvents, savedEventIds);

  const viewAllHref =
    activeTab === "trending" ? "/events?sort=trending" : "/events?sort=new";

  return (
    <section className="border-t border-white/5 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Tabs
          defaultValue="trending"
          onValueChange={(v) => setActiveTab(v as "trending" | "new")}
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
                  Events
                </h2>
                <TabsList className="bg-h_blackLight/80 border border-white/10">
                  <TabsTrigger
                    value="trending"
                    className="data-[state=active]:bg-h_red data-[state=active]:text-white"
                  >
                    Trending
                    <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
                      {trendingEvents.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="new"
                    className="data-[state=active]:bg-h_red data-[state=active]:text-white"
                  >
                    New
                    <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
                      {newEvents.length}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-gray-400">
                One rail, switch between trending and newest
                <span className="text-gray-400">
                  {" · "}
                  {activeTab === "trending"
                    ? "Sorted by popularity"
                    : "Newest events first"}
                </span>
              </p>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-h_red/80 hover:text-h_red/80 shrink-0 hover:bg-white/5"
            >
              <Link href={viewAllHref}>View all →</Link>
            </Button>
          </div>

          <TabsContent
            value="trending"
            className="data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:duration-200"
          >
            <ScrollableCarousel
              contentClassName="items-stretch px-1 pt-1 pb-4"
              peek={24}
            >
              {trendingItems.map((event) => (
                <div key={event.slug} className="w-72 shrink-0">
                  <EventCard
                    event={event}
                    isSaved={
                      event.eventId
                        ? savedEventIds.includes(event.eventId)
                        : false
                    }
                  />
                </div>
              ))}
            </ScrollableCarousel>
          </TabsContent>

          <TabsContent
            value="new"
            className="data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:duration-200"
          >
            <ScrollableCarousel
              contentClassName="items-stretch px-1 pt-1 pb-4"
              peek={24}
            >
              {newItems.map((event) => (
                <div key={event.slug} className="w-72 shrink-0">
                  <EventCard
                    event={event}
                    isSaved={
                      event.eventId
                        ? savedEventIds.includes(event.eventId)
                        : false
                    }
                  />
                </div>
              ))}
            </ScrollableCarousel>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
