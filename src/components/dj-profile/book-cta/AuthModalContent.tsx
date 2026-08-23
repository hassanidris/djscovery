"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AuthModalContent({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Sign in to continue</DialogTitle>
        <DialogDescription>
          You need a DJcovery account to send booking requests. Sign in or
          create a free organizer account in seconds.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          className="w-full sm:flex-1"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button className="w-full sm:flex-1" asChild>
          <Link
            href={`/sign-in?returnTo=${encodeURIComponent(window.location.pathname)}`}
          >
            Sign In
          </Link>
        </Button>
      </DialogFooter>
    </>
  );
}
