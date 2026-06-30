"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitBookingInquiry } from "@/lib/actions/booking-inquiry";
import type { BookingViewerContext } from "@/types/booking";
import { CalendarCheck2, Loader2, Rocket, ShieldAlert } from "lucide-react";

type BookCTAVariant = "free" | "premium";
type BookCTALayout = "mobile" | "desktop";
type ModalState = "none" | "auth" | "upgrade" | "booking" | "demo";

type Props = {
  stageName: string;
  djProfileId?: number;
  viewer?: BookingViewerContext;
  variant?: BookCTAVariant;
  layout?: BookCTALayout;
  responseRate?: number;
  bookingSuccessRate?: number;
};

export function BookCTA({
  stageName,
  djProfileId,
  viewer,
  variant = "free",
  layout = "mobile",
  responseRate = 0,
  bookingSuccessRate = 0,
}: Props) {
  const ctx: BookingViewerContext = useMemo(
    () =>
      viewer ?? {
        role: "guest",
        isAuthenticated: false,
      },
    [viewer],
  );

  if (ctx.role === "dj-owner") {
    return null;
  }

  const [modal, setModal] = useState<ModalState>("none");
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    eventName: "",
    eventDate: "",
    venue: "",
    city: "",
    crowdSize: "",
    budgetMin: "",
    budgetMax: "",
    budgetCurrency: "SEK",
    message: "",
  });

  const returnTo = useMemo(
    () => (typeof window !== "undefined" ? window.location.pathname : "/"),
    [],
  );

  const isPremium = variant === "premium";
  const isDesktop = layout === "desktop";
  const isOrganizer = ctx.role === "organizer" || ctx.role === "admin";
  const isDemoProfile = Number.isNaN(djProfileId) || djProfileId === undefined;

  const handlePrimaryClick = () => {
    if (isDemoProfile) {
      setModal("demo");
      return;
    }
    if (!ctx.isAuthenticated) {
      setModal("auth");
      return;
    }
    if (!isOrganizer) {
      setModal("upgrade");
      return;
    }
    setModal("booking");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!djProfileId) {
      toast.error("Booking form is unavailable for this profile.");
      return;
    }
    startTransition(async () => {
      const payload = {
        djProfileId,
        eventName: form.eventName,
        eventDate: form.eventDate ? new Date(form.eventDate) : null,
        venue: form.venue || null,
        city: form.city || null,
        crowdSize: form.crowdSize ? Number(form.crowdSize) : null,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : null,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : null,
        budgetCurrency: form.budgetCurrency || null,
        message: form.message,
      };

      const result = await submitBookingInquiry(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Booking request sent to the DJ");
      setModal("none");
      setForm({
        eventName: "",
        eventDate: "",
        venue: "",
        city: "",
        crowdSize: "",
        budgetMin: "",
        budgetMax: "",
        budgetCurrency: "SEK",
        message: "",
      });
    });
  };

  return (
    <div
      className={cn(isDesktop && "hidden lg:block", !isDesktop && "lg:hidden")}
    >
      <Card
        className={cn(
          "gap-0 overflow-hidden p-5",
          isPremium
            ? "to-h_blackLight/30 border-amber-500/25 bg-linear-to-b from-amber-500/8"
            : "from-h_red/10 border-h_red/20 bg-linear-to-b to-transparent",
        )}
      >
        {isPremium && (
          <div className="mb-1 flex items-center gap-2">
            <Rocket className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
              Priority Booking
            </span>
          </div>
        )}

        <h3 className="mb-1 text-sm font-semibold text-white">
          Book {stageName}
        </h3>

        {isPremium && (
          <div className="mb-4 flex items-center gap-2">
            <div className="size-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">
              Responding within 2 hours
            </span>
          </div>
        )}

        {!isPremium && (
          <p className="mb-4 text-xs text-gray-400">
            For clubs, festivals, events &amp; more
          </p>
        )}

        <Button
          className="bg-h_red hover:bg-h_redDark w-full font-semibold text-white"
          onClick={handlePrimaryClick}
        >
          <CalendarCheck2 className="mr-1.5 h-3.5 w-3.5" />
          Book / Hire DJ
        </Button>

        {isPremium && isDesktop && (
          <div className="mt-3 flex justify-between border-t border-white/5 pt-3">
            <div className="text-center">
              <p className="text-sm font-bold text-white">{responseRate}%</p>
              <p className="text-[11px] text-gray-500">Response Rate</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white">
                {bookingSuccessRate}%
              </p>
              <p className="text-[11px] text-gray-500">Booking Rate</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white">&lt;2h</p>
              <p className="text-[11px] text-gray-500">Reply Time</p>
            </div>
          </div>
        )}
      </Card>

      <Dialog
        open={modal !== "none"}
        onOpenChange={(open) => {
          if (!open) setModal("none");
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {modal === "auth" && (
            <>
              <DialogHeader>
                <DialogTitle>Sign in to continue</DialogTitle>
                <DialogDescription>
                  You need a DJcovery account to send booking requests. Sign in
                  or create a free organizer account in seconds.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setModal("none")}
                >
                  Cancel
                </Button>
                <Button className="w-full" asChild>
                  <Link
                    href={`/sign-in?returnTo=${encodeURIComponent(window.location.pathname)}`}
                  >
                    Sign In
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}

          {modal === "upgrade" && (
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
                  className="w-full"
                  onClick={() => setModal("none")}
                >
                  Maybe later
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/become-organizer">Become an Organizer</Link>
                </Button>
              </DialogFooter>
            </>
          )}

          {modal === "demo" && (
            <>
              <DialogHeader>
                <DialogTitle>Booking is disabled in demo mode</DialogTitle>
                <DialogDescription>
                  This is a preview profile. Sign in to a real DJ profile to
                  send a booking request.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setModal("none")}>Got it</Button>
              </DialogFooter>
            </>
          )}

          {modal === "booking" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Booking details</DialogTitle>
                <DialogDescription>
                  Provide key details so {stageName} can evaluate your event
                  quickly. Contact info stays hidden until the DJ accepts.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="eventName">Event name</Label>
                  <Input
                    id="eventName"
                    value={form.eventName}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        eventName: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="eventDate">Event date</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={form.eventDate}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        eventDate: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    placeholder="Club, festival, venue name"
                    value={form.venue}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        venue: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, city: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="crowdSize">Expected crowd</Label>
                  <Input
                    id="crowdSize"
                    type="number"
                    min={1}
                    placeholder="300"
                    value={form.crowdSize}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        crowdSize: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="budgetMin">Budget min (SEK)</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    min={0}
                    value={form.budgetMin}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        budgetMin: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="budgetMax">Budget max (SEK)</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    min={0}
                    value={form.budgetMax}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        budgetMax: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={5}
                  placeholder="Share the vibe, schedule, and any technical requirements."
                  value={form.message}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      message: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <DialogFooter className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setModal("none")}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send request"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}

          {modal === "booking" && isDemoProfile && (
            <div className="flex items-center justify-center gap-3 rounded-lg border border-dashed border-white/10 bg-white/5 p-6 text-sm text-gray-300">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
              This booking flow is disabled for demo profiles.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
