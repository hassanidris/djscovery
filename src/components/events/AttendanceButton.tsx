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
    <div className="mt-4 flex gap-3">
      <Button
        variant="outline"
        size="lg"
        disabled={isPending}
        onClick={() => handleToggle("GOING")}
        className={`flex-1 ${
          status === "GOING"
            ? "bg-h_red border-h_red hover:bg-h_redDark text-white"
            : "border-white/30 bg-white! text-black! hover:border-white/60 hover:bg-zinc-200!"
        }`}
      >
        {isPending && status === "GOING" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Calendar className="h-5 w-5" />
        )}
        Going
      </Button>

      <Button
        variant="outline"
        size="lg"
        disabled={isPending}
        onClick={() => handleToggle("INTERESTED")}
        className={`flex-1 ${
          status === "INTERESTED"
            ? "bg-h_red border-h_red hover:bg-h_redDark text-white"
            : "border-white/30 !bg-white !text-black hover:border-white/60 hover:!bg-zinc-200"
        }`}
      >
        {isPending && status === "INTERESTED" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Heart className="h-5 w-5" />
        )}
        Interested
      </Button>
    </div>
  );
}
