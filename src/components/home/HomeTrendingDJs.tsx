import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { getTrendingDJs } from "@/lib/actions/djs";
import { formatNumber } from "@/lib/utils/currency";
import ScrollableCarousel from "@/components/ScrollableCarousel";

export default async function HomeTrendingDJs() {
  const trendingDJs = await getTrendingDJs();

  if (trendingDJs.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-white/5 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
              Trending This Month
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-400">
              Hot DJs everyone&apos;s viewing
              <span className="text-gray-400"> · Sorted by monthly views</span>
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-h_redLight hover:text-h_redLight hover:bg-white/5"
          >
            <Link href="/directory?sort=trending">View all →</Link>
          </Button>
        </div>

        <ScrollableCarousel
          contentClassName="items-stretch px-1 pt-1 pb-4"
          peek={24}
        >
          {trendingDJs.map((dj, index) => (
            <Link key={dj.id} href={`/djs/${dj.slug}`} className="block h-full">
              <Card className="bg-h_blackLight/50 hover:ring-h_red relative flex h-full w-64 shrink-0 cursor-pointer flex-col gap-0 overflow-hidden p-0 ring-white/5 transition-all">
                <div className="from-h_cyanDark/20 relative bg-linear-to-br to-black p-5">
                  <div className="flex items-start justify-between">
                    <Avatar className="size-14 ring-2 ring-white/10 ring-offset-2 ring-offset-black">
                      <AvatarImage
                        src={dj.avatar ?? undefined}
                        alt={dj.stageName}
                      />
                      <AvatarFallback className="bg-h_redDark text-lg text-white">
                        {dj.stageName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1 text-sm text-amber-400">
                      <TrendingUp className="h-4 w-4" />
                      <span>#{index + 1}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 px-5 py-4">
                  <div>
                    <p className="truncate text-base font-bold text-white">
                      Dj. {dj.stageName}
                    </p>
                    <p className="mt-1 truncate text-sm text-gray-400">
                      📍 {dj.city?.name}, {dj.country?.name}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {dj.genres.slice(0, 2).map((g) => (
                      <Badge
                        key={g.genre.name}
                        className="bg-h_redDark/60 border-0 text-sm text-red-300"
                      >
                        {g.genre.name}
                      </Badge>
                    ))}
                    {dj.genres.length > 2 && (
                      <span className="text-muted-foreground text-sm">
                        +{dj.genres.length - 2}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex w-full items-center justify-between border-t border-white/5 pt-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-amber-400" />
                      {formatNumber(dj.monthlyViews)} views
                    </span>
                    <span>{formatNumber(dj._count.followers)} followers</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </ScrollableCarousel>
      </div>
    </section>
  );
}
