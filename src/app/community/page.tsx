import AddPostWrapper from "@/components/feed/AddPostWrapper";
import CommunityRightPanel from "@/components/feed/CommunityRightPanel";
import Feed from "@/components/feed/Feed";
import FeedTabs from "@/components/feed/FeedTabs";
import Stories from "@/components/feed/Stories";
import LeftMenu from "@/components/leftMenu/LeftMenu";
import { Badge } from "@/components/ui/badge";
import { Flame, Headphones, Music2, Users, Zap } from "lucide-react";

const CommunityPage = () => {
  return (
    <>
      {/* ── Hero Banner ── */}
      <section className="bg-h_blackLight/30 border-b border-gray-800 px-4 py-10 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center md:px-8">
          {/* Left — icon + title + subtitle */}
          <div className="flex items-center gap-4">
            <div className="bg-h_red/10 border-h_red/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
              <Users className="text-h_red h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-h_white text-3xl font-bold md:text-5xl">
                DJ <span className="text-h_red/80">Community</span>
              </h1>
              <p className="text-sm tracking-wide text-gray-400">
                Share posts and connect with the DJ community.
              </p>
            </div>
          </div>

          {/* Right — community stat badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-h_red/10 text-h_red border-h_red/20 gap-1.5 border px-3 py-1">
              <Headphones className="h-3 w-3" /> 1.2k DJs
            </Badge>
            <Badge className="gap-1.5 border border-gray-700 bg-gray-800/80 px-3 py-1 text-gray-300">
              <Users className="h-3 w-3" /> 4.8k Members
            </Badge>
            <Badge className="gap-1.5 border border-gray-700 bg-gray-800/80 px-3 py-1 text-gray-300">
              <Zap className="h-3 w-3 text-yellow-400" /> Active Now
            </Badge>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        {/* ── Step 2: Active DJs Bar ── */}
        {/*
        WHY here: Placing Stories full-width above the 3-column layout
        gives it prominence without being tied to one column.
        It sets the social/live tone before the user hits the feed.
      */}
        {/* <div className="mb-6">
        <Stories />
      </div> */}

        {/*
        ── Responsive 3-column layout ──
        Mobile  (< md  / iPhone):  single column — only center shows
        Tablet  (md+   / iPad):    2-col — center (flex-1) + right (w-72)
        Desktop (xl+   / laptop):  3-col — left (w-56) + center (flex-1) + right (w-72)

        Using flex-1 + min-w-0 for center instead of percentages:
        it naturally fills whatever space the sidebars leave behind,
        so the layout stays correct at every breakpoint without
        hard-coded width arithmetic.
      */}
        <div className="flex gap-4 py-6 md:gap-6">
          {/* Left — xl+ only, fixed width */}
          <div className="hidden w-56 shrink-0 xl:block">
            <LeftMenu type="home" />
          </div>

          {/* ── Step 3: Center — Tabbed Feed ── */}
          {/*
          WHY pass content as props (not render inside FeedTabs):
          FeedTabs is a client component (needs "use client" for Tabs).
          Feed and AddPost are server components. In Next.js App Router,
          server components can be passed as props/children INTO client
          components — they pre-render on the server and get slotted in.
          This avoids wrapping Feed in "use client" which would break
          server-side data fetching.
        */}
          <div className="min-w-0 flex-1">
            <FeedTabs
              forYouContent={
                <div className="flex flex-col gap-6">
                  <AddPostWrapper />
                  <Feed />
                </div>
              }
              followingContent={
                <div className="bg-h_blackLight/50 flex flex-col items-center gap-3 rounded-lg border border-gray-800 p-8 text-center">
                  <Music2 className="text-h_red/60 h-10 w-10" />
                  <p className="text-h_white font-semibold">
                    Following feed coming soon
                  </p>
                  <p className="max-w-xs text-sm text-gray-400">
                    Posts from DJs you follow will appear here once the filtered
                    feed is implemented.
                  </p>
                </div>
              }
              trendingContent={
                <div className="bg-h_blackLight/50 flex flex-col items-center gap-3 rounded-lg border border-gray-800 p-8 text-center">
                  <Flame className="text-h_red/60 h-10 w-10" />
                  <p className="text-h_white font-semibold">
                    Trending feed coming soon
                  </p>
                  <p className="max-w-xs text-sm text-gray-400">
                    We&apos;ll surface the hottest posts, mixes, and DJs ranked
                    by community engagement.
                  </p>
                </div>
              }
            />
          </div>

          {/* ── Step 4: Right — Community-specific panel ── */}
          {/*
          WHY md: not lg: for the right panel:
          On iPad (768px+) the screen is wide enough for a 2-column
          layout. Showing the right panel from md: means iPad users
          get Trending DJs + Events without needing a full desktop.
          Fixed w-72 (288px) keeps it consistent across md/lg/xl.
        */}
          <div className="hidden w-72 shrink-0 md:block">
            <CommunityRightPanel />
          </div>
        </div>
      </div>
    </>
  );
};

export default CommunityPage;
