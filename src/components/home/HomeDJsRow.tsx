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
    <section className="border-t border-white/5 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
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
          <div className="flex items-stretch gap-4 px-1 pt-1 pb-4">
            {djs.map((dj, index) => (
              <Link
                key={dj.id}
                href={dj.slug ? `/djs/${dj.slug}` : "/directory"}
                className="block h-full"
              >
                <Card className="bg-h_blackLight/50 hover:ring-h_red relative flex min-h-64 w-56 shrink-0 cursor-pointer flex-col gap-3 overflow-visible p-4 ring-white/5 transition-all">
                  {variant === "trending" ? (
                    <Badge className="bg-h_redDark/50 text-h_red absolute top-2 left-2 border-0">
                      #{index + 1}
                    </Badge>
                  ) : (
                    <Badge className="bg-h_red absolute top-2 right-2 border-0 text-white">
                      NEW
                    </Badge>
                  )}

                  <div className="flex flex-col items-center gap-2 pt-2 text-center">
                    <Avatar className="ring-h_red size-20 ring-2 ring-offset-2 ring-offset-black">
                      <AvatarImage src={dj.avatar} alt={dj.stageName} />
                      <AvatarFallback className="bg-h_redDark text-lg text-white">
                        {dj.stageName[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="mx-auto w-40 truncate text-sm leading-tight font-semibold text-white">
                        {dj.stageName}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        📍 {dj.city}, {dj.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-1">
                    {dj.genres.slice(0, 2).map((g) => (
                      <Badge
                        key={g}
                        className="bg-h_redDark/60 border-0 whitespace-nowrap text-red-100"
                      >
                        {g.length > 11 ? `${g.slice(0, 10)}…` : g}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-2 text-xs text-gray-400">
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
