import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { PREMIUM_DEMO_DJS } from "@/data/djs";

const FEATURED_DJS = [...PREMIUM_DEMO_DJS]
  .sort(
    (a, b) =>
      b.stats.rating - a.stats.rating || b.stats.followers - a.stats.followers,
  )
  .slice(0, 3)
  .map((dj) => ({
    slug: dj.slug,
    stageName: dj.stageName,
    avatar: dj.avatar.url,
    bio: dj.bio,
    genres: dj.genres,
    city: dj.location.city,
    country: dj.location.country,
    rating: dj.stats.rating,
    followers: dj.stats.followers,
  }));

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
            <Link key={dj.slug} href={`/djs/${dj.slug}`}>
              <Card className="bg-h_blackLight/50 ring-white/5 hover:ring-h_red transition-all overflow-hidden p-0 gap-0">
                <div className="relative h-24 bg-linear-to-r from-h_cyanDark to-black">
                  <div className="absolute -bottom-8 left-4">
                    <div className="relative">
                      <Avatar className="size-16 ring-2 ring-amber-400 ring-offset-2 ring-offset-black">
                        <AvatarImage src={dj.avatar} alt={dj.stageName} />
                        <AvatarFallback className="bg-h_redDark text-white text-lg">
                          {dj.stageName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-amber-400 border-2 border-black flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faCrown}
                          className="h-2.5 w-2.5 text-black"
                        />
                      </div>
                    </div>
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
                        className="bg-h_redDark/60 text-red-300 border-0"
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
