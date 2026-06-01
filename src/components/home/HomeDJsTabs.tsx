"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DemoDJ } from "./HomeDJsRow";

type Props = {
  newDJs: DemoDJ[];
  trendingDJs: DemoDJ[];
};

export default function HomeDJsTabs({ newDJs, trendingDJs }: Props) {
  return (
    <section className="py-12 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 border-t border-white/5">
      <Tabs defaultValue="new">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-white text-3xl md:text-4xl">Discover DJs</h2>
            <TabsList className="bg-h_blackLight/80 border border-white/10">
              <TabsTrigger
                value="new"
                className="data-[state=active]:bg-h_purple data-[state=active]:text-black"
              >
                Just Joined
              </TabsTrigger>
              <TabsTrigger
                value="trending"
                className="data-[state=active]:bg-h_purple data-[state=active]:text-black"
              >
                Trending
              </TabsTrigger>
            </TabsList>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-h_purple hover:text-h_purple hover:bg-white/5"
          >
            <Link href="/directory">View all →</Link>
          </Button>
        </div>

        <TabsContent value="new">
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4 px-1 pt-1 items-stretch">
              {newDJs.map((dj) => (
                <DJCard key={dj.id} dj={dj} showNew />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="trending">
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4 px-1 pt-1 items-stretch">
              {trendingDJs.map((dj, index) => (
                <DJCard key={dj.id} dj={dj} rank={index + 1} />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </TabsContent>
      </Tabs>
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
    <Link href="/directory" className="block h-full">
      <Card className="relative shrink-0 w-56 h-full flex flex-col bg-h_blackLight/50 ring-white/5 hover:ring-h_purple gap-3 p-4 cursor-pointer transition-all overflow-visible">
        {rank !== undefined && (
          <Badge className="absolute top-2 left-2 bg-h_purpleDark/50 text-h_purple border-0">
            #{rank}
          </Badge>
        )}
        {showNew && (
          <Badge className="absolute top-2 right-2 bg-h_purple text-black border-0">
            NEW
          </Badge>
        )}

        <div className="flex flex-col items-center gap-2 text-center pt-2">
          <Avatar className="size-20 ring-2 ring-h_purple ring-offset-2 ring-offset-black">
            <AvatarImage src={dj.avatar} alt={dj.stageName} />
            <AvatarFallback className="bg-h_purpleDark text-white text-lg">
              {dj.stageName[0] || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-semibold text-sm leading-tight truncate w-40 mx-auto">
              {dj.stageName}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              📍 {dj.city}, {dj.country}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 justify-center">
          {dj.genres.slice(0, 2).map((g) => (
            <Badge
              key={g}
              className="bg-h_purpleDark/60 text-h_purple border-0"
            >
              {g}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 mt-auto border-t border-white/5 pt-2">
          <span>⭐ {dj.rating}</span>
          <span>{dj.followers.toLocaleString()} fans</span>
        </div>
      </Card>
    </Link>
  );
}
