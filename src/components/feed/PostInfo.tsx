"use client";

import { deletePost } from "@/lib/actions/feed";
import { MoreVertical } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PostInfo = ({ postId }: { postId: number }) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deletePost(postId);
        toast.success("Post deleted");
      } catch {
        toast.error("Couldn’t delete post. Try again.");
      }
    });
  };

  return (
    <div className="relative">
      <MoreVertical
        className="h-4 w-4 cursor-pointer text-gray-200"
        onClick={() => setOpen((prev) => !prev)}
      />
      {open && (
        <div className="bg-h_blackLight absolute top-6 right-0 z-30 flex w-36 flex-col gap-0.5 rounded-xl border border-gray-700/80 p-1.5 shadow-xl">
          <span className="hover:text-h_white cursor-pointer rounded-lg px-3 py-2 text-xs text-gray-400 transition-colors hover:bg-gray-700/50">
            View
          </span>
          <span className="hover:text-h_white cursor-pointer rounded-lg px-3 py-2 text-xs text-gray-400 transition-colors hover:bg-gray-700/50">
            Re-post
          </span>
          <div className="my-0.5 border-t border-gray-700/60" />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="w-full rounded-lg px-3 py-2 text-left text-xs text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                onClick={() => setOpen(false)}
              >
                Delete
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-h_blackLight border border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  Delete Post?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  This post will be permanently deleted. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  {isPending ? "Deleting..." : "Delete Post"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};

export default PostInfo;
