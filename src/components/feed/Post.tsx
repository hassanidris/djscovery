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
import { FileText, ImageIcon } from "lucide-react";

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
