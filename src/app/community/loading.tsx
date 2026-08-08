import {
  AddPostSkeleton,
  FeedSkeleton,
  ProfileCardSkeleton,
  RightPanelSkeleton,
  SuggestedDJsSkeleton,
} from "@/components/ui/skeletons";
import { Badge } from "@/components/ui/badge";
import { Headphones, Users, Zap } from "lucide-react";

export default function CommunityLoading() {
  return (
    <>
      {/* Hero Banner — mirrors actual page to avoid CLS */}
      <section className="bg-h_blackLight/30 border-b border-gray-800 px-4 py-10 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center md:px-8">
          <div className="flex items-center gap-4">
            <div className="bg-h_red/10 border-h_red/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
              <Users className="text-h_redLight h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-h_white text-3xl font-bold md:text-5xl">
                DJ <span className="text-h_redLight/80">Community</span>
              </h1>
              <p className="text-sm tracking-wide text-gray-400">
                Share posts and connect with the DJ community
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-h_red/10 text-h_redLight border-h_red/20 gap-1.5 border px-3 py-1">
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
        <div className="flex gap-4 py-6 md:gap-6">
          {/* Left panel — mirrors LeftMenu layout */}
          <div className="hidden w-56 shrink-0 gap-5 xl:flex xl:flex-col">
            <ProfileCardSkeleton />
            <SuggestedDJsSkeleton />
          </div>

          {/* Center — feed skeleton */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {/* Tab bar skeleton */}
            <div className="flex gap-1 border-b border-gray-800 pb-1">
              {["For You", "Following", "Trending"].map((label) => (
                <div
                  key={label}
                  className="bg-h_blackLight/50 flex h-8 animate-pulse items-center rounded-t-md px-4"
                >
                  <span className="text-xs text-transparent select-none">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <AddPostSkeleton />
            <FeedSkeleton count={3} />
          </div>

          {/* Right panel */}
          <div className="hidden w-72 shrink-0 md:block">
            <RightPanelSkeleton />
          </div>
        </div>
      </div>
    </>
  );
}
