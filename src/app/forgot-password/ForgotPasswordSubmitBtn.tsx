"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function ForgotPasswordSubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-h_red hover:bg-h_redDark active:scale-[0.98] flex cursor-pointer items-center justify-center gap-2 rounded-lg py-3 font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        "Send reset link"
      )}
    </button>
  );
}
