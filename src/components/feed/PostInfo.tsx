"use client";

import { deletePost } from "@/lib/actions";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
      <FontAwesomeIcon
        icon={faEllipsis}
        className=" text-gray-200 w-4 h-4 cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      />
      {open && (
        <div className="absolute top-6 right-0 bg-h_blackLight border border-gray-700/80 p-1.5 w-36 rounded-xl flex flex-col gap-0.5 shadow-xl z-30">
          <span className="cursor-pointer text-gray-400 hover:text-h_white hover:bg-gray-700/50 rounded-lg px-3 py-2 text-xs transition-colors">
            View
          </span>
          <span className="cursor-pointer text-gray-400 hover:text-h_white hover:bg-gray-700/50 rounded-lg px-3 py-2 text-xs transition-colors">
            Re-post
          </span>
          <div className="border-t border-gray-700/60 my-0.5" />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg px-3 py-2 text-xs transition-colors"
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
                <AlertDialogCancel className="bg-white/5 border-white/20 text-gray-300 hover:bg-white/10">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white"
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
