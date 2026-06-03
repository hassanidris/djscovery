import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Hash, TrendingUp } from "lucide-react";

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

const trendingDJs = [
  {
    id: 1,
    name: "Amara Pulse",
    genre: "Techno",
    followers: "12.4k",
    img: "",
    rank: 1,
  },
  {
    id: 2,
    name: "DJ Nexus",
    genre: "House",
    followers: "9.8k",
    img: "",
    rank: 2,
  },
  {
    id: 3,
    name: "Blaze Kova",
    genre: "Minimal",
    followers: "7.2k",
    img: "",
    rank: 3,
  },
  {
    id: 4,
    name: "Luna Haze",
    genre: "Deep House",
    followers: "5.6k",
    img: "",
    rank: 4,
  },
  {
    id: 5,
    name: "Echosphere",
    genre: "Ambient",
    followers: "4.1k",
    img: "",
    rank: 5,
  },
];

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

const hotTags = [
  "#techno",
  "#house",
  "#berlin",
  "#minimal",
  "#trance",
  "#bassline",
  "#ibiza",
  "#deephouse",
];

const CommunityRightPanel = () => {
  return (
    <div className="flex flex-col gap-5">
      {/* ── Widget 1: Trending DJs ── */}
      {/*
        WHY rank numbers: numbered rankings (1–5) create a sense of
        competition and make the list scannable. The red color on #1
        pulls the eye and rewards the top DJ visually.
      */}
      <Card className="bg-h_blackLight/50 border-gray-800 ring-0 shadow-md py-0 gap-0">
        <CardHeader className="px-4 pt-4 pb-3 border-b border-gray-800">
          <CardTitle className="flex items-center gap-2 text-h_white text-sm font-semibold">
            <TrendingUp className="w-4 h-4 text-h_red" />
            Trending DJs
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 py-3 flex flex-col gap-0">
          {trendingDJs.map((dj, index) => (
            <div key={dj.id}>
              <div className="flex items-center gap-3 py-2.5">
                {/* Rank number */}
                <span
                  className={`text-xs font-bold w-4 text-right shrink-0 ${
                    index === 0 ? "text-h_red" : "text-gray-500"
                  }`}
                >
                  {dj.rank}
                </span>

                {/* Avatar */}
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={dj.img} alt={dj.name} />
                  <AvatarFallback className="bg-gray-700 text-gray-300 text-xs font-semibold">
                    {dj.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Name + followers */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-h_white font-medium truncate">
                    {dj.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {dj.followers} followers
                  </p>
                </div>

                {/* Genre badge */}
                <Badge className="bg-gray-800 text-gray-400 border border-gray-700 text-[10px] px-1.5 py-0 shrink-0">
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
      <Card className="bg-h_blackLight/50 border-gray-800 ring-0 shadow-md py-0 gap-0">
        <CardHeader className="px-4 pt-4 pb-3 border-b border-gray-800">
          <CardTitle className="flex items-center gap-2 text-h_white text-sm font-semibold">
            <CalendarDays className="w-4 h-4 text-h_red" />
            Upcoming Events
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 py-3 flex flex-col gap-0">
          {upcomingEvents.map((event, index) => (
            <div key={event.id}>
              <div className="flex items-start gap-3 py-2.5">
                {/* Date pill */}
                <div className="shrink-0 flex flex-col items-center bg-h_red/10 border border-h_red/20 rounded-lg px-2 py-1 min-w-11">
                  <span className="text-[10px] text-h_red font-bold uppercase leading-none">
                    {event.date.split(" ")[0]}
                  </span>
                  <span className="text-sm text-h_white font-bold leading-snug">
                    {event.date.split(" ")[1]}
                  </span>
                </div>

                {/* Event details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-h_white font-medium truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {event.venue}
                  </p>
                  <Badge className="bg-gray-800 text-gray-400 border border-gray-700 text-[10px] px-1.5 py-0 mt-1">
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
            className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500 hover:text-h_red transition-colors py-1"
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
      <Card className="bg-h_blackLight/50 border-gray-800 ring-0 shadow-md py-0 gap-0">
        <CardHeader className="px-4 pt-4 pb-3 border-b border-gray-800">
          <CardTitle className="flex items-center gap-2 text-h_white text-sm font-semibold">
            <Hash className="w-4 h-4 text-h_red" />
            Hot Tags
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {hotTags.map((tag) => (
              <Badge
                key={tag}
                className="bg-gray-800/80 text-gray-300 border border-gray-700 hover:bg-h_red/10 hover:text-h_red hover:border-h_red/30 cursor-pointer transition-all text-xs px-2.5 py-1"
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
