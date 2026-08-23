"use client";

import { forwardRef } from "react";
import { Newspaper, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/dj-profile/dj-profile-shared";

type PressItem = {
  id: number;
  outlet: string;
  type: string;
  title: string;
  date: string;
  url: string;
  icon: any;
};

type Props = {
  press: PressItem[];
  isLoading: boolean;
  isOwner: boolean;
  onAddPress: () => void;
};

function EmptyPressState({ onAction }: { onAction: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/2 py-12 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <Newspaper className="h-5 w-5 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-white">No press items yet</p>
      <p className="mt-1 max-w-xs text-xs text-gray-400">
        Add interviews, features, and podcast appearances
      </p>
      <Button
        onClick={onAction}
        variant="ghost"
        size="sm"
        className="mt-4 text-xs text-gray-400 hover:text-white"
      >
        Add Press
      </Button>
    </div>
  );
}

const PressSection = forwardRef<HTMLElement, Props>(function PressSection(
  { press, isLoading, isOwner, onAddPress },
  ref,
) {
  return (
    <section id="press" ref={ref}>
      <div className="mb-5 flex items-center justify-between">
        <SectionHeading sub="Interviews, features, and podcasts">
          Press &amp; Media
        </SectionHeading>
        {isOwner && press.length > 0 && (
          <Button
            onClick={onAddPress}
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white"
          >
            <Pencil className="mr-1.5 h-3 w-3" />
            Edit
          </Button>
        )}
      </div>
      {isLoading && press.length === 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      ) : press.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {press.map((p: any) => {
            const PressIcon = p.icon;
            const cardContent = (
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/8 bg-white/5">
                  <PressIcon className="h-3.5 w-3.5 text-gray-400 transition-colors group-hover:text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-2">
                    <span className="text-h_redLight text-xs font-bold">
                      {p.outlet}
                    </span>
                    <Badge className="border-white/8 bg-white/5 text-[11px] text-gray-400">
                      {p.type}
                    </Badge>
                  </div>
                  <p className="line-clamp-2 text-sm font-medium text-white">
                    {p.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{p.date}</p>
                </div>
              </div>
            );
            return p.url ? (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Card className="bg-h_blackLight/30 group h-full cursor-pointer gap-0 border-white/8 p-4 transition-colors hover:border-white/15">
                  {cardContent}
                </Card>
              </a>
            ) : (
              <Card
                key={p.id}
                className="bg-h_blackLight/30 group gap-0 border-white/8 p-4"
              >
                {cardContent}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyPressState onAction={onAddPress} />
      )}
    </section>
  );
});

export default PressSection;
