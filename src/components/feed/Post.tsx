import Image from "next/image";
import Comments from "./Comments";
import { Media, Post as PostType, User } from "@prisma/client";
import PostInfo from "./PostInfo";
import { Suspense } from "react";
import PostInteraction from "./PostInteraction";
import Link from "next/link";

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
    <div className="flex flex-col gap-4 pt-8 first-of-type:pt-0">
      {/* USER */}
      <div className="flex items-center justify-between">
        <Link href={`/profile/${post.user.username}`}>
          <div className="flex items-center gap-4 text-h_white hover:underline">
            <Image
              src="/noAvatar.png"
              width={40}
              height={40}
              alt=""
              className="w-10 h-10 rounded-full ring-1 ring-gray-400"
            />
            <span className="font-medium">{post.user.username}</span>
          </div>
        </Link>
        {currentUserId === post.user.id && <PostInfo postId={post.id} />}
      </div>
      {/* CONTENT */}
      <div className="flex flex-col gap-4 text-h_white">
        {post.content && <p>{post.content}</p>}
        {post.media?.[0] && (
          <div className="relative w-full rounded-lg overflow-hidden">
            <Image
              src={post.media[0].url}
              alt="post image"
              width={800}
              height={450}
              className="w-full object-cover rounded-lg"
            />
          </div>
        )}
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
      <Suspense fallback="Loading...">
        <Comments postId={post.id} />
      </Suspense>
    </div>
  );
};

export default Post;
