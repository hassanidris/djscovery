import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type FeaturedDJ = {
  id: number;
  stageName: string;
  avatar: string;
  bio: string;
  genres: string[];
  city: string;
  country: string;
  rating: number;
  followers: number;
};

const FEATURED_DJS: FeaturedDJ[] = [
  {
    id: 1,
    stageName: "Peggy Gou",
    avatar: "/rated-9.webp",
    bio: "Seoul-born Berlin-based DJ and producer. Known for her infectious house and techno sets that blend Eastern and Western influences.",
    genres: ["House", "Techno"],
    city: "Berlin",
    country: "Germany",
    rating: 4.9,
    followers: 87000,
  },
  {
    id: 2,
    stageName: "Marcus Groove",
    avatar: "/rated-5.webp",
    bio: "NYC's finest in hip-hop and R&B. Marcus has headlined clubs across North America and Europe bringing raw energy to every set.",
    genres: ["Hip-Hop", "R&B"],
    city: "New York",
    country: "USA",
    rating: 4.7,
    followers: 42000,
  },
  {
    id: 3,
    stageName: "Amara Pulse",
    avatar: "/rated-6.webp",
    bio: "Bringing the pulse of Lagos to the world stage. Amara blends Afrobeats and Amapiano into euphoric, floor-filling sets that transcend borders.",
    genres: ["Afrobeats", "Amapiano"],
    city: "Lagos",
    country: "Nigeria",
    rating: 4.8,
    followers: 63000,
  },
];

export default function HomeFeaturedDJs() {
  return (
    <section className="py-12 px-4 md:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-white text-3xl md:text-4xl">Featured DJs</h2>
            <p className="text-gray-400 text-sm mt-1">
              Handpicked talent making waves globally
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURED_DJS.map((dj) => (
            <Link key={dj.id} href="/directory">
              <Card className="bg-h_blackLight/50 ring-white/5 hover:ring-h_red transition-all overflow-hidden p-0 gap-0">
                <div className="relative h-24 bg-linear-to-r from-h_redDark to-black">
                  <div className="absolute -bottom-8 left-4">
                    <Avatar className="size-16 ring-2 ring-h_red ring-offset-2 ring-offset-black">
                      <AvatarImage src={dj.avatar} alt={dj.stageName} />
                      <AvatarFallback className="bg-h_redDark text-white text-lg">
                        {dj.stageName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <Badge className="absolute top-3 right-3 bg-h_red text-white border-0">
                    ✦ FEATURED
                  </Badge>
                </div>

                <div className="pt-10 px-4 pb-4 flex flex-col gap-3">
                  <div>
                    <p className="text-white font-bold text-lg leading-tight">
                      {dj.stageName}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      📍 {dj.city}, {dj.country}
                    </p>
                  </div>

                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                    {dj.bio}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {dj.genres.map((g) => (
                      <Badge
                        key={g}
                        className="bg-h_redDark/60 text-h_red border-0"
                      >
                        {g}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 border-t border-white/5 pt-3 mt-auto">
                    <span>⭐ {dj.rating} rating</span>
                    <span>{dj.followers.toLocaleString()} followers</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
