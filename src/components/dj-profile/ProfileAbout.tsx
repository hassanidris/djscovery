"use client";

import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/dj-profile/dj-profile-shared";
import { cn } from "@/lib/utils";

type Props = {
  bio: string;
  djTypes: string[];
  bioExpanded: boolean;
  onToggleBio: () => void;
};

export default function ProfileAbout({
  bio,
  djTypes,
  bioExpanded,
  onToggleBio,
}: Props) {
  return (
    <section>
      <SectionHeading>About Me</SectionHeading>
      <div>
        <p
          className={cn(
            "text-gray-300 text-sm leading-relaxed",
            !bioExpanded && "line-clamp-4",
          )}
        >
          {bio}
        </p>
        <button
          onClick={onToggleBio}
          className="text-h_red text-xs mt-2 hover:text-red-400 transition-colors"
        >
          {bioExpanded ? "Show less" : "Read more"}
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap mt-4">
        <span className="text-xs text-gray-500 shrink-0">Specializes in:</span>
        {djTypes.map((t) => (
          <Badge
            key={t}
            variant="outline"
            className="border-white/15 text-gray-300 text-xs"
          >
            {t}
          </Badge>
        ))}
      </div>
    </section>
  );
}
