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
    <section className="border-t border-white/5 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
              Browse by Genre
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-400">
              Find DJs who play your sound
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-h_red/80 hover:text-h_red/80 hover:bg-white/5"
          >
            <Link href="/directory">View all genres →</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {GENRES.map((genre) => (
            <Link
              key={genre.name}
              href={`/directory?genre=${encodeURIComponent(genre.name)}`}
              className="group bg-h_blackLight/40 hover:ring-h_red/60 hover:bg-h_redDark/20 relative flex flex-col gap-2.5 overflow-hidden rounded-xl px-4 py-5 ring-1 ring-white/8 transition-all duration-200"
            >
              {/* Top accent bar */}
              <div className="via-h_cyan/0 group-hover:via-h_cyan/60 absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent to-transparent transition-all duration-300" />

              <span className="text-3xl leading-none">{genre.emoji}</span>

              <div className="flex flex-col gap-0.5">
                <span className="text-sm leading-tight font-semibold text-white">
                  {genre.name}
                </span>
                <span className="text-h_red/80 translate-x-0 text-xs opacity-0 transition-all duration-200 group-hover:opacity-100">
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
