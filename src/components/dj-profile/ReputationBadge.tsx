import { cn } from "@/lib/utils";

export function ReputationBadge({
  score,
  className,
  variant = "default",
  showScore = true,
}: {
  score: number;
  className?: string;
  variant?: "default" | "subtle";
  showScore?: boolean;
}) {
  const tier =
    score >= 851
      ? "Elite"
      : score >= 651
        ? "Top Rated"
        : score >= 401
          ? "Established"
          : "Emerging";

  const solid =
    score >= 851
      ? "bg-purple-500 text-white"
      : score >= 651
        ? "bg-amber-500 text-white"
        : score >= 401
          ? "bg-blue-500 text-white"
          : "bg-gray-400 text-white";

  const subtle =
    score >= 851
      ? "bg-purple-500/15 text-purple-300 border border-purple-500/25"
      : score >= 651
        ? "bg-amber-500/15 text-amber-300 border border-amber-500/25"
        : score >= 401
          ? "bg-blue-500/15 text-blue-300 border border-blue-500/25"
          : "bg-gray-500/15 text-gray-300 border border-gray-500/25";

  return (
    <div
      className={cn(
        variant === "subtle" ? subtle : solid,
        "rounded-full px-3 py-1 font-bold",
        className,
      )}
    >
      {showScore ? `${score} — ${tier}` : tier}
    </div>
  );
}
