"use client";

/*
  WHY this is a client component:
  shadcn Tabs uses Radix UI under the hood which needs browser
  interactivity (click events) to switch tabs — that requires
  "use client". 

  BUT the actual feed content (Feed, AddPost) stays server-rendered.
  Next.js App Router lets us pass server components as React children /
  props into client components. The server page builds each tab's
  content and passes it in — this component just handles the switching.

  COMPONENTS USED:
  - shadcn Tabs / TabsList / TabsTrigger / TabsContent
    → provides accessible keyboard navigation and ARIA roles
      for free (no custom logic needed)
  - Custom className overrides on TabsList/TabsTrigger
    → the default shadcn tab looks light-themed; we override it
      to match the dark h_blackLight platform aesthetic with the
      h_red bottom border for the active indicator
*/

import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Music2, Rss } from "lucide-react";

interface FeedTabsProps {
  forYouContent: ReactNode;
  followingContent: ReactNode;
  trendingContent: ReactNode;
}

const FeedTabs = ({
  forYouContent,
  followingContent,
  trendingContent,
}: FeedTabsProps) => {
  return (
    <Tabs defaultValue="for-you" className="w-full">
      {/*
        TabsList styling breakdown:
        - bg-h_blackLight/50 + border → matches the dark card style
          used everywhere else on the platform (Feed, AddPost cards)
        - w-full → stretches to fill the center column
        - rounded-lg → consistent with other card components
        - p-1 → small inset so triggers have breathing room
      */}
      <TabsList className="w-full bg-h_blackLight/50 border border-gray-800 rounded-lg p-1 mb-4 h-auto">
        {/*
          WHY hidden sm:inline on the text spans:
          On iPhone (< 640px) 4 tabs with text + icon don't fit.
          Below sm: we show icons only (enough to understand).
          From sm: up (iPad Mini+) the full label appears.
          The icon always shows so the tab is never ambiguous.
        */}
        <TabsTrigger
          value="for-you"
          className="flex-1 gap-1.5 text-gray-400 data-[state=active]:text-h_white data-[state=active]:bg-gray-800 data-[state=active]:border-b-2 data-[state=active]:border-h_red rounded-md py-2 text-sm transition-all"
        >
          <Rss className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">For You</span>
        </TabsTrigger>

        <TabsTrigger
          value="following"
          className="flex-1 gap-1.5 text-gray-400 data-[state=active]:text-h_white data-[state=active]:bg-gray-800 data-[state=active]:border-b-2 data-[state=active]:border-h_red rounded-md py-2 text-sm transition-all"
        >
          <Music2 className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Following</span>
        </TabsTrigger>

        <TabsTrigger
          value="trending"
          className="flex-1 gap-1.5 text-gray-400 data-[state=active]:text-h_white data-[state=active]:bg-gray-800 data-[state=active]:border-b-2 data-[state=active]:border-h_red rounded-md py-2 text-sm transition-all"
        >
          <Flame className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Trending</span>
        </TabsTrigger>
      </TabsList>

      {/* Tab 1 — For You: the default community feed */}
      <TabsContent value="for-you" className="mt-0">
        {forYouContent}
      </TabsContent>

      {/* Tab 2 — Following: same feed filtered to people you follow */}
      <TabsContent value="following" className="mt-0">
        {followingContent}
      </TabsContent>

      {/*
        Tab 3 — Trending: placeholder for now.
        WHY placeholder and not empty: an empty state is confusing.
        A styled "coming soon" card maintains the visual quality and
        sets expectations without hiding the feature entirely.
      */}
      <TabsContent value="trending" className="mt-0">
        {trendingContent}
      </TabsContent>
    </Tabs>
  );
};

export default FeedTabs;
