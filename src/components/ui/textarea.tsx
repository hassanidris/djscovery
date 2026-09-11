import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "focus-visible:border-h_red/50 focus-visible:ring-h_red/20 flex field-sizing-content min-h-16 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-base transition-all duration-200 outline-none placeholder:text-gray-400 focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-white/5 disabled:opacity-50 aria-invalid:border-red-500/50 aria-invalid:ring-2 aria-invalid:ring-red-500/20 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
