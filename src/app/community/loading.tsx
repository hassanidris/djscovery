import {
  AddPostSkeleton,
  FeedSkeleton,
  RightPanelSkeleton,
} from "@/components/ui/skeletons";
import { Badge } from "@/components/ui/badge";
import { Headphones, Users, Zap } from "lucide-react";

export default function CommunityLoading() {
  return (
    <>
      {/* Hero Banner — mirrors actual page to avoid CLS */}
      <section className="bg-h_blackLight/30 border-b border-gray-800 py-10 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <div className="max-w-7xl w-full mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-h_red/10 border border-h_red/20 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-h_red" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-h_white font-bold text-3xl md:text-5xl">
                DJ <span className="text-h_red/80">Community</span>
              </h1>
              <p className="text-gray-400 text-sm tracking-wide">
                Share posts and connect with the DJ community
              </p>
            </div>
          </div>
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
      </section>

      <div className="max-w-7xl w-full mx-auto px-4 md:px-8">
        <div className="flex gap-4 md:gap-6 py-6">
          {/* Left panel placeholder — keeps layout stable */}
          <div className="hidden xl:block w-56 shrink-0" />

          {/* Center — feed skeleton */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Tab bar skeleton */}
            <div className="flex gap-1 border-b border-gray-800 pb-1">
              {["For You", "Following", "Trending", "Events"].map((label) => (
                <div
                  key={label}
                  className="h-8 px-4 rounded-t-md bg-h_blackLight/50 animate-pulse flex items-center"
                >
                  <span className="text-transparent text-xs select-none">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <AddPostSkeleton />
            <FeedSkeleton count={3} />
          </div>

          {/* Right panel */}
          <div className="hidden md:block w-72 shrink-0">
            <RightPanelSkeleton />
          </div>
        </div>
      </div>
    </>
  );
}
