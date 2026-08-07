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
    <div className="bg-h_blackLight/50 flex flex-col overflow-hidden rounded-xl border border-gray-800/70 shadow-md">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <Link href={profileHref} className="group">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0 ring-1 ring-white/20">
              <AvatarImage src={avatarSrc} alt={displayName} />
              <AvatarFallback className="bg-white/10 text-sm font-semibold text-white">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-h_white text-sm leading-tight font-semibold transition-colors group-hover:text-white/70">
                Dj. {displayName}
              </span>
              <span className="mt-0.5 text-xs leading-none text-white/40">
                @{post.user.djProfile?.slug ?? post.user.username}
              </span>
            </div>
          </div>
        </Link>
        {currentUserId === post.user.id && <PostInfo postId={post.id} />}
      </div>

      {/* ── Content + Media (single container) ── */}
      {(post.content || firstMedia) && (
        <div className="mx-4 mb-3 overflow-hidden rounded-xl border border-white/[0.07] bg-black/25">
          {post.content && (
            <p className="text-h_white px-4 pt-3 pb-3 text-sm leading-relaxed">
              {post.content}
            </p>
          )}

          {firstMedia?.type === "IMAGE" && (
            <Image
              src={firstMedia.url}
              alt="post image"
              width={800}
              height={450}
              className="max-h-96 w-full object-cover"
            />
          )}

          {firstMedia?.type === "VIDEO" && (
            <div className={post.content ? "px-4 pb-3" : "p-3"}>
              <video
                src={firstMedia.url}
                controls
                className="max-h-80 w-full rounded-lg border border-white/10"
              />
            </div>
          )}

          {firstMedia?.type === "AUDIO" && (
            <div className={post.content ? "px-4 pb-3" : "p-3"}>
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="bg-h_red/10 border-h_red/20 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border">
                  <Music2 className="text-h_redLight h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-h_white truncate text-sm font-semibold">
                    {firstMedia.title ?? "Mix"}
                  </p>
                  {firstMedia.duration && (
                    <p className="mt-0.5 text-xs text-white/40">
                      {firstMedia.duration}
                    </p>
                  )}
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                    <div className="bg-h_red h-full w-1/3 rounded-full" />
                  </div>
                </div>
                <a
                  href={firstMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-h_red/90 hover:bg-h_red flex size-9 shrink-0 items-center justify-center rounded-full transition-colors"
                >
                  <Play className="h-4 w-4 text-white" fill="white" />
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
      <div className="border-t border-white/10 bg-black/20 px-4 py-4">
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
