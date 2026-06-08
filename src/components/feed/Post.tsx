import Image from "next/image";
import Comments from "./Comments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Media, Post as PostType, User } from "@prisma/client";
import PostInfo from "./PostInfo";
import { Suspense } from "react";
import PostInteraction from "./PostInteraction";
import Link from "next/link";
import { Music2, Play } from "lucide-react";
import {
  PostInteractionSkeleton,
  CommentInputSkeleton,
} from "@/components/ui/skeletons";

type DjProfileSnippet = {
  avatar: string | null;
  stageName: string;
  slug: string;
} | null;

type FeedPostType = PostType & {
  user: User & { djProfile?: DjProfileSnippet };
} & {
  likes: { userId: string }[];
  media: Media[];
} & {
  _count: { comments: number };
};

const Post = ({
  post,
  currentUserId,
}: {
  post: FeedPostType;
  currentUserId?: string;
}) => {
  const avatarSrc =
    post.user.djProfile?.avatar ?? post.user.image ?? "/noAvatar.png";
  const displayName =
    post.user.djProfile?.stageName ?? post.user.name ?? post.user.username;
  const profileHref = post.user.djProfile?.slug
    ? `/djs/${post.user.djProfile.slug}`
    : `/profile/${post.user.username}`;

  const firstMedia = (post.media as any[])?.[0];

  return (
    <div className="flex flex-col bg-h_blackLight/50 rounded-xl border border-gray-800/70 shadow-md overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <Link href={profileHref} className="group">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 ring-1 ring-white/20 shrink-0">
              <AvatarImage src={avatarSrc} alt={displayName} />
              <AvatarFallback className="bg-white/10 text-white text-sm font-semibold">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-h_white group-hover:text-white/70 transition-colors leading-tight">
                Dj. {displayName}
              </span>
              <span className="text-[11px] text-white/40 leading-none mt-0.5">
                @{post.user.djProfile?.slug ?? post.user.username}
              </span>
            </div>
          </div>
        </Link>
        {currentUserId === post.user.id && <PostInfo postId={post.id} />}
      </div>

      {/* ── Content + Media (single container) ── */}
      {(post.content || firstMedia) && (
        <div className="mx-4 mb-3 bg-black/25 rounded-xl border border-white/[0.07] overflow-hidden">
          {post.content && (
            <p className="text-h_white text-sm leading-relaxed px-4 pt-3 pb-3">
              {post.content}
            </p>
          )}

          {firstMedia?.type === "IMAGE" && (
            <Image
              src={firstMedia.url}
              alt="post image"
              width={800}
              height={450}
              className="w-full object-cover max-h-96"
            />
          )}

          {firstMedia?.type === "VIDEO" && (
            <div className={post.content ? "px-4 pb-3" : "p-3"}>
              <video
                src={firstMedia.url}
                controls
                className="w-full rounded-lg border border-white/10 max-h-80"
              />
            </div>
          )}

          {firstMedia?.type === "AUDIO" && (
            <div className={post.content ? "px-4 pb-3" : "p-3"}>
              <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl border border-white/10">
                <div className="w-11 h-11 rounded-xl bg-h_red/10 border border-h_red/20 flex items-center justify-center shrink-0">
                  <Music2 className="w-5 h-5 text-h_red" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-h_white font-semibold truncate">
                    {firstMedia.title ?? "Mix"}
                  </p>
                  {firstMedia.duration && (
                    <p className="text-xs text-white/40 mt-0.5">
                      {firstMedia.duration}
                    </p>
                  )}
                  <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-h_red rounded-full" />
                  </div>
                </div>
                <a
                  href={firstMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 bg-h_red/90 hover:bg-h_red rounded-full flex items-center justify-center shrink-0 transition-colors"
                >
                  <Play className="w-4 h-4 text-white" fill="white" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Interaction (likes / comments count) ── */}
      <div className="border-t border-white/10 px-4 py-2.5">
        <Suspense fallback={<PostInteractionSkeleton />}>
          <PostInteraction
            postId={post.id}
            likes={post.likes.map((like) => like.userId)}
            commentNumber={post._count.comments}
            currentUserId={currentUserId}
          />
        </Suspense>
      </div>

      {/* ── Comments ── */}
      <div className="border-t border-white/10 px-4 py-4 bg-black/20">
        <Suspense fallback={<CommentInputSkeleton />}>
          <Comments
            postId={post.id}
            initialComments={(post as any).demoComments}
            currentUserId={currentUserId}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default Post;
