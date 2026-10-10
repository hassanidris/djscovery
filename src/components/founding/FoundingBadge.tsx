import * as React from "react";
import { Crown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FoundingBadgeProps {
  foundingNumber: number;
  className?: string;
}

export function FoundingBadge({ foundingNumber, className }: FoundingBadgeProps) {
  const badgeId = `#FDJ-${String(foundingNumber).padStart(3, "0")}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border-2 border-amber-400/30 bg-gradient-to-r from-amber-500/10 to-amber-600/10 px-3 py-1 text-xs font-semibold text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.15)] transition-all hover:border-amber-400/50 hover:shadow-[0_0_16px_rgba(251,191,36,0.25)]",
              className,
            )}
          >
            <Crown className="size-3.5" />
            <span>{badgeId}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="border-amber-400/20 bg-amber-950/90 text-amber-100"
        >
          <p className="text-xs font-medium">
            Founding Member #{foundingNumber}
          </p>
          <p className="mt-1 text-[10px] text-amber-200/70">
            Early supporter of DJcovery
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
