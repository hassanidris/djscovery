import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DemoGig = {
  id: number;
  title: string;
  organizer: string;
  city: string;
  country: string;
  budget: string;
  genres: string[];
  postedAgo: string;
};

const DEMO_GIGS: DemoGig[] = [
  {
    id: 1,
    title: "NYE 2026 Headline DJ",
    organizer: "Club Vapor Berlin",
    city: "Berlin",
    country: "Germany",
    budget: "€2,500",
    genres: ["Techno", "House"],
    postedAgo: "2h ago",
  },
  {
    id: 2,
    title: "Summer Gala Wedding DJ",
    organizer: "The Grand Events Co.",
    city: "London",
    country: "UK",
    budget: "£800",
    genres: ["R&B", "Afrobeats"],
    postedAgo: "5h ago",
  },
  {
    id: 3,
    title: "Rooftop Sessions Weekly Resident",
    organizer: "Sky Lounge Ibiza",
    city: "Ibiza",
    country: "Spain",
    budget: "€500 / set",
    genres: ["Deep House", "Chill"],
    postedAgo: "1d ago",
  },
];

export default function HomeOpenGigsSection() {
  return (
    <section className="border-t border-white/5 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
              Open Gigs
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-400">
              Organizers looking to hire right now
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-h_red hover:text-h_red hover:bg-white/5"
          >
            <Link href="/community">View all →</Link>
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {DEMO_GIGS.map((gig) => (
            <Card
              key={gig.id}
              className="bg-h_blackLight/50 gap-0 p-4 ring-white/5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="bg-h_redDark/40 border-h_red/30 min-w-22.5 shrink-0 rounded-lg border px-4 py-3 text-center">
                  <p className="text-base font-bold text-red-300">
                    {gig.budget}
                  </p>
                  <p className="text-xs text-gray-500">budget</p>
                </div>

                <div className="flex flex-1 flex-col gap-1.5">
                  <p className="font-semibold text-white">{gig.title}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span>🏢 {gig.organizer}</span>
                    <span>
                      📍 {gig.city}, {gig.country}
                    </span>
                    <span>🕐 {gig.postedAgo}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {gig.genres.map((g) => (
                      <Badge
                        key={g}
                        className="bg-h_redDark/60 border-0 text-red-300"
                      >
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* This will be done with the functionalite of the gig */}
                <Button
                  size="sm"
                  className="bg-h_red hover:bg-h_redDark shrink-0 cursor-pointer text-white"
                >
                  Apply
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
