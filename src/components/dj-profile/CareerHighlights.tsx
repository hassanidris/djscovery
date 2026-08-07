"use client";

import {
  Trophy,
  TrendingUp,
  Flame,
  Zap,
  CircleCheck,
  Shield,
  Handshake,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "./dj-profile-shared";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const HIGHLIGHT_ICONS: LucideIcon[] = [
  Trophy,
  Flame,
  TrendingUp,
  Zap,
  CircleCheck,
  Shield,
  Handshake,
];

export interface CareerHighlight {
  year: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
}

interface CareerHighlightsProps {
  highlights: CareerHighlight[];
  isOwner?: boolean;
  onAddHighlight?: () => void;
}

function EmptySectionState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/2 py-12 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-gray-400">{description}</p>
      {onAction && (
        <Button
          onClick={onAction}
          variant="ghost"
          size="sm"
          className="mt-4 text-xs text-gray-400 hover:text-white"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default function CareerHighlights({
  highlights,
  isOwner = false,
  onAddHighlight,
}: CareerHighlightsProps) {
  // Assign icons if not provided
  const highlightsWithIcons = highlights.map((h, i) => ({
    ...h,
    icon: h.icon || HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length],
  }));

  if (highlights.length === 0 && isOwner) {
    return (
      <EmptySectionState
        icon={Trophy}
        title="No career highlights yet"
        description="Showcase your key milestones and achievements to build credibility with organizers."
        actionLabel="Add your first highlight"
        onAction={onAddHighlight}
      />
    );
  }

  if (highlights.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <SectionHeading sub="Key milestones and achievements">
          Career Highlights
        </SectionHeading>
        {isOwner && onAddHighlight && (
          <Button
            onClick={onAddHighlight}
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white"
          >
            <Plus className="mr-1 h-3 w-3" />
            Add Highlight
          </Button>
        )}
      </div>
      <div className="relative flex flex-col gap-0">
        {highlightsWithIcons.map((h, i) => {
          const HIcon = h.icon;
          return (
            <div key={i} className="flex gap-4 pb-6 last:pb-0">
              <div className="flex flex-col items-center">
                <div className="bg-h_red/10 border-h_red/20 flex size-9 shrink-0 items-center justify-center rounded-full border">
                  <HIcon className="text-h_redLight h-3.5 w-3.5" />
                </div>
                {i < highlightsWithIcons.length - 1 && (
                  <div className="mt-2 w-px flex-1 bg-white/8" />
                )}
              </div>
              <div className="pt-1.5 pb-1">
                <p className="text-sm font-semibold text-white">{h.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">{h.year}</p>
                {h.description && (
                  <p className="mt-1 text-xs text-gray-400">{h.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
