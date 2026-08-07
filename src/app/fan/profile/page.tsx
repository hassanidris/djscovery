import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import {
  Settings,
  Users,
  CalendarHeart,
  Star,
  Clock,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAttendedEventsWithPendingReviews } from "@/lib/queries/events";

export const metadata = { title: "My Profile" };

type EventCompletedNotificationData = {
  eventId?: number;
  eventSlug?: string;
  eventTitle?: string;
  djCount?: number;
};

export default async function FanProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const fanProfile = await prisma.fanProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!fanProfile) redirect("/become-fan");

  const [
    followedDjsCount,
    savedEventsCount,
    pendingEventReviews,
    eventNotifications,
  ] = await Promise.all([
    prisma.djFollow.count({ where: { userId: user.id } }),
    prisma.savedEvent.count({ where: { userId: user.id } }),
    getAttendedEventsWithPendingReviews(user.id),
    prisma.notification.findMany({
      where: {
        recipientId: user.id,
        type: "EVENT_COMPLETED",
        read: false,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, data: true, createdAt: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Overview</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/fan/settings">
            <Settings className="h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Followed DJs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{followedDjsCount}</p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Saved Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{savedEventsCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* EVENT_COMPLETED notification reminders */}
      {eventNotifications.length > 0 && (
        <section className="space-y-3">
          {eventNotifications.map((n) => {
            const data = (n.data ?? {}) as EventCompletedNotificationData;
            return (
              <Card key={n.id} className="border-blue-500/20 bg-blue-500/5">
                <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
                      <Bell className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {data.eventTitle ?? "Event completed"}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {data.djCount ?? 0} DJ{data.djCount === 1 ? "" : "s"} is
                        waiting for your review
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-1 justify-end">
                    <Button
                      size="sm"
                      className="bg-blue-500 text-white hover:bg-blue-600"
                      asChild
                    >
                      <Link href={`/events/${data.eventSlug ?? ""}`}>
                        <Star className="mr-1.5 h-3.5 w-3.5" />
                        Leave Review
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      {/* Events to review */}
      {pendingEventReviews.length > 0 && (
        <section>
          <h2 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
            Events You Attended — Leave a Review
          </h2>
          <div className="grid gap-4">
            {pendingEventReviews.map((event) => (
              <Card key={event.eventId} className="border-white/8 bg-white/3">
                <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-10 overflow-hidden rounded-md bg-white/5">
                      {event.posterUrl ? (
                        <Image
                          src={event.posterUrl}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-gray-400">
                          {event.title.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(event.startDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {event.cityName && ` • ${event.cityName}`}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {event.pendingDjs
                          .map((dj) => `DJ. ${dj.stageName}`)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-4 sm:justify-end">
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-amber-400">
                        <Clock className="h-3.5 w-3.5" />
                        {event.daysRemaining} days left
                      </div>
                      <p className="text-xs text-zinc-400">
                        {event.reviewedCount} of {event.totalDjCount} reviewed
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-h_red hover:bg-h_redDark text-white"
                      asChild
                    >
                      <Link href={`/events/${event.slug}`}>
                        <Star className="mr-1.5 h-3.5 w-3.5" />
                        Leave Review
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Separator />

      {/* Quick links */}
      <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
        Quick Links
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="hover:border-h_red/40 hover:bg-h_red/5 transition-colors">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="bg-h_red/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <Users className="text-h_redLight h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Browse DJs</p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Discover and follow DJs you love
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/directory">Go →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-foreground/20 transition-colors">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <CalendarHeart className="text-muted-foreground h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Browse Events</p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Find upcoming events near you
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/events">Go →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
