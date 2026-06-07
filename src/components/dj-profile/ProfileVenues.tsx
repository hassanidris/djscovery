import { Badge } from "@/components/ui/badge";
import { MapPinned } from "lucide-react";
import { SectionHeading } from "@/components/dj-profile/dj-profile-shared";
import type { VenueItem } from "@/components/dj-profile/dj-profile-shared";

type Props = {
  venues: VenueItem[];
  grid?: boolean;
};

export default function ProfileVenues({ venues, grid = false }: Props) {
  return (
    <section>
      <SectionHeading>Where I&apos;ve Played</SectionHeading>
      <div className={grid ? "grid sm:grid-cols-2 gap-2" : "flex flex-col gap-2"}>
        {venues.map((v, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg bg-h_blackLight/30 border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="size-9 rounded-md bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
              <MapPinned className="h-3.5 w-3.5 text-h_red" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">{v.name}</p>
              <p className="text-gray-500 text-xs">
                {v.city}
                {v.country ? `, ${v.country}` : ""}
              </p>
            </div>
            <Badge className="bg-white/5 text-gray-400 border-white/10 text-xs shrink-0">
              {v.count}x
            </Badge>
          </div>
        ))}
      </div>
    </section>
  );
}
