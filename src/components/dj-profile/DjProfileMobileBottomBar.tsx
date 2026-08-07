"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  feeMin?: number | null;
  feeMax?: number | null;
  feeCurrency?: string | null;
  onBookClick?: () => void;
  isOwner?: boolean;
};

export default function DjProfileMobileBottomBar({
  feeMin,
  feeMax,
  feeCurrency,
  onBookClick,
  isOwner = false,
}: Props) {
  const formatFeeRange = () => {
    if (!feeMin && !feeMax) return null;
    const symbol = feeCurrency || "$";
    if (feeMin && feeMax && feeMax > feeMin) {
      return `${symbol}${feeMin.toLocaleString()} – ${symbol}${feeMax.toLocaleString()}`;
    }
    if (feeMin) {
      return `From ${symbol}${feeMin.toLocaleString()}`;
    }
    if (feeMax) {
      return `Up to ${symbol}${feeMax.toLocaleString()}`;
    }
    return null;
  };

  const feeRange = formatFeeRange();

  if (isOwner) {
    return null;
  }

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-white/10 bg-black/95 backdrop-blur-md lg:hidden">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {feeRange && (
            <div className="flex flex-col">
              <span className="text-[11px] text-gray-400">Fee Range</span>
              <span className="text-sm font-semibold text-white">
                {feeRange}
              </span>
            </div>
          )}
          <Button
            onClick={onBookClick}
            className="bg-h_red hover:bg-h_redDark flex-1 font-semibold text-white"
            size="sm"
          >
            Book DJ
          </Button>
        </div>
      </div>
    </div>
  );
}
