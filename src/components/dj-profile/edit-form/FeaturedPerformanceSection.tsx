"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/forms/SectionCard";

export function FeaturedPerformanceSection({
  featuredPerformanceUrl,
  setFeaturedPerformanceUrl,
  featuredPerformanceContext,
  setFeaturedPerformanceContext,
}: {
  featuredPerformanceUrl: string;
  setFeaturedPerformanceUrl: (v: string) => void;
  featuredPerformanceContext: string;
  setFeaturedPerformanceContext: (v: string) => void;
}) {
  return (
    <SectionCard
      title="Featured Performance"
      subtitle="Highlight one video that shows you at your best"
    >
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label className="text-xs text-gray-300">YouTube / Vimeo URL</Label>
          <Input
            type="url"
            value={featuredPerformanceUrl}
            onChange={(e) => setFeaturedPerformanceUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-400"
          />
          <p className="text-[11px] text-gray-400">
            Paste a link to a performance video. Leave empty to hide the section
            on your profile.
          </p>
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs text-gray-300">Context</Label>
          <Input
            type="text"
            value={featuredPerformanceContext}
            onChange={(e) => setFeaturedPerformanceContext(e.target.value)}
            placeholder="e.g. Live at Afro Nation 2025"
            maxLength={200}
            className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-400"
          />
        </div>
      </div>
    </SectionCard>
  );
}
