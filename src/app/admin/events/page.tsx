import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import {
  getAdminEvents,
  hideEvent,
  unhideEvent,
} from "@/lib/actions/admin/events";
import AdminActionButton from "@/components/admin/AdminActionButton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminFilters from "@/components/admin/AdminFilters";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import { formatDistanceToNow, format } from "date-fns";
import { EyeOff, Eye, Users, Star } from "lucide-react";

export const metadata: Metadata = { title: "Events" };

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "border-green-500/30 bg-green-500/10 text-green-400",
  DRAFT: "border-gray-500/30 bg-gray-500/10 text-gray-400",
  COMPLETED: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  CANCELLED: "border-red-500/30 bg-red-500/10 text-red-400",
  ARCHIVED: "border-gray-500/30 bg-gray-500/10 text-gray-400",
};

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const rawCursor = first(params.cursor);
  const cursor =
    rawCursor && Number.isFinite(Number(rawCursor))
      ? Number(rawCursor)
      : undefined;
  const status = first(params.status);
  const category = first(params.category);
  const country = first(params.country);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Events</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Moderate DJ-created events across the platform.
        </p>
      </div>

      <AdminFilters
        currentValues={{ status: status ?? "", category: category ?? "" }}
        filters={[
          {
            key: "status",
            placeholder: "All Statuses",
            options: [
              { value: "PUBLISHED", label: "Published" },
              { value: "DRAFT", label: "Draft" },
              { value: "COMPLETED", label: "Completed" },
              { value: "CANCELLED", label: "Cancelled" },
              { value: "ARCHIVED", label: "Archived" },
            ],
          },
          {
            key: "category",
            placeholder: "All Categories",
            options: [
              { value: "CLUB", label: "Club" },
              { value: "FESTIVAL", label: "Festival" },
              { value: "WEDDING", label: "Wedding" },
              { value: "CORPORATE", label: "Corporate" },
              { value: "PRIVATE_PARTY", label: "Private Party" },
              { value: "BIRTHDAY", label: "Birthday" },
              { value: "CONCERT", label: "Concert" },
              { value: "OTHER", label: "Other" },
            ],
          },
        ]}
      />

      <Suspense fallback={<AdminTableSkeleton cols={8} rows={8} />}>
        <EventsTable
          cursor={cursor}
          status={status}
          category={category}
          country={country}
        />
      </Suspense>
    </div>
  );
}

async function EventsTable({
  cursor,
  status,
  category,
  country,
}: {
  cursor?: number;
  status?: string;
  category?: string;
  country?: string;
}) {
  const { events, nextCursor } = await getAdminEvents({
    cursor,
    status,
    category,
    country,
  });

  if (events.length === 0) {
    if (cursor) {
      return (
        <>
          <AdminEmptyState
            title="No events found"
            description="Try adjusting your filters."
          />
          <AdminPagination nextCursor={null} hasPrev={true} />
        </>
      );
    }
    return (
      <AdminEmptyState
        title="No events found"
        description="Try adjusting your filters."
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-white/8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/2">
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  Event
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  Owner DJ
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  Location
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  Participants
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  Reviews
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="transition-colors hover:bg-white/2"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {event.featured && (
                        <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                      )}
                      {event.hidden && (
                        <EyeOff className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      )}
                      <div>
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="font-medium text-white hover:underline"
                        >
                          {event.title}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                          {event.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/djs/${event.ownerDj.slug}`}
                      className="text-xs text-gray-300 hover:text-white hover:underline"
                      target="_blank"
                    >
                      {event.ownerDj.stageName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-300">
                    {[event.city?.name, event.country?.name]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-300">
                    {format(new Date(event.startDate), "dd MMM yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-gray-300">
                      <Users className="h-3 w-3" />
                      {event._count.participants}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-300">
                    {event._count.eventReviews}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={`border text-xs ${STATUS_COLORS[event.status] ?? ""}`}
                    >
                      {event.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {event.hidden ? (
                        <AdminActionButton
                          label="Unhide"
                          description={`Make "${event.title}" visible again?`}
                          confirmLabel="Unhide"
                          fields={{ eventId: String(event.id) }}
                          action={unhideEvent}
                          successMessage="Event is now visible"
                          requireConfirm={false}
                        />
                      ) : (
                        <AdminActionButton
                          label="Hide"
                          description={`Hide "${event.title}" from public listings?`}
                          confirmLabel="Hide"
                          fields={{ eventId: String(event.id) }}
                          action={hideEvent}
                          successMessage="Event hidden"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AdminPagination
        nextCursor={nextCursor ? String(nextCursor) : null}
        hasPrev={!!cursor}
      />
    </>
  );
}
