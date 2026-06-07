import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { EventItem } from "@/components/dj-profile/dj-profile-shared";

type Props = {
  events: EventItem[];
  showStatus?: boolean;
};

export default function ProfileEventsSidebar({
  events,
  showStatus = false,
}: Props) {
  return (
    <div>
      <h3 className="text-white text-sm font-semibold mb-3">
        Upcoming Events
      </h3>
      <div className="flex flex-col gap-2">
        {events.map((e) => (
          <div
            key={e.id}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-h_blackLight/30 border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
          >
            <div className="shrink-0 w-10 h-10 rounded-md bg-h_red/10 border border-h_red/20 flex flex-col items-center justify-center">
              <span className="text-h_red text-[9px] font-bold uppercase leading-none">
                {format(new Date(e.date), "MMM")}
              </span>
              <span className="text-white text-sm font-bold leading-none mt-0.5">
                {format(new Date(e.date), "d")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{e.title}</p>
              <p className="text-gray-500 text-[10px] mt-0.5 truncate">
                {[e.venue, e.city].filter(Boolean).join(" · ")}
              </p>
            </div>
            {showStatus && e.status === "tentative" && (
              <Badge className="shrink-0 bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                TBC
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
