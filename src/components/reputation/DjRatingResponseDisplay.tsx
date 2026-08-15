import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DjRatingResponseDisplayProps {
  response: string;
  respondedAt?: Date | string | null;
}

export function DjRatingResponseDisplay({
  response,
  respondedAt,
}: DjRatingResponseDisplayProps) {
  const dateString = respondedAt
    ? new Date(respondedAt).toLocaleDateString()
    : null;

  return (
    <Card className="bg-h_blackLight/30 mt-3 border-white/5 p-4">
      <div className="flex items-start gap-2">
        <MessageSquare className="mt-1 h-4 w-4 shrink-0 text-blue-400" />
        <div className="flex-1">
          <p className="mb-2 text-xs font-medium text-white">DJ Response</p>
          <p className="text-sm text-gray-300">{response}</p>
          {dateString && (
            <p className="mt-2 text-xs text-gray-500">
              Responded {dateString}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
