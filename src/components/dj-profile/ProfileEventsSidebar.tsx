import { CalendarDays, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isValid, parseISO } from "date-fns";
import type { EventItem } from "@/components/dj-profile/dj-profile-shared";

type Props = {
  events: EventItem[];
  showStatus?: boolean;
  isOwner?: boolean;
};

export default function ProfileEventsSidebar({
  events,
  showStatus = false,
  isOwner = false,
}: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white text-sm font-semibold">Upcoming Events</h3>
        {isOwner && (
          <Button
            size="sm"
            variant="outline"
            disabled
            className="h-6 px-2 text-[10px] border-white/15 text-gray-400 hover:bg-white/5 gap-1 opacity-60 cursor-not-allowed"
            title="Event management coming soon"
          >
            <Plus className="h-2.5 w-2.5" />
            Add Event
          </Button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 px-3 rounded-lg border border-dashed border-white/8 text-center">
          <div className="size-8 rounded-full bg-white/5 flex items-center justify-center mb-2">
            <CalendarDays className="h-4 w-4 text-gray-600" />
          </div>
          <p className="text-gray-500 text-xs font-medium">
            No upcoming events
          </p>
          {isOwner && (
            <p className="text-gray-600 text-[10px] mt-0.5">
              Event management coming soon
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {events.map((e) => {
            const parsedDate = parseISO(e.date);
            const month = isValid(parsedDate) ? format(parsedDate, "MMM") : "—";
            const day = isValid(parsedDate) ? format(parsedDate, "d") : "—";
            return (
              <div
                key={e.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-h_blackLight/30 border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
              >
                <div className="shrink-0 w-10 h-10 rounded-md bg-h_red/10 border border-h_red/20 flex flex-col items-center justify-center">
                  <span className="text-h_red text-[9px] font-bold uppercase leading-none">
                    {month}
                  </span>
                  <span className="text-white text-sm font-bold leading-none mt-0.5">
                    {day}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">
                    {e.title}
                  </p>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
