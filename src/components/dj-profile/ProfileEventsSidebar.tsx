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
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Upcoming Events</h3>
        {isOwner && (
          <Button
            size="sm"
            variant="outline"
            disabled
            className="h-6 cursor-not-allowed gap-1 border-white/15 px-2 text-[11px] text-gray-400 opacity-60 hover:bg-white/5"
            title="Event management coming soon"
          >
            <Plus className="h-2.5 w-2.5" />
            Add Event
          </Button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/8 px-3 py-6 text-center">
          <div className="mb-2 flex size-8 items-center justify-center rounded-full bg-white/5">
            <CalendarDays className="h-4 w-4 text-gray-600" />
          </div>
          <p className="text-xs font-medium text-gray-500">
            No upcoming events
          </p>
          {isOwner && (
            <p className="mt-0.5 text-[11px] text-gray-600">
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
                className="bg-h_blackLight/30 flex cursor-pointer items-center gap-3 rounded-lg border border-white/5 p-2.5 transition-colors hover:border-white/10"
              >
                <div className="bg-h_red/10 border-h_red/20 flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md border">
                  <span className="text-h_red text-[10px] leading-none font-bold uppercase">
                    {month}
                  </span>
                  <span className="mt-0.5 text-sm leading-none font-bold text-white">
                    {day}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-white">
                    {e.title}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-gray-500">
                    {[e.venue, e.city].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {showStatus && e.status === "tentative" && (
                  <Badge className="shrink-0 border-amber-500/20 bg-amber-500/10 text-[11px] text-amber-400">
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
