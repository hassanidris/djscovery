export function TimeSeriesChart({
  data,
  color = "blue",
  height = 200,
}: {
  data: { period: string; value: number }[];
  color?: "blue" | "green" | "red" | "amber" | "purple";
  height?: number;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value), 0);
  const range = maxValue - minValue || 1;

  const colorClasses = {
    blue: "stroke-blue-400 fill-blue-400/10",
    green: "stroke-emerald-400 fill-emerald-400/10",
    red: "stroke-red-400 fill-red-400/10",
    amber: "stroke-amber-400 fill-amber-400/10",
    purple: "stroke-purple-400 fill-purple-400/10",
  };

  const points = data
    .map((d, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((d.value - minValue) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="w-full"
      style={{ height: `${height}px` }}
    >
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        className={colorClasses[color].split(" ")[1]}
        fill={`url(#gradient-${color})`}
      />
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={points}
        className={colorClasses[color].split(" ")[0]}
        vectorEffect="non-scaling-stroke"
      />
      {data.map((d, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((d.value - minValue) / range) * 100;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="1.5"
            className={colorClasses[color].split(" ")[0]}
          />
        );
      })}
    </svg>
  );
}