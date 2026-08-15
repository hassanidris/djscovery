import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = "blue",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; direction: "up" | "down" | "neutral" };
  color?: "blue" | "green" | "red" | "amber" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-emerald-500/10 text-emerald-400",
    red: "bg-red-500/10 text-red-400",
    amber: "bg-amber-500/10 text-amber-400",
    purple: "bg-purple-500/10 text-purple-400",
  };

  const trendColorClasses = {
    up: "text-emerald-400",
    down: "text-red-400",
    neutral: "text-gray-400",
  };

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-5">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trendColorClasses[trend.direction]}`}>
            {trend.direction === "up" && "↑"}
            {trend.direction === "down" && "↓"}
            {trend.direction === "neutral" && "→"}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-muted-foreground mt-1 text-sm">{label}</p>
      </div>
    </div>
  );
}