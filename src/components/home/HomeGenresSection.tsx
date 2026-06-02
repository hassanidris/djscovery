import Link from "next/link";
import { Button } from "@/components/ui/button";

const GENRES = [
  { name: "House", emoji: "🏠" },
  { name: "Techno", emoji: "⚡" },
  { name: "Hip-Hop", emoji: "🎤" },
  { name: "Afrobeats", emoji: "🌍" },
  { name: "Amapiano", emoji: "🎶" },
  { name: "R&B", emoji: "🎸" },
  { name: "Drum & Bass", emoji: "🥁" },
  { name: "Deep House", emoji: "🌊" },
  { name: "Trance", emoji: "✨" },
  { name: "Reggaeton", emoji: "🔥" },
];

export default function HomeGenresSection() {
  return (
    <section className="py-12 px-4 md:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-white text-3xl md:text-4xl">Browse by Genre</h2>
            <p className="text-gray-400 text-sm mt-1">
              Find DJs who play your sound
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-h_red hover:text-h_red hover:bg-white/5"
          >
            <Link href="/directory">View all genres →</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {GENRES.map((genre) => (
            <Link
              key={genre.name}
              href={`/directory?genre=${encodeURIComponent(genre.name)}`}
              className="group relative bg-h_blackLight/40 ring-1 ring-white/8 hover:ring-h_red/60 hover:bg-h_redDark/20 rounded-xl px-4 py-5 flex flex-col gap-2.5 transition-all duration-200 overflow-hidden"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-h_cyan/0 to-transparent group-hover:via-h_cyan/60 transition-all duration-300" />

              <span className="text-3xl leading-none">{genre.emoji}</span>

              <div className="flex flex-col gap-0.5">
                <span className="text-white font-semibold text-sm leading-tight">
                  {genre.name}
                </span>
                <span className="text-h_red text-xs opacity-0 group-hover:opacity-100 translate-x-0 transition-all duration-200">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
