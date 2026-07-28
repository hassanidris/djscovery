import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function DjOverviewLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-28 rounded" />
        <Skeleton className="h-8 w-40 rounded" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card size="sm" key={i}>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                <Skeleton className="h-3 w-20 rounded" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-16 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile completeness */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="pt-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 shrink-0 rounded" />
              <Skeleton className="h-4 w-72 rounded" />
            </div>
            <Skeleton className="h-5 w-12 rounded" />
          </div>
          <Skeleton className="mb-4 h-1.5 w-full rounded" />
          <div className="mb-4 flex flex-col gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-1.5 w-1.5 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-52 rounded" />
              </div>
            ))}
          </div>
          <Skeleton className="h-8 w-36 rounded" />
        </CardContent>
      </Card>

      <Separator />

      {/* Media performance */}
      <section>
        <Skeleton className="mb-4 h-4 w-44 rounded" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card size="sm" key={i}>
              <CardHeader>
                <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  <Skeleton className="h-3 w-20 rounded" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-16 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Quick actions */}
      <Skeleton className="h-4 w-32 rounded" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 py-5">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="mt-0.5 h-3.5 w-48 rounded" />
              </div>
              <Skeleton className="h-8 w-14 shrink-0 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Tips */}
      <Card className="border-white/8 bg-white/3">
        <CardContent className="pt-5">
          <Skeleton className="mb-3 h-4 w-52 rounded" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-full" />
                <Skeleton className="h-3.5 w-full rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
