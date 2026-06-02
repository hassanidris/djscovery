import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faMapPin,
  faCalendarCheck,
  faMusic,
} from "@fortawesome/free-solid-svg-icons";
import type { DjType } from "@prisma/client";

// ── Types ──────────────────────────────────────────────────────────────────────

type EventItem = {
  id: number;
  title: string;
  startDate: string;
  venue: string | null;
  city: string | null;
  country: string | null;
};

type Props = {
  djTypes: DjType[];
  events: EventItem[];
};

// ── Constants ──────────────────────────────────────────────────────────────────

const DJ_TYPE_LABELS: Record<DjType, string> = {
  CLUB: "Club",
  WEDDING: "Wedding",
  FESTIVAL: "Festival",
  CORPORATE: "Corporate",
  BAR_LOUNGE: "Bar / Lounge",
};

const DEMO_EVENTS: EventItem[] = [
  {
    id: -1,
    title: "Berlin Underground — Summer Closing",
    startDate: "2025-09-20T22:00:00.000Z",
    venue: "Berghain",
    city: "Berlin",
    country: "Germany",
  },
  {
    id: -2,
    title: "Sunburn Festival — Stage B",
    startDate: "2025-10-15T18:00:00.000Z",
    venue: "Candolim Beach",
    city: "Goa",
    country: "India",
  },
];

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DjProfileSidebar({ djTypes, events }: Props) {
  const isEventsDemo = events.length === 0;
  const displayEvents = isEventsDemo ? DEMO_EVENTS : events.slice(0, 3);

  return (
    <aside className="sticky top-28 flex flex-col gap-4">
      {/* CTA */}
      <Button
        disabled
        className="w-full bg-h_red hover:bg-h_redDark text-white font-semibold disabled:opacity-40"
      >
        <FontAwesomeIcon icon={faCalendarCheck} className="h-3.5 w-3.5 mr-2" />
        Book / Hire DJ
      </Button>

      <Separator className="bg-white/8" />

      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-sm font-semibold">Upcoming Events</h3>
          {isEventsDemo && (
            <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/8">
              Demo
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {displayEvents.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-h_blackLight/30 border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
            >
              <div className="shrink-0 w-10 h-10 rounded-md bg-h_red/10 border border-h_red/20 flex flex-col items-center justify-center text-center">
                <span className="text-h_red text-[9px] font-bold uppercase leading-none">
                  {format(new Date(e.startDate), "MMM")}
                </span>
                <span className="text-white text-sm font-bold leading-none mt-0.5">
                  {format(new Date(e.startDate), "d")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">
                  {e.title}
                </p>
                <p className="text-gray-500 text-[10px] mt-0.5 flex items-center gap-1 truncate">
                  <FontAwesomeIcon
                    icon={faMapPin}
                    className="h-2 w-2 text-h_red shrink-0"
                  />
                  {[e.venue, e.city].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-white/8" />

      {/* Specializes In */}
      {djTypes.length > 0 && (
        <div>
          <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faMusic} className="h-3 w-3 text-h_red" />
            Specializes In
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {djTypes.map((t) => (
              <Badge
                key={t}
                variant="outline"
                className="border-white/15 text-gray-300 text-xs"
              >
                {DJ_TYPE_LABELS[t]}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
