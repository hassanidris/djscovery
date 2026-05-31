import Post from "./Post";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";

const postInclude = {
  user: true,
  likes: { select: { userId: true } },
  _count: { select: { comments: true } },
} as const;

const Feed = async ({ username }: { username?: string }) => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const userId = authUser?.id;

  let posts: any[] = [];

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
  } else {
    posts = await prisma.post.findMany({
      where: { deletedAt: null },
      include: postInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <div className="p-4 bg-h_blackLight/50 shadow-md rounded-lg flex flex-col divide-y divide-dashed divide-gray-600 gap-10">
      {posts.length ? (
        posts.map((post) => (
          <Post key={post.id} post={post} currentUserId={userId} />
        ))
      ) : (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="text-5xl">🎧</div>
          <p className="text-h_white font-semibold text-lg">No posts yet</p>
          <p className="text-gray-400 text-sm">
            Be the first to share something with the community!
          </p>
        </div>
      )}
    </div>
  );
};

export default Feed;
