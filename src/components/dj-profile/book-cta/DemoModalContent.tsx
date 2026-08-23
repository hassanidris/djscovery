"use client";

import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DemoModalContent({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Booking is disabled in demo mode</DialogTitle>
        <DialogDescription>
          This is a preview profile. Sign in to a real DJ profile to send a
          booking request.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button onClick={onClose}>Got it</Button>
      </DialogFooter>
    </>
  );
}
