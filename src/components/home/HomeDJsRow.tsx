import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export type DemoDJ = {
  id: number | string;
  stageName: string;
  avatar: string;
  genres: string[];
  city: string;
  country: string;
  rating: number;
  followers: number;
  slug?: string;
  isPremium?: boolean;
};

type Props = {
  title: string;
  subtitle?: string;
  djs: DemoDJ[];
  variant?: "new" | "trending";
};

export default function HomeDJsRow({
  title,
  subtitle,
  djs,
  variant = "new",
}: Props) {
  return (
    <section className="py-12 px-4 md:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-white text-3xl md:text-4xl">{title}</h2>
            {subtitle && (
              <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
            )}
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
          <div className="flex gap-4 pb-4 px-1 pt-1 items-stretch">
            {djs.map((dj, index) => (
              <Link
                key={dj.id}
                href={dj.slug ? `/djs/${dj.slug}` : "/directory"}
                className="block h-full"
              >
                <Card className="relative shrink-0 w-56 min-h-64 flex flex-col bg-h_blackLight/50 ring-white/5 hover:ring-h_red gap-3 p-4 cursor-pointer transition-all overflow-visible">
                  {variant === "trending" ? (
                    <Badge className="absolute top-2 left-2 bg-h_redDark/50 text-h_red border-0">
                      #{index + 1}
                    </Badge>
                  ) : (
                    <Badge className="absolute top-2 right-2 bg-h_red text-white border-0">
                      NEW
                    </Badge>
                  )}

                  <div className="flex flex-col items-center gap-2 text-center pt-2">
                    <Avatar className="size-20 ring-2 ring-h_red ring-offset-2 ring-offset-black">
                      <AvatarImage src={dj.avatar} alt={dj.stageName} />
                      <AvatarFallback className="bg-h_redDark text-white text-lg">
                        {dj.stageName[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-semibold text-sm leading-tight truncate w-40 mx-auto">
                        {dj.stageName}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        📍 {dj.city}, {dj.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1 justify-center">
                    {dj.genres.slice(0, 2).map((g) => (
                      <Badge
                        key={g}
                        className="bg-h_redDark/60 text-red-100 border-0 whitespace-nowrap"
                      >
                        {g.length > 11 ? `${g.slice(0, 10)}…` : g}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 mt-auto border-t border-white/5 pt-2">
                    <span>⭐ {dj.rating}</span>
                    <span>{dj.followers.toLocaleString()} fans</span>
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
