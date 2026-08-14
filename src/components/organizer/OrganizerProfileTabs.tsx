"use client";

import { useState } from "react";
import { Star, Briefcase, Info, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "about" | "gigs" | "reviews";

interface OrganizerProfileTabsProps {
  about: React.ReactNode;
  gigs: React.ReactNode;
  reviews: React.ReactNode;
  defaultTab?: Tab;
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "about", label: "About", icon: Info },
  { id: "gigs", label: "Gigs", icon: Briefcase },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
];

export default function OrganizerProfileTabs({
  about,
  gigs,
  reviews,
  defaultTab = "about",
}: OrganizerProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  return (
    <div>
      {/* Tab bar */}
      <div className="sticky top-0 z-20 -mx-4 mb-8 border-b border-white/10 bg-black/80 px-4 backdrop-blur-xl md:-mx-8 md:px-8">
        <div className="mx-auto flex max-w-3xl gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-200",
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {isActive && (
                  <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-h_red" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex flex-col gap-10 pb-20">
        {activeTab === "about" && about}
        {activeTab === "gigs" && gigs}
        {activeTab === "reviews" && reviews}
      </div>
    </div>
  );
}
