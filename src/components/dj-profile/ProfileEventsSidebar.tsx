import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isValid, parseISO } from "date-fns";
import type { EventItem } from "@/components/dj-profile/dj-profile-shared";

type Props = {
  events: EventItem[];
  showStatus?: boolean;
  isOwner?: boolean;
  djName?: string;
};

function EventRow({ e, showStatus }: { e: EventItem; showStatus: boolean }) {
  const parsedDate = parseISO(e.date);
  const month = isValid(parsedDate) ? format(parsedDate, "MMM") : "—";
  const day = isValid(parsedDate) ? format(parsedDate, "d") : "—";

  const inner = (
    <>
      <div className="bg-h_red/10 border-h_red/20 flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md border">
        <span className="text-h_redLight text-[10px] leading-none font-bold uppercase">
          {month}
        </span>
        <span className="mt-0.5 text-sm leading-none font-bold text-white">
          {day}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-white">{e.title}</p>
        <p className="mt-0.5 truncate text-[11px] text-gray-400">
          {[e.venue, e.city].filter(Boolean).join(" · ")}
        </p>
      </div>
      {showStatus && e.status === "tentative" && (
        <Badge className="shrink-0 border-amber-500/20 bg-amber-500/10 text-[11px] text-amber-400">
          TBC
        </Badge>
      )}
    </>
  );

  const baseClass =
    "bg-h_blackLight/30 flex items-center gap-3 rounded-lg border border-white/5 p-2.5 transition-colors hover:border-white/10";

  if (e.slug) {
    return (
      <Link key={e.id} href={`/events/${e.slug}`} className={baseClass}>
        {inner}
      </Link>
    );
  }

  return (
    <div key={e.id} className={baseClass}>
      {inner}
    </div>
  );
}

export default function ProfileEventsSidebar({
  events,
  showStatus = false,
  isOwner = false,
  djName,
}: Props) {
  const upcoming = events.filter((e) => !e.isPast);
  const nextUp = upcoming.slice(0, 3);
  const hasMore = upcoming.length > 3;

  return (
    <div className="space-y-5">
      {/* Next Up - top 3 upcoming events teaser */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Next Up</h3>
          {isOwner && (
            <Button
              size="sm"
              variant="outline"
              asChild
              className="h-6 gap-1 border-white/15 px-2 text-[11px] text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <Link href="/dj/events/new">
                <Plus className="h-2.5 w-2.5" />
                Add Event
              </Link>
            </Button>
          )}
        </div>

        {nextUp.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/8 px-3 py-6 text-center">
            <div className="mb-2 flex size-8 items-center justify-center rounded-full bg-white/5">
              <CalendarDays className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-xs font-medium text-gray-400">
              {djName
                ? `No upcoming events for Dj. ${djName}`
                : "No upcoming events yet"}
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {nextUp.map((e) => (
                <EventRow key={e.id} e={e} showStatus={showStatus} />
              ))}
            </div>
            {hasMore && (
              <Link
                href="#events"
                className="mt-2 block text-center text-xs text-gray-400 transition-colors hover:text-white"
              >
                View all {upcoming.length} upcoming events →
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
