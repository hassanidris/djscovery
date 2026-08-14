import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DjGigReviewLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-2xl px-4 py-10 md:px-8">
        <Skeleton className="mb-6 h-8 w-24" />

        <Skeleton className="mb-2 h-8 w-64" />
        <Skeleton className="mb-6 h-4 w-48" />

        <Card className="border-white/8 bg-white/3">
          <CardContent className="py-5">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}