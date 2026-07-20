"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
};

const TABS: Tab[] = [
  { id: "about", label: "About" },
  { id: "events", label: "Events" },
  { id: "media", label: "Media" },
  { id: "press", label: "Press" },
  { id: "packages", label: "Packages" },
];

type Props = {
  onTabClick?: (tabId: string) => void;
};

export default function DjProfileSubNav({ onTabClick }: Props) {
  const [activeTab, setActiveTab] = useState<string>("about");

  const scrollToSection = (tabId: string) => {
    const element = document.getElementById(tabId);
    if (element) {
      const mainNavHeight = 64; // Main navigation bar height
      const subNavTopOffset = 112; // top-28 sticky position (28 * 4px)
      const subNavHeight = 60; // Approximate height of sub-navigation
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition =
        elementPosition - mainNavHeight - subNavTopOffset - subNavHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveTab(tabId);
      onTabClick?.(tabId);
    }
  };

  // Scroll spy to highlight active tab based on scroll position
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // Trigger when section is in middle of viewport
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all sections
    TABS.forEach((tab) => {
      const element = document.getElementById(tab.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div>
      <div className="scrollbar-hide flex gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => scrollToSection(tab.id)}
            className={cn(
              "focus-visible:ring-h_red/50 relative rounded-md px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
              activeTab === tab.id
                ? "bg-white/10 text-white shadow-sm"
                : "text-gray-500 hover:bg-white/5 hover:text-gray-300",
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="bg-h_red absolute right-3 bottom-1 left-3 h-0.5 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
