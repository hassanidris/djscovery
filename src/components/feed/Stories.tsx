import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

/*
  WHY: The original Stories component was a generic white card with
  9 identical "Ricky" placeholders. For DJcovery, this should
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
    <div className="bg-h_blackLight/50 rounded-lg p-4 shadow-md">
      {/* Section header with live pulse indicator */}
      <div className="mb-4 flex items-center gap-2">
        {/*
          WHY the ping animation: Tailwind's animate-ping creates
          a ripple effect that signals "live" or "real-time" — common
          in platforms like Twitch or Discord for online presence.
        */}
        <div className="relative flex h-3 w-3 items-center justify-center">
          <span className="bg-h_red absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
          <span className="bg-h_red relative inline-flex h-2 w-2 rounded-full" />
        </div>
        <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Active DJs
        </span>
      </div>

      {/* Horizontal scrollable DJ list */}
      <ScrollArea className="w-full">
        <div className="flex gap-5 pb-2">
          {activeDJs.map((dj) => (
            <div
              key={dj.id}
              className="group flex min-w-fit cursor-pointer flex-col items-center gap-1.5"
            >
              {/*
                Double-ring effect:
                  outer div = coloured ring (red if active, gray if not)
                  inner div = dark gap between ring and avatar
                This is a pure CSS trick — no extra dependencies needed.
              */}
              <div
                className={`rounded-full p-0.5 transition-colors ${
                  dj.active ? "bg-h_red" : "bg-gray-700"
                }`}
              >
                <div className="bg-h_blackLight rounded-full p-0.5">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={dj.img} alt={dj.name} />
                    <AvatarFallback className="bg-gray-700 text-sm font-semibold text-gray-200">
                      {dj.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* DJ first name */}
              <span className="group-hover:text-h_white max-w-16 truncate text-center text-xs font-medium text-gray-200 transition-colors">
                {dj.name.split(" ")[0]}
              </span>

              {/* Genre tag */}
              <span className="max-w-16 truncate text-center text-[11px] text-gray-400">
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
