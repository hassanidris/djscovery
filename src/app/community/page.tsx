import AddPostWrapper from "@/components/feed/AddPostWrapper";
import CommunityRightPanel from "@/components/feed/CommunityRightPanel";
import Feed from "@/components/feed/Feed";
import FeedTabs from "@/components/feed/FeedTabs";
import Stories from "@/components/feed/Stories";
import LeftMenu from "@/components/leftMenu/LeftMenu";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Flame, Headphones, Users, Zap } from "lucide-react";

const CommunityPage = () => {
  return (
    <div className="px-3 sm:px-6 lg:px-12 xl:px-24 2xl:px-48">
      {/* ── Step 1: Immersive Header Banner ── */}
      {/*
        WHY: The old header was just an icon + two lines of text.
        This banner uses layered gradients to create depth, a red glow
        blob for brand identity, and shadcn Badge components to surface
        community stats at a glance — making it immediately feel like
        a music platform, not a generic social app.
      */}
      <div className="relative overflow-hidden rounded-xl mt-4 mb-6 border border-gray-800">
        {/* Layer 1: base dark gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-h_blackLight to-gray-950" />
        {/* Layer 2: red tint on the left edge */}
        <div className="absolute inset-0 bg-linear-to-r from-h_red/10 via-transparent to-transparent" />
        {/* Layer 3: ambient red glow blob */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-h_red/10 rounded-full blur-3xl pointer-events-none" />

        {/* Banner content */}
        <div className="relative px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left — icon + title + subtitle */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-h_red/10 border border-h_red/20 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-h_red" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-h_white tracking-tight">
                Community
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Share posts and connect with the DJ community
              </p>
            </div>
          </div>

          {/* Right — community stat badges */}
          {/*
            WHY shadcn Badge: consistent sizing, accessible, easy to
            customise per variant. Each badge gives a quick stat that
            signals this is an active, populated community.
          */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-h_red/10 text-h_red border border-h_red/20 gap-1.5 py-1 px-3">
              <Headphones className="w-3 h-3" /> 1.2k DJs
            </Badge>
            <Badge className="bg-gray-800/80 text-gray-300 border border-gray-700 gap-1.5 py-1 px-3">
              <Users className="w-3 h-3" /> 4.8k Members
            </Badge>
            <Badge className="bg-gray-800/80 text-gray-300 border border-gray-700 gap-1.5 py-1 px-3">
              <Zap className="w-3 h-3 text-yellow-400" /> Active Now
            </Badge>
          </div>
        </div>

        {/* Bottom accent line — thin red glow strip */}
        <div className="h-px bg-linear-to-r from-transparent via-h_red/40 to-transparent" />
      </div>

      {/* ── Step 2: Active DJs Bar ── */}
      {/*
        WHY here: Placing Stories full-width above the 3-column layout
        gives it prominence without being tied to one column.
        It sets the social/live tone before the user hits the feed.
      */}
      <div className="mb-6">
        <Stories />
      </div>

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
      <div className="flex gap-4 md:gap-6 py-6">
        {/* Left — xl+ only, fixed width */}
        <div className="hidden xl:block w-56 shrink-0">
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
        <div className="flex-1 min-w-0">
          <FeedTabs
            forYouContent={
              <div className="flex flex-col gap-6">
                <AddPostWrapper />
                <Feed />
              </div>
            }
            followingContent={
              <div className="flex flex-col gap-6">
                <AddPostWrapper />
                <Feed />
              </div>
            }
            trendingContent={
              <div className="p-8 bg-h_blackLight/50 rounded-lg border border-gray-800 flex flex-col items-center gap-3 text-center">
                <Flame className="w-10 h-10 text-h_red/60" />
                <p className="text-h_white font-semibold">
                  Trending feed coming soon
                </p>
                <p className="text-gray-400 text-sm max-w-xs">
                  We&apos;ll surface the hottest posts, mixes, and DJs ranked by
                  community engagement.
                </p>
              </div>
            }
            eventsContent={
              <div className="p-8 bg-h_blackLight/50 rounded-lg border border-gray-800 flex flex-col items-center gap-3 text-center">
                <CalendarDays className="w-10 h-10 text-h_red/60" />
                <p className="text-h_white font-semibold">
                  Events feed coming soon
                </p>
                <p className="text-gray-400 text-sm max-w-xs">
                  Upcoming gigs, club nights, and festival announcements from
                  DJs you follow will appear here.
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
        <div className="hidden md:block w-72 shrink-0">
          <CommunityRightPanel />
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
