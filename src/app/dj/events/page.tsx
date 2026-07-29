import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, AlertCircle, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DjEventsTabs from "@/components/dj/DjEventsTabs";

export const metadata = { title: "My Events — DJcovery" };

export default async function DjEventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const djProfile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, slug: true, stageName: true },
  });
  if (!djProfile) redirect("/become-dj");

  const events = await prisma.event.findMany({
    where: {
      deletedAt: null,
      OR: [
        { ownerDjId: djProfile.id },
        { participants: { some: { djProfileId: djProfile.id } } },
      ],
    },
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      eventType: true,
      category: true,
      status: true,
      startDate: true,
      endDate: true,
      venue: true,
      posterUrl: true,
      featured: true,
      viewCount: true,
      city: { select: { name: true } },
      country: { select: { name: true } },
      ownerDj: { select: { id: true, slug: true, stageName: true } },
      participants: {
        select: {
          role: true,
          djProfile: { select: { id: true, stageName: true, slug: true } },
        },
      },
      _count: { select: { savedBy: true, gallery: true } },
    },
  });

  // Fetch pending moderation requests for DJ's owned events
  const pendingModerations = await prisma.eventModeration.findMany({
    where: {
      status: "PENDING",
      event: {
        ownerDjId: djProfile.id,
        deletedAt: null,
      },
    },
    include: {
      event: {
        select: {
          id: true,
          slug: true,
          title: true,
        },
      },
      admin: {
        select: {
          name: true,
          username: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const eventItems = events.map((event) => {
    const isOwner = event.ownerDj.id === djProfile.id;
    const participant = event.participants.find(
      (p) => p.djProfile.id === djProfile.id,
    );
    const role = isOwner ? "Owner" : (participant?.role ?? "Performer");

    return {
      id: event.id,
      slug: event.slug,
      title: event.title,
      eventType: event.eventType,
      category: event.category,
      status: event.status,
      startDate: event.startDate,
      endDate: event.endDate,
      venue: event.venue,
      posterUrl: event.posterUrl,
      featured: event.featured,
      viewCount: event.viewCount,
      location: [event.city?.name, event.country?.name]
        .filter(Boolean)
        .join(", "),
      ownerStageName: event.ownerDj.stageName,
      ownerSlug: event.ownerDj.slug,
      role,
      savedCount: event._count.savedBy,
      galleryCount: event._count.gallery,
      isOwner,
    };
  });

  const emptyState = eventItems.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">My Events</h1>
          <p className="text-sm text-gray-400">
            Manage your own events and performances you are listed on.
          </p>
        </div>
        <Button asChild className="mt-2 sm:mt-0">
          <Link href="/dj/events/new">
            <Plus className="mr-1 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Pending Moderation Requests */}
      {pendingModerations.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">
              Pending Edit Requests ({pendingModerations.length})
            </h2>
          </div>
          <div className="space-y-4">
            {pendingModerations.map((moderation) => (
              <div
                key={moderation.id}
                className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">
                        PENDING
                      </Badge>
                      <Link
                        href={`/events/${moderation.event.slug}/edit`}
                        className="font-medium text-white hover:underline"
                      >
                        {moderation.event.title}
                      </Link>
                    </div>
                    <p className="mb-2 text-sm text-gray-300">
                      {moderation.adminComment}
                    </p>
                    <p className="text-xs text-gray-500">
                      Requested by{" "}
                      {moderation.admin.name || moderation.admin.username}
                    </p>
                  </div>
                  <Button asChild size="sm" className="shrink-0">
                    <Link href={`/events/${moderation.event.slug}/edit`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Edit Event
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {emptyState ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-24 text-center">
          <h2 className="text-lg font-semibold text-white">No events yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Create your first event or get added as a performer by another DJ.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/dj/events/new">Create Event</Link>
          </Button>
        </div>
      ) : (
        <DjEventsTabs events={eventItems} djSlug={djProfile.slug} />
      )}
    </div>
  );
}
