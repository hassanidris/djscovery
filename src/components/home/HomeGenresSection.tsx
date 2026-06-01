import Link from "next/link";
import { Button } from "@/components/ui/button";

const GENRES = [
  { name: "House", emoji: "🏠", gradient: "from-violet-800 to-purple-950" },
  { name: "Techno", emoji: "⚡", gradient: "from-zinc-700 to-zinc-900" },
  { name: "Hip-Hop", emoji: "🎤", gradient: "from-yellow-800 to-amber-950" },
  { name: "Afrobeats", emoji: "🌍", gradient: "from-orange-700 to-orange-950" },
  { name: "Amapiano", emoji: "🎶", gradient: "from-lime-800 to-green-950" },
  { name: "R&B", emoji: "🎸", gradient: "from-pink-800 to-rose-950" },
  { name: "Drum & Bass", emoji: "🥁", gradient: "from-red-800 to-red-950" },
  { name: "Deep House", emoji: "🌊", gradient: "from-sky-800 to-blue-950" },
  { name: "Trance", emoji: "✨", gradient: "from-indigo-700 to-indigo-950" },
  { name: "Reggaeton", emoji: "🔥", gradient: "from-red-700 to-orange-950" },
];

export default function HomeGenresSection() {
  return (
    <section className="py-12 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 border-t border-white/5">
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
          className="text-h_purple hover:text-h_purple hover:bg-white/5"
        >
          <Link href="/directory">View all genres →</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {GENRES.map((genre) => (
          <Link
            key={genre.name}
            href={`/directory?genre=${encodeURIComponent(genre.name)}`}
            className={`bg-linear-to-br ${genre.gradient} border border-white/10 rounded-xl px-4 py-5 flex flex-col gap-1 hover:ring-1 hover:ring-h_purple transition-all`}
          >
            <span className="text-2xl">{genre.emoji}</span>
            <span className="text-white font-semibold text-sm">
              {genre.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
