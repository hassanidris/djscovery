"use client";

import { addPostComment } from "@/lib/actions";
import { useUser } from "@/lib/supabase/useUser";
import { toast } from "sonner";
import { PostComment, User } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState } from "react";

type DjSnippet = {
  avatar: string | null;
  stageName: string;
  slug?: string | null;
} | null;
type ReplyPreview = {
  id: number;
  content: string;
  user: Pick<User, "username" | "image" | "name">;
};
type CommentWithUser = PostComment & {
  user: User & { djProfile?: DjSnippet };
  replies?: ReplyPreview[];
};

const CommentsList = ({
  comments,
  postId,
  currentUserAvatarUrl,
}: {
  comments: CommentWithUser[];
  postId: number;
  currentUserAvatarUrl?: string | null;
}) => {
  const { user } = useUser();
  const [commentState, setCommentState] = useState(comments);
  const [text, setText] = useState("");

  const add = async () => {
    if (!user || !text.trim()) return;

    addOptimisticComment({
      id: Math.random(),
      content: text,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      userId: user.id,
      postId,
      parentId: null,
      user: {
        id: user.id,
        username: "Sending...",
        email: user.email ?? "",
        name: null,
        image: null,
        status: "ACTIVE",
        countryId: null,
        cityId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    });
    try {
      const created = await addPostComment(postId, text);
      setCommentState((prev) => [created, ...prev]);
      setText("");
    } catch {
      toast.error("Comment failed. Please try again.");
    }
  };

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    commentState,
    (state, value: CommentWithUser) => [value, ...state],
  );

  const userInitials = (user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <>
      {/* ── Comment input ── */}
      {user ? (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 shrink-0 ring-1 ring-gray-700">
            <AvatarImage src={currentUserAvatarUrl ?? ""} alt="" />
            <AvatarFallback className="bg-gray-700 text-gray-200 text-xs font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <form
            action={add}
            className="flex flex-1 items-center bg-gray-800/60 ring-1 ring-gray-700 focus-within:ring-gray-500 rounded-xl text-sm px-4 py-2 gap-2 transition-all"
          >
            <input
              type="text"
              placeholder="Write a comment…"
              className="bg-transparent outline-none flex-1 text-h_white placeholder:text-gray-500"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              type="submit"
              className="text-gray-500 hover:text-h_red transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 shrink-0 opacity-40 ring-1 ring-gray-700">
            <AvatarFallback className="bg-gray-700 text-gray-500 text-xs">
              ?
            </AvatarFallback>
          </Avatar>
          <Link
            href="/sign-up"
            className="flex-1 flex items-center justify-between bg-gray-800/40 ring-1 ring-gray-700 rounded-xl px-4 py-2 group hover:ring-h_red/50 transition-all"
          >
            <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
              Sign up to join the conversation…
            </span>
            <span className="text-xs text-h_red font-semibold shrink-0 ml-3">
              Sign Up →
            </span>
          </Link>
        </div>
      )}

      {/* ── Comment list ── */}
      {optimisticComments.length > 0 && (
        <div className="mt-3 flex flex-col gap-4">
          {optimisticComments.map((comment) => {
            const cAvatarSrc =
              (comment.user as any).djProfile?.avatar ??
              comment.user.image ??
              null;
            const cName =
              (comment.user as any).djProfile?.stageName ??
              comment.user.name ??
              comment.user.username;
            const isDj = !!(comment.user as any).djProfile?.stageName;
            const cHref = (comment.user as any).djProfile
              ? `/djs/${(comment.user as any).djProfile.slug ?? comment.user.username}`
              : `/profile/${comment.user.username}`;

            return (
              <div className="flex gap-3" key={comment.id}>
                <Link href={cHref} className="shrink-0">
                  <Avatar className="w-8 h-8 ring-1 ring-gray-700">
                    <AvatarImage src={cAvatarSrc ?? ""} alt={cName} />
                    <AvatarFallback className="bg-gray-700 text-gray-200 text-xs font-semibold">
                      {cName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-800/50 rounded-xl px-3 py-2">
                    <Link href={cHref}>
                      <span className="text-xs font-semibold text-h_white hover:text-gray-300 transition-colors">
                        {isDj ? `Dj. ${cName}` : cName}
                      </span>
                    </Link>
                    <p className="text-sm text-gray-300 mt-0.5">
                      {comment.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 px-1">
                    <span className="text-[10px]">
                      {comment.createdAt
                        ? new Date(comment.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )
                        : ""}
                    </span>
                  </div>
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2 flex flex-col gap-2 pl-3 border-l border-gray-700/60">
                      {comment.replies.map((reply) => {
                        const rName = reply.user.name ?? reply.user.username;
                        return (
                          <div
                            key={reply.id}
                            className="flex gap-2 items-start"
                          >
                            <Avatar className="w-6 h-6 shrink-0 ring-1 ring-gray-700">
                              <AvatarImage
                                src={reply.user.image ?? ""}
                                alt={rName}
                              />
                              <AvatarFallback className="bg-gray-700 text-gray-200 text-[10px] font-semibold">
                                {rName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-gray-800/50 rounded-lg px-2.5 py-1.5 flex-1">
                              <span className="text-[10px] font-semibold text-gray-300">
                                {rName}
                              </span>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default CommentsList;
