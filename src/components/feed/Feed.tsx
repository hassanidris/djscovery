import Post from "./Post";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { demoPosts } from "@/lib/data";

const postInclude = {
  user: true,
  likes: { select: { userId: true } },
  media: true,
  _count: { select: { comments: true } },
} as const;

const Feed = async ({ username }: { username?: string }) => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const userId = authUser?.id;

  let posts: any[] = [];

  try {
    if (username) {
      posts = await prisma.post.findMany({
        where: { user: { username }, deletedAt: null },
        include: postInclude,
        orderBy: { createdAt: "desc" },
      });
    } else if (userId) {
      const following = await prisma.follower.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      const ids = [userId, ...following.map((f) => f.followingId)];
      posts = await prisma.post.findMany({
        where: { userId: { in: ids }, deletedAt: null },
        include: postInclude,
        orderBy: { createdAt: "desc" },
      });
    }
  } catch {
    // DB unavailable — fall through to demo posts below
  }

  const displayPosts = posts.length ? posts : username ? [] : demoPosts();

  if (!displayPosts.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="text-5xl">🎧</div>
        <p className="text-h_white font-semibold text-lg">No posts yet</p>
        <p className="text-gray-400 text-sm">
          Be the first to share something with the community!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {displayPosts.map((post) => (
        <Post key={post.id} post={post} currentUserId={userId} />
      ))}
    </div>
  );
};

export default Feed;
