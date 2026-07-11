import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { Button } from "@/components/ui/button";
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

  const now = new Date();

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

  const upcoming = eventItems.filter(
    (e) =>
      e.status === "PUBLISHED" &&
      new Date(e.startDate).getTime() >= now.getTime(),
  );
  const past = eventItems.filter(
    (e) =>
      e.status === "COMPLETED" ||
      e.status === "CANCELLED" ||
      e.status === "ARCHIVED" ||
      (e.status === "PUBLISHED" &&
        new Date(e.startDate).getTime() < now.getTime()),
  );
  const drafts = eventItems.filter((e) => e.status === "DRAFT");

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
