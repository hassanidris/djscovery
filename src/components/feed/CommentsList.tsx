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
        imagePath: null,
        status: "ACTIVE",
        onboardingComplete: false,
        countryId: null,
        cityId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        lastLoginAt: null,
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
          <Avatar className="h-8 w-8 shrink-0 ring-1 ring-gray-700">
            <AvatarImage src={currentUserAvatarUrl ?? ""} alt="" />
            <AvatarFallback className="bg-gray-700 text-xs font-semibold text-gray-200">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <form
            action={add}
            className="flex flex-1 items-center gap-2 rounded-xl bg-gray-800/60 px-4 py-2 text-sm ring-1 ring-gray-700 transition-all focus-within:ring-gray-500"
          >
            <input
              type="text"
              placeholder="Write a comment…"
              className="text-h_white flex-1 bg-transparent outline-none placeholder:text-gray-500"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              type="submit"
              className="hover:text-h_red shrink-0 text-gray-500 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0 opacity-40 ring-1 ring-gray-700">
            <AvatarFallback className="bg-gray-700 text-xs text-gray-500">
              ?
            </AvatarFallback>
          </Avatar>
          <Link
            href="/sign-up"
            className="group hover:ring-h_red/50 flex flex-1 items-center justify-between rounded-xl bg-gray-800/40 px-4 py-2 ring-1 ring-gray-700 transition-all"
          >
            <span className="text-sm text-gray-500 transition-colors group-hover:text-gray-400">
              Sign up to join the conversation…
            </span>
            <span className="text-h_red ml-3 shrink-0 text-xs font-semibold">
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
            const cHref = (comment.user as any).djProfile?.slug
              ? `/djs/${(comment.user as any).djProfile.slug}`
              : `/profile/${comment.user.username}`;

            return (
              <div className="flex gap-3" key={comment.id}>
                <Link href={cHref} className="shrink-0">
                  <Avatar className="h-8 w-8 ring-1 ring-gray-700">
                    <AvatarImage src={cAvatarSrc ?? ""} alt={cName} />
                    <AvatarFallback className="bg-gray-700 text-xs font-semibold text-gray-200">
                      {cName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="rounded-xl bg-gray-800/50 px-3 py-2">
                    <Link href={cHref}>
                      <span className="text-h_white text-xs font-semibold transition-colors hover:text-gray-300">
                        {isDj ? `Dj. ${cName}` : cName}
                      </span>
                    </Link>
                    <p className="mt-0.5 text-sm text-gray-300">
                      {comment.content}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center gap-4 px-1 text-xs text-gray-500">
                    <span className="text-[11px]">
                      {comment.createdAt
                        ? new Date(comment.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )
                        : ""}
                    </span>
                  </div>
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2 flex flex-col gap-2 border-l border-gray-700/60 pl-3">
                      {comment.replies.map((reply) => {
                        const rName = reply.user.name ?? reply.user.username;
                        return (
                          <div
                            key={reply.id}
                            className="flex items-start gap-2"
                          >
                            <Avatar className="h-6 w-6 shrink-0 ring-1 ring-gray-700">
                              <AvatarImage
                                src={reply.user.image ?? ""}
                                alt={rName}
                              />
                              <AvatarFallback className="bg-gray-700 text-[10px] font-semibold text-gray-200">
                                {rName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 rounded-lg bg-gray-800/50 px-2.5 py-1.5">
                              <span className="text-[11px] font-semibold text-gray-300">
                                {rName}
                              </span>
                              <p className="mt-0.5 text-xs text-gray-400">
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
