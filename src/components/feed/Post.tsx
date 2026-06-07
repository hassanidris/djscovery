import Image from "next/image";
import Comments from "./Comments";
import {
  Media,
  Post as PostType,
  PostType as PostTypeEnum,
  User,
} from "@prisma/client";
import PostInfo from "./PostInfo";
import { Suspense } from "react";
import PostInteraction from "./PostInteraction";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { FileText, ImageIcon, Video, Music2, Play } from "lucide-react";

type FeedPostType = PostType & { user: User } & {
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
  return (
    <div className="flex flex-col gap-4 p-4 bg-h_blackLight/50 rounded-xl border border-gray-800/70 shadow-md">
      {/* USER */}
      {/*
        Post type badge: reads the real `post.type` field from the DB
        (PostTypeEnum: TEXT | IMAGE). No fake data — this reflects what
        the user actually posted, making each card self-descriptive.
        Using shadcn Badge so it stays consistent with the header stats
        and right-panel genre labels across the whole page.
      */}
      <div className="flex items-center justify-between">
        <Link href={`/profile/${post.user.username}`}>
          <div className="flex items-center gap-3 text-h_white hover:underline">
            <Image
              src={post.user.image || "/noAvatar.png"}
              width={40}
              height={40}
              alt=""
              className="w-10 h-10 rounded-full ring-1 ring-gray-700 object-cover"
            />
            <div className="flex flex-col">
              <span className="font-medium leading-tight">
                {post.user.username}
              </span>
              {/* Post type badge — directly below the name */}
              {post.type === PostTypeEnum.IMAGE ? (
                <Badge className="w-fit bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-1.5 py-0 gap-1 mt-0.5">
                  <ImageIcon className="w-2.5 h-2.5" /> Photo
                </Badge>
              ) : (
                <Badge className="w-fit bg-gray-700/50 text-gray-400 border border-gray-700 text-[10px] px-1.5 py-0 gap-1 mt-0.5">
                  <FileText className="w-2.5 h-2.5" /> Post
                </Badge>
              )}
            </div>
          </div>
        </Link>
        {currentUserId === post.user.id && <PostInfo postId={post.id} />}
      </div>
      {/* CONTENT */}
      <div className="flex flex-col gap-4 text-h_white">
        {post.content && <p>{post.content}</p>}
        {(() => {
          const m = (post.media as any[])?.[0];
          if (!m) return null;
          if (m.type === "VIDEO")
            return (
              <video
                src={m.url}
                controls
                className="w-full rounded-lg ring-1 ring-gray-700 max-h-80 object-cover"
              />
            );
          if (m.type === "AUDIO")
            return (
              <div className="flex items-center gap-4 p-4 bg-gray-800/60 rounded-xl ring-1 ring-gray-700">
                <div className="w-12 h-12 rounded-xl bg-h_red/10 border border-h_red/20 flex items-center justify-center shrink-0">
                  <Music2 className="w-6 h-6 text-h_red" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-h_white font-semibold truncate">
                    {m.title ?? "Mix"}
                  </p>
                  {m.duration && (
                    <p className="text-xs text-gray-500 mt-0.5">{m.duration}</p>
                  )}
                  <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-h_red rounded-full" />
                  </div>
                </div>
                <div className="size-10 bg-h_red/90 rounded-full flex items-center justify-center shrink-0">
                  <Play className="w-4 h-4 text-white" fill="white" />
                </div>
              </div>
            );
          return (
            <div className="relative w-full rounded-lg overflow-hidden">
              <Image
                src={m.url}
                alt="post image"
                width={800}
                height={450}
                className="w-full object-cover rounded-lg"
              />
            </div>
          );
        })()}
      </div>
      {/* INTERACTION */}
      <Suspense fallback="Loading...">
        <PostInteraction
          postId={post.id}
          likes={post.likes.map((like) => like.userId)}
          commentNumber={post._count.comments}
          currentUserId={currentUserId}
        />
      </Suspense>
      <div className="border-t border-gray-700/50" />
      <Suspense fallback="Loading...">
        <Comments
          postId={post.id}
          initialComments={(post as any).demoComments}
        />
      </Suspense>
    </div>
  );
};

export default Post;
