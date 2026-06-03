import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

/*
  WHY: The original Stories component was a generic white card with
  9 identical "Ricky" placeholders. For DJscovery, this should
  reflect active DJs — the platform's core identity.

  COMPONENTS USED:
  - shadcn ScrollArea: handles overflow scroll with a hidden
    styled scrollbar (much cleaner than overflow-x-auto + custom CSS)
  - shadcn Avatar: provides AvatarImage + AvatarFallback so we
    always have a graceful fallback if no DJ photo is set

  RING LOGIC:
  - active: true  → h_red border ring (neon indicator)
  - active: false → gray-700 ring (offline / inactive)
  - The double-ring effect (colored outer + dark inner gap) is
    created by nesting two divs before the Avatar itself.
*/

const activeDJs = [
  { id: 1, name: "Amara Pulse", genre: "Techno", img: "", active: true },
  { id: 2, name: "DJ Nexus", genre: "House", img: "", active: true },
  { id: 3, name: "SolarSpin", genre: "Drum & Bass", img: "", active: false },
  { id: 4, name: "Blaze Kova", genre: "Minimal", img: "", active: true },
  { id: 5, name: "Nova Rift", genre: "Trance", img: "", active: false },
  { id: 6, name: "Echosphere", genre: "Ambient", img: "", active: true },
  { id: 7, name: "Kratos DJ", genre: "Hardstyle", img: "", active: false },
  { id: 8, name: "Luna Haze", genre: "Deep House", img: "", active: true },
];

const Stories = () => {
  return (
    <div className="p-4 bg-h_blackLight/50 shadow-md rounded-lg">
      {/* Section header with live pulse indicator */}
      <div className="flex items-center gap-2 mb-4">
        {/*
          WHY the ping animation: Tailwind's animate-ping creates
          a ripple effect that signals "live" or "real-time" — common
          in platforms like Twitch or Discord for online presence.
        */}
        <div className="relative flex items-center justify-center w-3 h-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-h_red opacity-60 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-h_red" />
        </div>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Active DJs
        </span>
      </div>

      {/* Horizontal scrollable DJ list */}
      <ScrollArea className="w-full">
        <div className="flex gap-5 pb-2">
          {activeDJs.map((dj) => (
            <div
              key={dj.id}
              className="flex flex-col items-center gap-1.5 cursor-pointer min-w-fit group"
            >
              {/*
                Double-ring effect:
                  outer div = coloured ring (red if active, gray if not)
                  inner div = dark gap between ring and avatar
                This is a pure CSS trick — no extra dependencies needed.
              */}
              <div
                className={`p-0.5 rounded-full transition-colors ${
                  dj.active ? "bg-h_red" : "bg-gray-700"
                }`}
              >
                <div className="p-0.5 bg-h_blackLight rounded-full">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={dj.img} alt={dj.name} />
                    <AvatarFallback className="bg-gray-700 text-gray-200 text-sm font-semibold">
                      {dj.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* DJ first name */}
              <span className="text-xs text-gray-200 font-medium truncate max-w-16 text-center group-hover:text-h_white transition-colors">
                {dj.name.split(" ")[0]}
              </span>

              {/* Genre tag */}
              <span className="text-[10px] text-gray-500 truncate max-w-16 text-center">
                {dj.genre}
              </span>
            </div>
          ))}
        </div>

        {/* Horizontal scrollbar — hidden but functional via shadcn ScrollBar */}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default Stories;
