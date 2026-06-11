import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DemoEvent = {
  id: number;
  title: string;
  venue: string;
  city: string;
  country: string;
  date: string;
  dj: string;
};

const DEMO_EVENTS: DemoEvent[] = [
  {
    id: 1,
    title: "NEON NIGHTS",
    venue: "Berghain",
    city: "Berlin",
    country: "Germany",
    date: "2025-07-15",
    dj: "DJ Echo",
  },
  {
    id: 2,
    title: "DEEP PULSE",
    venue: "Fabric",
    city: "London",
    country: "UK",
    date: "2025-07-22",
    dj: "NightOwl",
  },
  {
    id: 3,
    title: "SUNSET SESSIONS",
    venue: "Pacha",
    city: "Ibiza",
    country: "Spain",
    date: "2025-08-01",
    dj: "Peggy Gou",
  },
  {
    id: 4,
    title: "AFRO FUSION NIGHT",
    venue: "Alliance Française",
    city: "Lagos",
    country: "Nigeria",
    date: "2025-08-08",
    dj: "Amara Pulse",
  },
  {
    id: 5,
    title: "TECHNO UNDERGROUND",
    venue: "Club Rex",
    city: "Paris",
    country: "France",
    date: "2025-08-14",
    dj: "DJ Storm",
  },
  {
    id: 6,
    title: "GROOVE GARDEN",
    venue: "Berns",
    city: "Stockholm",
    country: "Sweden",
    date: "2025-08-20",
    dj: "DJ Nova",
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HomeEventsSection() {
  return (
    <section className="border-t border-white/5 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
              Upcoming Events
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-400">
              Don&apos;t miss what&apos;s happening near you
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-h_red hover:text-h_red hover:bg-white/5"
          >
            <Link href="/directory">View all →</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_EVENTS.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              +{" "}
              <Card className="bg-h_blackLight/50 hover:ring-h_red cursor-pointer gap-0 overflow-hidden p-0 ring-white/5 transition-all">
                {/* Header */}
                <div className="bg-h_redDark/20 relative flex h-28 items-end overflow-hidden p-4">
                  <div className="from-h_redDark/40 absolute inset-0 bg-linear-to-br to-transparent" />
                  <div className="via-h_red/50 absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent to-transparent" />
                  <h3 className="relative text-xl leading-none font-bold tracking-wider text-white">
                    {event.title}
                  </h3>
                </div>

                <div className="flex flex-col gap-2 p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span>📅</span>
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span>📍</span>
                    <span className="truncate">
                      {event.venue} · {event.city}, {event.country}
                    </span>
                  </div>
                  <Badge className="bg-h_redDark/60 mt-1 w-fit border-0 text-red-300">
                    🎧 {event.dj}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
