import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { getTrendingDJs } from "@/lib/actions/djs";
import { formatNumber } from "@/lib/utils/currency";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
              Most viewed profiles this month
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

        <ScrollArea className="w-full">
          <div className="flex items-stretch gap-4 px-1 pt-1 pb-4">
            {trendingDJs.map((dj, index) => (
              <Link
                key={dj.id}
                href={`/djs/${dj.slug}`}
                className="block h-full"
              >
                <Card className="bg-h_blackLight/50 hover:ring-h_red relative flex h-full w-56 shrink-0 cursor-pointer flex-col gap-0 overflow-hidden p-0 ring-white/5 transition-all">
                  <div className="from-h_cyanDark/20 relative bg-linear-to-br to-black p-4">
                    <div className="flex items-start justify-between">
                      <Avatar className="size-12 ring-2 ring-white/10 ring-offset-2 ring-offset-black">
                        <AvatarImage
                          src={dj.avatar ?? undefined}
                          alt={dj.stageName}
                        />
                        <AvatarFallback className="bg-h_redDark text-lg text-white">
                          {dj.stageName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-1 text-xs text-amber-400">
                        <TrendingUp className="h-3 w-3" />
                        <span>#{index + 1}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-2 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-white">
                        Dj. {dj.stageName}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        📍 {dj.city?.name}, {dj.country?.name}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {dj.genres.slice(0, 2).map((g) => (
                        <Badge
                          key={g.genre.name}
                          className="bg-h_redDark/60 border-0 text-xs text-red-300"
                        >
                          {g.genre.name}
                        </Badge>
                      ))}
                      {dj.genres.length > 2 && (
                        <span className="text-muted-foreground text-xs">
                          +{dj.genres.length - 2}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-amber-400" />
                        {formatNumber(dj.monthlyViews)} views
                      </span>
                      <span>{formatNumber(dj._count.followers)} followers</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
}
