"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminPagination({
  nextCursor,
  hasPrev,
}: {
  nextCursor: string | null;
  hasPrev: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(cursor: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (cursor) {
      params.set("cursor", cursor);
    } else {
      params.delete("cursor");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  if (!hasPrev && !nextCursor) return null;

  return (
    <div className="flex items-center justify-end gap-2 pt-4">
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPrev}
        onClick={() => navigate(null)}
        className="border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!nextCursor}
        onClick={() => navigate(nextCursor)}
        className="border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-40"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
