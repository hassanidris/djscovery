import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, MapPin, Star } from "lucide-react";
import { GenreBadge } from "@/components/forms/GenreBadge";
import { getFeaturedDJs } from "@/lib/actions/djs";
import { formatNumber } from "@/lib/utils/currency";

export default async function HomeFeaturedDJs() {
  const featuredDJs = await getFeaturedDJs();

  if (featuredDJs.length === 0) {
    return null;
  }

  return (
    <section
      className="border-t border-white/5 px-4 py-12 md:px-8"
      style={{ padding: "var(--space-12) var(--space-4)" }}
    >
      <div className="mx-auto max-w-7xl">
        <div
          className="mb-6 flex items-end justify-between"
          style={{ marginBottom: "var(--space-6)" }}
        >
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
              Featured DJs
            </h2>
            <p
              className="mt-1 text-sm leading-relaxed text-gray-400"
              style={{ marginTop: "var(--space-1)" }}
            >
              Curated talent you should know
              <span className="text-gray-400">
                {" "}
                · Admin-picked + high reputation
              </span>
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-h_redLight hover:text-h_redLight hover:bg-white/5"
          >
            <Link href="/directory">View all →</Link>
          </Button>
        </div>

        <div
          className="grid grid-cols-1 gap-5 md:grid-cols-3"
          style={{ gap: "var(--space-5)" }}
        >
          {featuredDJs.map((dj) => (
            <Link key={dj.id} href={`/djs/${dj.slug}`} className="h-full">
              <Card className="bg-h_blackLight/50 hover:ring-h_red flex h-full flex-col gap-0 overflow-hidden p-0 ring-white/5 transition-all">
                <div className="from-h_cyanDark relative h-24 bg-linear-to-r to-black">
                  <div
                    className="absolute -bottom-8 left-4"
                    style={{ left: "var(--space-4)" }}
                  >
                    <div className="relative">
                      <Avatar className="size-16 ring-2 ring-amber-400 ring-offset-2 ring-offset-black">
                        <AvatarImage
                          src={dj.avatar ?? undefined}
                          alt={dj.stageName}
                        />
                        <AvatarFallback className="bg-h_redDark text-lg text-white">
                          {dj.stageName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border-2 border-black bg-amber-400">
                        <Crown className="h-2.5 w-2.5 text-black" />
                      </div>
                    </div>
                  </div>
                  <Badge
                    className="bg-h_red absolute top-3 right-3 border-0 text-white"
                    style={{ top: "var(--space-3)", right: "var(--space-3)" }}
                  >
                    ✦ FEATURED
                  </Badge>
                </div>

                <div
                  className="flex flex-1 flex-col gap-3 px-4 pt-10 pb-4"
                  style={{
                    gap: "var(--space-3)",
                    padding:
                      "var(--space-4) var(--space-4) var(--space-4) var(--space-4)",
                    paddingTop: "2.5rem",
                  }}
                >
                  <div>
                    <p className="text-lg leading-tight font-bold text-white">
                      Dj. {dj.stageName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="text-h_redLight h-3 w-3" />
                      {dj.city?.name}, {dj.country?.name}
                    </p>
                  </div>

                  <p className="line-clamp-2 text-xs leading-relaxed text-gray-400">
                    {dj.bio}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {dj.genres.map((g) => (
                      <GenreBadge key={g.genre.name} variant="red">
                        {g.genre.name}
                      </GenreBadge>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {dj._avg?.rating?.toFixed(1) || "N/A"} rating
                    </span>
                    <span>{formatNumber(dj._count.followers)} followers</span>
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
