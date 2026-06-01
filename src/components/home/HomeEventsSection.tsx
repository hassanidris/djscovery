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
    <section className="py-12 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 border-t border-white/5">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-white text-3xl md:text-4xl">Upcoming Events</h2>
          <p className="text-gray-400 text-sm mt-1">
            Don&apos;t miss what&apos;s happening near you
          </p>
        </div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-h_purple hover:text-h_purple hover:bg-white/5"
        >
          <Link href="/directory">View all →</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_EVENTS.map((event) => (
          <Card
            key={event.id}
            className="group bg-h_blackLight/50 ring-1 ring-white/5 hover:ring-h_purple/50 transition-all duration-200 overflow-hidden p-0 gap-0 cursor-pointer"
          >
            {/* Header */}
            <div className="relative bg-h_purpleDark/20 h-28 flex items-end p-4 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-h_purpleDark/40 to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-h_purple/50 to-transparent" />
              <h3 className="relative text-white text-2xl tracking-widest leading-none">
                {event.title}
              </h3>
            </div>

            <div className="p-4 flex flex-col gap-2">
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
              <Badge className="bg-h_purpleDark/60 text-h_purple border-0 w-fit mt-1">
                🎧 {event.dj}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
