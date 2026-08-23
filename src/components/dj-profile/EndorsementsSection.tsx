"use client";

import { forwardRef } from "react";
import { Landmark } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/dj-profile/dj-profile-shared";

type Endorsement = {
  name: string;
  avatar?: string;
  role: string;
  quote: string;
};

type Props = {
  endorsements: Endorsement[];
  isLoading: boolean;
  hasLoaded: boolean;
};

const EndorsementsSection = forwardRef<HTMLElement, Props>(
  function EndorsementsSection({ endorsements, isLoading, hasLoaded }, ref) {
    return (
      <section ref={ref}>
        <SectionHeading sub="What industry professionals say">
          Industry Endorsements
        </SectionHeading>
        {isLoading && !hasLoaded ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-white/5"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {endorsements.map((e: any) => (
              <Card
                key={e.name}
                className="bg-h_blackLight/30 gap-0 border-white/8 p-5"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="size-11 shrink-0 ring-1 ring-white/10">
                    <AvatarImage src={e.avatar} />
                    <AvatarFallback className="bg-h_blackLight text-xs text-white">
                      {e.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {e.name}
                      </span>
                      <Badge className="border-blue-500/20 bg-blue-500/10 text-[11px] text-blue-400">
                        <Landmark className="mr-1 h-2 w-2" />
                        Venue
                      </Badge>
                    </div>
                    <p className="mb-2 text-xs text-gray-400">{e.role}</p>
                    <p className="text-sm leading-relaxed text-gray-300 italic">
                      &ldquo;{e.quote}&rdquo;
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    );
  },
);

export default EndorsementsSection;
