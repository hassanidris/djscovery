import { Skeleton } from "@/components/ui/skeleton";

export default function DjLoading() {
  return (
    <div className="min-w-0 flex-1">
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}
