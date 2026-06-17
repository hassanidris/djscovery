import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Plus, Music2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { Button } from "@/components/ui/button";
import { EventActions } from "@/components/events/EventActions";

export const metadata = { title: "My Events — DJscovery" };

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-zinc-800 text-zinc-400",
  PUBLISHED: "bg-emerald-950 text-emerald-400",
  CANCELLED: "bg-red-950 text-red-400",
  COMPLETED: "bg-blue-950 text-blue-400",
  ARCHIVED: "bg-zinc-800 text-zinc-500",
};

const CATEGORY_LABELS: Record<string, string> = {
  CLUB_NIGHT: "Club Night",
  FESTIVAL: "Festival",
  WEDDING: "Wedding",
  BIRTHDAY: "Birthday",
  CORPORATE: "Corporate",
  BEACH_PARTY: "Beach Party",
  LOUNGE: "Lounge",
  RESTAURANT_SET: "Restaurant Set",
  PRIVATE_PARTY: "Private Party",
  OPEN_AIR: "Open Air",
  LUXURY_EVENT: "Luxury Event",
  OTHER: "Other",
};

// ── Tab config ────────────────────────────────────────────────────────────────

type Tab = "all" | "upcoming" | "past" | "draft";
const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "draft", label: "Drafts" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function MyEventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const djProfile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true, deletedAt: true },
  });
  if (
    !djProfile ||
    djProfile.status !== "APPROVED" ||
    djProfile.deletedAt !== null
  )
    redirect("/become-dj");

  const sp = await searchParams;
  const activeTab: Tab =
    sp.tab === "upcoming" || sp.tab === "past" || sp.tab === "draft"
      ? sp.tab
      : "all";

  const now = new Date();

  const whereClause = {
    ownerDjId: djProfile.id,
    deletedAt: null,
    ...(activeTab === "upcoming" && {
      status: "PUBLISHED" as const,
      startDate: { gte: now },
    }),
    ...(activeTab === "past" && {
      OR: [
        { status: "COMPLETED" as const },
        { status: "CANCELLED" as const },
        { startDate: { lt: now }, status: "PUBLISHED" as const },
      ],
    }),
    ...(activeTab === "draft" && { status: "DRAFT" as const }),
  };

  const events = await prisma.event.findMany({
    where: whereClause,
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      eventType: true,
      category: true,
      startDate: true,
      status: true,
      posterUrl: true,
      city: { select: { name: true } },
      country: { select: { name: true } },
    },
  });

  // Tab counts (always based on all events)
  const allEvents = await prisma.event.findMany({
    where: { ownerDjId: djProfile.id, deletedAt: null },
    select: { status: true, startDate: true },
  });

  const counts = {
    all: allEvents.length,
    upcoming: allEvents.filter(
      (e) => e.status === "PUBLISHED" && e.startDate >= now,
    ).length,
    past: allEvents.filter(
      (e) =>
        e.status === "COMPLETED" ||
        e.status === "CANCELLED" ||
        (e.startDate < now && e.status === "PUBLISHED"),
    ).length,
    draft: allEvents.filter((e) => e.status === "DRAFT").length,
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Events</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {counts.all === 0
                ? "No events yet."
                : `${counts.all} event${counts.all !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <Button asChild className="bg-white text-black hover:bg-zinc-200">
            <Link href="/dashboard/dj/events/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-zinc-800 pb-0">
          {TABS.map((tab) => (
            <Link
              key={tab.value}
              href={tab.value === "all" ? "?" : `?tab=${tab.value}`}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? "border-white text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  activeTab === tab.value
                    ? "bg-white text-black"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {counts[tab.value]}
              </span>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-24 text-center">
            <Music2 className="mb-4 h-10 w-10 text-zinc-700" />
            <p className="font-semibold text-white">
              {activeTab === "draft"
                ? "No drafts"
                : activeTab === "upcoming"
                  ? "No upcoming events"
                  : activeTab === "past"
                    ? "No past events"
                    : "No events yet"}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {activeTab === "all"
                ? "Create your first event to get started."
                : "Switch tabs or create a new event."}
            </p>
            {activeTab === "all" && (
              <Button
                asChild
                className="mt-6 bg-white text-black hover:bg-zinc-200"
              >
                <Link href="/dashboard/dj/events/new">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create Event
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* Event list */}
        {events.length > 0 && (
          <div className="space-y-2">
            {events.map((event) => {
              const location = [event.city?.name, event.country?.name]
                .filter(Boolean)
                .join(", ");

              return (
                <div
                  key={event.id}
                  className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 transition-colors hover:border-zinc-700"
                >
                  {/* Poster thumbnail */}
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                    {event.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.posterUrl}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-700 to-zinc-900">
                        <Music2 className="h-5 w-5 text-zinc-500" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-white">
                        {event.title}
                      </p>
                      {event.eventType === "PRIVATE" && (
                        <span className="rounded border border-zinc-700 px-1 py-0.5 text-xs text-zinc-500">
                          Private
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {event.startDate.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {location && <span>{location}</span>}
                      {event.category && (
                        <span>
                          {CATEGORY_LABELS[event.category] ?? event.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium sm:block ${STATUS_STYLES[event.status] ?? STATUS_STYLES.DRAFT}`}
                  >
                    {event.status.charAt(0) +
                      event.status.slice(1).toLowerCase()}
                  </span>

                  {/* Actions */}
                  <EventActions eventId={event.id} status={event.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
