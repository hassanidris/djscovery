import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { PREMIUM_DEMO_DJS } from "@/data/djs";
import { formatNumber } from "@/lib/utils/currency";

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
    <section className="border-t border-white/5 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
              Featured DJs
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-400">
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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {FEATURED_DJS.map((dj) => (
            <Link key={dj.slug} href={`/djs/${dj.slug}`} className="h-full">
              <Card className="bg-h_blackLight/50 hover:ring-h_red flex h-full flex-col gap-0 overflow-hidden p-0 ring-white/5 transition-all">
                <div className="from-h_cyanDark relative h-24 bg-linear-to-r to-black">
                  <div className="absolute -bottom-8 left-4">
                    <div className="relative">
                      <Avatar className="size-16 ring-2 ring-amber-400 ring-offset-2 ring-offset-black">
                        <AvatarImage src={dj.avatar} alt={dj.stageName} />
                        <AvatarFallback className="bg-h_redDark text-lg text-white">
                          {dj.stageName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border-2 border-black bg-amber-400">
                        <FontAwesomeIcon
                          icon={faCrown}
                          className="h-2.5 w-2.5 text-black"
                        />
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-h_red absolute top-3 right-3 border-0 text-white">
                    ✦ FEATURED
                  </Badge>
                </div>

                <div className="flex flex-1 flex-col gap-3 px-4 pt-10 pb-4">
                  <div>
                    <p className="text-lg leading-tight font-bold text-white">
                      Dj. {dj.stageName}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      📍 {dj.city}, {dj.country}
                    </p>
                  </div>

                  <p className="line-clamp-2 text-xs leading-relaxed text-gray-400">
                    {dj.bio}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {dj.genres.map((g) => (
                      <Badge
                        key={g}
                        className="bg-h_redDark/60 border-0 text-red-300"
                      >
                        {g}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3 text-xs text-gray-400">
                    <span>⭐ {dj.rating} rating</span>
                    <span>{formatNumber(dj.followers)} followers</span>
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
