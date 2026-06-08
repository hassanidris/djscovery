"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

const AddPostBtn = () => {
  const { pending } = useFormStatus();

  return (
    <button
      className="bg-h_red hover:bg-h_redDark active:scale-95 p-2 mt-2 rounded-md text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 text-sm font-medium min-w-18 justify-center"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Sending
        </>
      ) : (
        "Post"
      )}
    </button>
  );
};

export default AddPostBtn;
