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
        <div className="absolute top-4 right-0 bg-white p-4 w-32 rounded-lg flex flex-col gap-2 text-xs shadow-lg z-30">
          <span className="cursor-pointer">View</span>
          <span className="cursor-pointer">Re-post</span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="text-red-500 text-left"
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
