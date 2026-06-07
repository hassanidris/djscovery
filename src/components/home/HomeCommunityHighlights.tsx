import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/client";
import { formatDistanceToNow } from "date-fns";

type PostCard = {
  id: number | string;
  dj: string;
  avatar: string;
  content: string;
  likes: number;
  comments: number;
  postedAgo: string;
  city: string;
  country: string;
};

const DEMO_POSTS: PostCard[] = [
  {
    id: "demo-1",
    dj: "DJ Nova",
    avatar: "/rated-1.webp",
    content:
      "Just dropped my new summer mix on SoundCloud — 45 minutes of pure House & Techno. Go check it out and let me know what you think! 🎧🔥",
    likes: 245,
    comments: 38,
    postedAgo: "3h ago",
    city: "Stockholm",
    country: "Sweden",
  },
  {
    id: "demo-2",
    dj: "Marcus Groove",
    avatar: "/rated-5.webp",
    content:
      "Last night at Output Club NYC was absolutely electric. Thank you to everyone who came through and made it unforgettable. More shows coming soon! 🙌",
    likes: 512,
    comments: 67,
    postedAgo: "1d ago",
    city: "New York",
    country: "USA",
  },
  {
    id: "demo-3",
    dj: "Amara Pulse",
    avatar: "/rated-6.webp",
    content:
      "Super excited to announce my first European tour this fall! Berlin, Amsterdam, Paris & London — dates dropping this week. Stay tuned 🌍✈️",
    likes: 890,
    comments: 124,
    postedAgo: "2d ago",
    city: "Lagos",
    country: "Nigeria",
  },
];

export default async function HomeCommunityHighlights() {
  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging";

  let dbPosts: PostCard[] = [];
  try {
    const posts = await prisma.post.findMany({
      where: { deletedAt: null, content: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        user: {
          include: {
            djProfile: { select: { stageName: true } },
            city: { select: { name: true } },
            country: { select: { name: true } },
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    dbPosts = posts.map((p) => ({
      id: p.id,
      dj: p.user.djProfile?.stageName ?? p.user.name ?? p.user.username,
      avatar: p.user.image ?? "/noAvatar.png",
      content: p.content ?? "",
      likes: p._count.likes,
      comments: p._count.comments,
      postedAgo: formatDistanceToNow(p.createdAt, { addSuffix: true }),
      city: p.user.city?.name ?? "",
      country: p.user.country?.name ?? "",
    }));
  } catch {
    // DB unavailable — fall through to demo data
  }

  const dbIds = new Set(dbPosts.map((p) => p.id));
  const posts = isStaging
    ? [...dbPosts, ...DEMO_POSTS.filter((p) => !dbIds.has(p.id))].slice(0, 3)
    : dbPosts.length > 0
      ? dbPosts
      : DEMO_POSTS;

  return (
    <section className="py-12 px-4 md:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-white text-3xl md:text-4xl">
              Community Highlights
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Latest from DJs in the community
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-h_red hover:text-h_red hover:bg-white/5"
          >
            <Link href="/community">View all →</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {posts.map((post) => (
            <Link key={post.id} href="/community" className="h-full">
              <Card className="h-full flex flex-col bg-h_blackLight/50 ring-white/5 hover:ring-h_red transition-all p-4 gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-11 ring-2 ring-h_red shrink-0">
                    <AvatarImage src={post.avatar} alt={post.dj} />
                    <AvatarFallback className="bg-h_redDark text-white">
                      {post.dj[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {post.dj}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {post.city && post.country
                        ? `📍 ${post.city}, ${post.country} · `
                        : ""}
                      {post.postedAgo}
                    </p>
                  </div>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 flex-1">
                  {post.content}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-white/5 pt-3 mt-auto">
                  <span>❤️ {post.likes.toLocaleString()} likes</span>
                  <span>💬 {post.comments} comments</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
