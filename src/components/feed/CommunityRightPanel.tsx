import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Hash, TrendingUp } from "lucide-react";
import { ALL_DEMO_DJS } from "@/data/djs";

/*
  WHY a separate component instead of modifying RightMenu:
  RightMenu is shared across profile pages and the community page.
  Rather than conditionally rendering inside RightMenu, we keep
  concerns separated — CommunityRightPanel is ONLY for /community.
  This makes both components simpler and independently maintainable.

  COMPONENTS USED:
  - shadcn Card + CardHeader + CardTitle + CardContent
    → provides consistent padding, rounded corners, and ring border
      matching the platform's card style (we override bg to dark)
  - shadcn Avatar + AvatarFallback
    → graceful fallback initials when no DJ photo is available
  - shadcn Badge
    → genre labels + hot tag chips — consistent pill sizing
  - shadcn Separator
    → thin divider lines between DJ list items without adding
      margin-heavy padding
*/

const trendingDJs = [...ALL_DEMO_DJS]
  .sort((a, b) => b.stats.followers - a.stats.followers)
  .slice(0, 5)
  .map((dj, i) => ({
    slug: dj.slug,
    name: dj.stageName,
    genre: dj.genres[0] ?? "",
    followers:
      dj.stats.followers >= 1000
        ? `${(dj.stats.followers / 1000).toFixed(1)}k`
        : String(dj.stats.followers),
    img: dj.avatar.url,
    rank: i + 1,
  }));

const upcomingEvents = [
  {
    id: 1,
    title: "Berlin Underground",
    venue: "Berghain, Berlin",
    date: "Jun 14",
    genre: "Techno",
  },
  {
    id: 2,
    title: "House Nation",
    venue: "Fabric, London",
    date: "Jun 21",
    genre: "House",
  },
  {
    id: 3,
    title: "Deep Sessions",
    venue: "DC-10, Ibiza",
    date: "Jul 5",
    genre: "Deep House",
  },
];

const hotTags = [...new Set(ALL_DEMO_DJS.flatMap((dj) => dj.genres))]
  .slice(0, 8)
  .map((g) => `#${g.toLowerCase().replace(/\s+/g, "")}`);

const CommunityRightPanel = () => {
  return (
    <div className="flex flex-col gap-5">
      {/* ── Widget 1: Trending DJs ── */}
      {/*
        WHY rank numbers: numbered rankings (1–5) create a sense of
        competition and make the list scannable. The red color on #1
        pulls the eye and rewards the top DJ visually.
      */}
      <Card className="bg-h_blackLight/50 gap-0 border-gray-800 py-0 shadow-md ring-0">
        <CardHeader className="border-b border-gray-800 px-4 pt-4 pb-3">
          <CardTitle className="text-h_white flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="text-h_red h-4 w-4" />
            Trending DJs
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-0 px-4 py-3">
          {trendingDJs.map((dj, index) => (
            <div key={dj.slug}>
              <div className="flex items-center gap-3 py-2.5">
                {/* Rank number */}
                <span
                  className={`w-4 shrink-0 text-right text-xs font-bold ${
                    index === 0 ? "text-h_red" : "text-gray-500"
                  }`}
                >
                  {dj.rank}
                </span>

                {/* Avatar */}
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={dj.img} alt={dj.name} />
                  <AvatarFallback className="bg-gray-700 text-xs font-semibold text-gray-300">
                    {dj.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Name + followers */}
                <div className="min-w-0 flex-1">
                  <Link href={`/djs/${dj.slug}`} className="hover:underline">
                    <p className="text-h_white truncate text-sm font-medium">
                      Dj. {dj.name}
                    </p>
                  </Link>
                  <p className="text-xs text-gray-500">
                    {dj.followers} followers
                  </p>
                </div>

                {/* Genre badge */}
                <Badge className="shrink-0 border border-gray-700 bg-gray-800 px-1.5 py-0 text-[11px] text-gray-400">
                  {dj.genre}
                </Badge>
              </div>

              {/* Separator between items (not after the last one) */}
              {index < trendingDJs.length - 1 && (
                <Separator className="bg-gray-800/60" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Widget 2: Upcoming Events ── */}
      {/*
        WHY date badge in h_red: the date is the most action-driving
        piece of info in an event listing — it creates urgency.
        Highlighting it in brand red immediately draws the eye there.
      */}
      <Card className="bg-h_blackLight/50 gap-0 border-gray-800 py-0 shadow-md ring-0">
        <CardHeader className="border-b border-gray-800 px-4 pt-4 pb-3">
          <CardTitle className="text-h_white flex items-center gap-2 text-sm font-semibold">
            <CalendarDays className="text-h_red h-4 w-4" />
            Upcoming Events
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-0 px-4 py-3">
          {upcomingEvents.map((event, index) => (
            <div key={event.id}>
              <div className="flex items-start gap-3 py-2.5">
                {/* Date pill */}
                <div className="bg-h_red/10 border-h_red/20 flex min-w-11 shrink-0 flex-col items-center rounded-lg border px-2 py-1">
                  <span className="text-h_red text-[11px] leading-none font-bold uppercase">
                    {event.date.split(" ")[0]}
                  </span>
                  <span className="text-h_white text-sm leading-snug font-bold">
                    {event.date.split(" ")[1]}
                  </span>
                </div>

                {/* Event details */}
                <div className="min-w-0 flex-1">
                  <p className="text-h_white truncate text-sm font-medium">
                    {event.title}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {event.venue}
                  </p>
                  <Badge className="mt-1 border border-gray-700 bg-gray-800 px-1.5 py-0 text-[11px] text-gray-400">
                    {event.genre}
                  </Badge>
                </div>
              </div>

              {index < upcomingEvents.length - 1 && (
                <Separator className="bg-gray-800/60" />
              )}
            </div>
          ))}

          <Link
            href="/events"
            className="hover:text-h_red mt-2 flex items-center justify-center gap-1 py-1 text-xs text-gray-500 transition-colors"
          >
            View all events →
          </Link>
        </CardContent>
      </Card>

      {/* ── Widget 3: Hot Tags ── */}
      {/*
        WHY tags: genre hashtags are the primary discovery mechanism
        for music fans. Clickable tag chips make the platform feel
        like a real music community (think SoundCloud, Bandcamp).
      */}
      <Card className="bg-h_blackLight/50 gap-0 border-gray-800 py-0 shadow-md ring-0">
        <CardHeader className="border-b border-gray-800 px-4 pt-4 pb-3">
          <CardTitle className="text-h_white flex items-center gap-2 text-sm font-semibold">
            <Hash className="text-h_red h-4 w-4" />
            Hot Tags
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {hotTags.map((tag) => (
              <Badge
                key={tag}
                className="hover:bg-h_red/10 hover:text-h_red hover:border-h_red/30 cursor-pointer border border-gray-700 bg-gray-800/80 px-2.5 py-1 text-xs text-gray-300 transition-all"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityRightPanel;
