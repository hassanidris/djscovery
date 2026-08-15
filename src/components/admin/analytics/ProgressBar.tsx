export function ProgressBar({
  value,
  max = 100,
  color = "blue",
  size = "md",
}: {
  value: number;
  max?: number;
  color?: "blue" | "green" | "red" | "amber" | "purple";
  size?: "sm" | "md" | "lg";
}) {
  const percentage = Math.min((value / max) * 100, 100);

  const colorClasses = {
    blue: "bg-blue-400",
    green: "bg-emerald-400",
    red: "bg-red-400",
    amber: "bg-amber-400",
    purple: "bg-purple-400",
  };

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className="w-full">
      <div className={`w-full rounded-full bg-white/10 ${sizeClasses[size]}`}>
        <div
          className={`rounded-full transition-all duration-500 ${colorClasses[color]} ${sizeClasses[size]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}