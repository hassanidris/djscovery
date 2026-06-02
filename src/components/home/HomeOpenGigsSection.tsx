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
    <section className="py-12 px-4 md:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-white text-3xl md:text-4xl">Open Gigs</h2>
            <p className="text-gray-400 text-sm mt-1">
              Organisers looking to hire right now
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-h_cyan hover:text-h_cyan hover:bg-white/5"
          >
            <Link href="/community">View all →</Link>
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {DEMO_GIGS.map((gig) => (
            <Card
              key={gig.id}
              className="bg-h_blackLight/50 ring-white/5 p-4 gap-0"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="shrink-0 bg-h_cyanDark/40 border border-h_cyan/30 rounded-lg px-4 py-3 text-center min-w-22.5">
                  <p className="text-h_cyan font-bold text-base">
                    {gig.budget}
                  </p>
                  <p className="text-gray-500 text-xs">budget</p>
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <p className="text-white font-semibold">{gig.title}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span>🏢 {gig.organizer}</span>
                    <span>
                      📍 {gig.city}, {gig.country}
                    </span>
                    <span>🕐 {gig.postedAgo}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {gig.genres.map((g) => (
                      <Badge
                        key={g}
                        className="bg-h_cyanDark/60 text-h_cyan border-0"
                      >
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* This will be done with the functionalite of the gig */}
                {/* <Button
                size="sm"
                className="shrink-0 bg-h_cyan hover:bg-h_cyanDark text-black"
              >
                Apply
              </Button> */}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
