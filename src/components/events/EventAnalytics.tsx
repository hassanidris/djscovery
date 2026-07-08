import { Eye, Users, Heart } from "lucide-react";

interface Props {
  viewCount: number;
  goingCount: number;
  interestedCount: number;
}

export function EventAnalytics({
  viewCount,
  goingCount,
  interestedCount,
}: Props) {
  return (
    <div className="flex flex-wrap gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-zinc-400" />
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500">Views</span>
          <span className="text-sm font-semibold text-white">{viewCount}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-zinc-400" />
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500">Going</span>
          <span className="text-sm font-semibold text-white">{goingCount}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-zinc-400" />
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500">Interested</span>
          <span className="text-sm font-semibold text-white">{interestedCount}</span>
        </div>
      </div>
    </div>
  );
}
