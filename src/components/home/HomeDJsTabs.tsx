"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils/currency";
import { Card } from "@/components/ui/card";
import type { DemoDJ } from "./HomeDJsRow";

type Props = {
  newDJs: DemoDJ[];
  trendingDJs: DemoDJ[];
};

export default function HomeDJsTabs({ newDJs, trendingDJs }: Props) {
  const [activeTab, setActiveTab] = useState<"new" | "trending">("new");

  const viewAllHref =
    activeTab === "new" ? "/directory?sort=new" : "/directory?sort=trending";

  return (
    <section className="border-t border-white/5 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Tabs
          defaultValue="new"
          onValueChange={(v) => setActiveTab(v as "new" | "trending")}
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
                Discover DJs
              </h2>
              <TabsList className="bg-h_blackLight/80 border border-white/10">
                <TabsTrigger
                  value="new"
                  className="data-[state=active]:bg-h_red data-[state=active]:text-white"
                >
                  Just Joined
                  <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
                    {newDJs.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="trending"
                  className="data-[state=active]:bg-h_red data-[state=active]:text-white"
                >
                  Trending
                  <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
                    {trendingDJs.length}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-h_red hover:text-h_red hover:bg-white/5"
            >
              <Link href={viewAllHref}>View all →</Link>
            </Button>
          </div>

          <TabsContent
            value="new"
            className="data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:duration-200"
          >
            <ScrollArea className="w-full">
              <div className="flex items-stretch gap-4 px-1 pt-1 pb-4">
                {newDJs.map((dj) => (
                  <DJCard key={dj.id} dj={dj} showNew />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>

          <TabsContent
            value="trending"
            className="data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:duration-200"
          >
            <ScrollArea className="w-full">
              <div className="flex items-stretch gap-4 px-1 pt-1 pb-4">
                {trendingDJs.map((dj, index) => (
                  <DJCard key={dj.id} dj={dj} rank={index + 1} />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function DJCard({
  dj,
  showNew,
  rank,
}: {
  dj: DemoDJ;
  showNew?: boolean;
  rank?: number;
}) {
  return (
    <Link
      href={dj.slug ? `/djs/${dj.slug}` : "/directory"}
      className="block h-full"
    >
      <Card className="bg-h_blackLight/50 hover:ring-h_red relative flex h-full w-56 shrink-0 cursor-pointer flex-col gap-3 overflow-visible p-4 ring-white/5 transition-all">
        {rank !== undefined && (
          <Badge className="bg-h_redDark/50 text-h_red absolute top-2 left-2 border-0">
            #{rank}
          </Badge>
        )}
        {showNew && (
          <Badge className="bg-h_red absolute top-2 right-2 border-0 text-white">
            NEW
          </Badge>
        )}

        <div className="flex flex-col items-center gap-2 pt-2 text-center">
          <div className="relative">
            <Avatar
              className={`size-20 ring-2 ring-offset-2 ring-offset-black ${
                dj.isPremium ? "ring-amber-400" : "ring-h_red"
              }`}
            >
              <AvatarImage src={dj.avatar} alt={dj.stageName} />
              <AvatarFallback className="bg-h_redDark text-lg text-white">
                {dj.stageName[0] || "?"}
              </AvatarFallback>
            </Avatar>
            {dj.isPremium && (
              <div className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border-2 border-black bg-amber-400">
                <FontAwesomeIcon
                  icon={faCrown}
                  className="h-3 w-3 text-black"
                />
              </div>
            )}
          </div>
          <div>
            <p className="mx-auto w-40 truncate text-sm leading-tight font-semibold text-white">
              Dj. {dj.stageName}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              📍 {dj.city}, {dj.country}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-1">
          {dj.genres.slice(0, 2).map((g) => (
            <Badge
              key={g}
              className="bg-h_redDark/60 border-0 whitespace-nowrap text-red-300"
            >
              {g.length > 11 ? `${g.slice(0, 10)}…` : g}
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-2 text-xs text-gray-400">
          <span>⭐ {dj.rating}</span>
          <span>{formatNumber(dj.followers)} followers</span>
        </div>
      </Card>
    </Link>
  );
}
