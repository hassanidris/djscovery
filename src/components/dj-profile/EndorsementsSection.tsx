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
          <div className="space-y-4" style={{ gap: "var(--space-4)" }}>
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-white/5"
                style={{ height: "6rem" }}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col gap-4"
            style={{ gap: "var(--space-4)" }}
          >
            {endorsements.map((e: any) => (
              <Card
                key={e.name}
                className="bg-h_blackLight/30 gap-0 border-white/10 p-6 transition-all duration-200 hover:border-white/20"
                style={{ padding: "var(--space-6)", gap: "var(--space-4)" }}
              >
                <div
                  className="flex items-start gap-3"
                  style={{ gap: "var(--space-3)" }}
                >
                  <Avatar className="size-12 shrink-0 ring-2 ring-white/10 ring-offset-2 ring-offset-black">
                    <AvatarImage src={e.avatar} />
                    <AvatarFallback className="bg-h_redDark text-xs text-white">
                      {e.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div
                      className="mb-3 flex items-center gap-2"
                      style={{
                        marginBottom: "var(--space-3)",
                        gap: "var(--space-2)",
                      }}
                    >
                      <span className="text-sm font-semibold text-white">
                        {e.name}
                      </span>
                      <Badge
                        className="border-blue-500/20 bg-blue-500/10 text-[11px] text-blue-400"
                        style={{ padding: "var(--space-1) var(--space-2)" }}
                      >
                        <Landmark className="mr-1 h-2 w-2" />
                        Venue
                      </Badge>
                    </div>
                    <p
                      className="mb-2 text-xs text-gray-400"
                      style={{ marginBottom: "var(--space-2)" }}
                    >
                      {e.role}
                    </p>
                    <p
                      className="text-sm leading-relaxed text-gray-300 italic"
                      style={{ lineHeight: "1.6" }}
                    >
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
