export function RatingDistributionChart({
  data,
  total,
}: {
  data: { rating: number; count: number; percentage: number }[];
  total: number;
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      {[5, 4, 3, 2, 1].map((rating) => {
        const item = data.find((d) => d.rating === rating);
        const count = item?.count || 0;
        const percentage = item?.percentage || 0;
        const barWidth = (count / maxCount) * 100;

        return (
          <div key={rating} className="flex items-center gap-3">
            <div className="w-8 text-right text-sm text-gray-400">{rating}</div>
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-gray-300">{count} reviews</span>
                <span className="text-gray-400">{percentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}