"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleEventAttendance } from "@/lib/actions/event-attendance";

interface Props {
  eventId: number;
  currentStatus: "GOING" | "INTERESTED" | null;
  isUpcoming: boolean;
}

export default function AttendanceButton({
  eventId,
  currentStatus,
  isUpcoming,
}: Props) {
  const [status, setStatus] = useState<"GOING" | "INTERESTED" | null>(
    currentStatus,
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleToggle(newStatus: "GOING" | "INTERESTED") {
    startTransition(async () => {
      const result = await toggleEventAttendance(eventId, newStatus);

      if (!result.success) {
        if (result.error === "Unauthorized") {
          router.push("/sign-in");
        } else {
          toast.error(result.error);
        }
        return;
      }

      // Toggle logic: if clicking same status, remove it
      if (status === newStatus) {
        setStatus(null);
        toast.success("Removed from attendance");
      } else {
        setStatus(newStatus);
        toast.success(
          newStatus === "GOING"
            ? "Going to this event"
            : "Interested in this event",
        );
      }
    });
  }

  if (!isUpcoming) {
    return null;
  }

  return (
    <div className="mt-7 flex gap-2">
      <Button
        variant={status === "GOING" ? "default" : "outline"}
        size="sm"
        disabled={isPending}
        onClick={() => handleToggle("GOING")}
        className={
          status === "GOING"
            ? "bg-h_red hover:bg-h_redDark text-white"
            : "border-white/20 text-gray-300 hover:border-white/40 hover:text-white"
        }
      >
        {isPending && status === "GOING" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Calendar className="h-4 w-4" />
        )}
        Going
      </Button>

      <Button
        variant={status === "INTERESTED" ? "default" : "outline"}
        size="sm"
        disabled={isPending}
        onClick={() => handleToggle("INTERESTED")}
        className={
          status === "INTERESTED"
            ? "bg-h_red hover:bg-h_redDark text-white"
            : "border-white/20 text-gray-300 hover:border-white/40 hover:text-white"
        }
      >
        {isPending && status === "INTERESTED" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className="h-4 w-4" />
        )}
        Interested
      </Button>
    </div>
  );
}
