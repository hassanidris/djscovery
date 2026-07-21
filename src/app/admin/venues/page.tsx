import type { Metadata } from "next";
import { getAdminVenues, deleteVenue } from "@/lib/actions/admin/venues";
import { getCountries } from "@/lib/actions/locations";
import AdminActionButton from "@/components/admin/AdminActionButton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminFilters from "@/components/admin/AdminFilters";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Trash2 } from "lucide-react";

export const metadata: Metadata = { title: "Venues" };

export default async function AdminVenuesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const cursorRaw = Number(params.cursor);
  const cursor =
    params.cursor && Number.isInteger(cursorRaw) ? cursorRaw : undefined;
  const country = params.country;

  const { venues, nextCursor } = await getAdminVenues({
    cursor,
    country,
  });

  const countries = await getCountries();
  const countryFilter = {
    key: "country",
    placeholder: "All Countries",
    options: countries.map((c) => ({ value: c.name, label: c.name })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Venues</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage venues added by DJs to their profiles.
        </p>
      </div>

      <AdminFilters
        currentValues={{ country: country ?? "" }}
        filters={[countryFilter]}
      />

      {venues.length === 0 ? (
        <AdminEmptyState
          title="No venues found"
          description="Try adjusting your filters or add venues via the DJ profile editor."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-white/8">
            <div className="overflow-x-auto">
              <table className="w-full min-w-160 text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-white/2">
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Venue
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      DJ
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Coordinates
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Event Date
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Added
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {venues.map((venue) => (
                    <tr
                      key={venue.id}
                      className="transition-colors hover:bg-white/2"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-white">
                            {venue.venueName}
                          </div>
                          {venue.description && (
                            <p className="text-muted-foreground line-clamp-1 text-xs">
                              {venue.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300">
                        {venue.djProfile ? (
                          <a
                            href={`/djs/${venue.djProfile.slug}`}
                            className="text-gray-300 hover:text-white"
                          >
                            Dj. {venue.djProfile.stageName}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300">
                        {[venue.city?.name, venue.country?.name]
                          .filter(Boolean)
                          .join(", ")}
                      </td>
                      <td className="px-4 py-3">
                        {venue.latitude && venue.longitude ? (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="h-3 w-3" />
                            {venue.latitude.toFixed(4)},{" "}
                            {venue.longitude.toFixed(4)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300">
                        {venue.eventDate || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {formatDistanceToNow(new Date(venue.createdAt), {
                          addSuffix: true,
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <AdminActionButton
                            label="Delete"
                            description={`Delete ${venue.venueName} from ${venue.djProfile?.stageName ?? "this DJ"}'s profile? This cannot be undone.`}
                            confirmLabel="Delete"
                            fields={{ venueId: String(venue.id) }}
                            action={deleteVenue}
                            successMessage="Venue deleted"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </AdminActionButton>
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
      )}
    </div>
  );
}
