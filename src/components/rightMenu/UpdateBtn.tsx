"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

const UpdateBtn = () => {
  const { pending } = useFormStatus();

  return (
    <button
      className="bg-blue-500 hover:bg-blue-600 active:scale-95 p-2 mt-2 rounded-md text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Updating...
        </>
      ) : (
        "Update"
      )}
    </button>
  );
};

export default UpdateBtn;
