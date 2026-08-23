"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function UpgradeModalContent({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Organizers only</DialogTitle>
        <DialogDescription>
          Booking requests are reserved for promoters, venues, and event
          organizers. Upgrade your account to unlock professional tools.
        </DialogDescription>
      </DialogHeader>
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
        <p className="font-medium text-white">Why upgrade?</p>
        <ul className="mt-2 space-y-1 text-gray-400">
          <li>• Manage booking threads in one inbox</li>
          <li>• Unlock organizer-only gig publishing tools</li>
          <li>• Get curated DJ recommendations</li>
        </ul>
      </div>
      <DialogFooter className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          className="w-full sm:flex-1"
          onClick={onClose}
        >
          Maybe later
        </Button>
        <Button className="w-full sm:flex-1" asChild>
          <Link href="/become-organizer">Become an Organizer</Link>
        </Button>
      </DialogFooter>
    </>
  );
}
