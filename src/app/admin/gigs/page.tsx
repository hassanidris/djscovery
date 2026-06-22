import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  getAdminGigs,
  hideGig,
  unhideGig,
  closeGig,
} from "@/lib/actions/admin/gigs";
import AdminActionButton from "@/components/admin/AdminActionButton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminFilters from "@/components/admin/AdminFilters";
import { formatDistanceToNow, format } from "date-fns";
import { EyeOff, Users } from "lucide-react";

export const metadata: Metadata = { title: "Gigs" };

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "border-green-500/30 bg-green-500/10 text-green-400",
  DRAFT: "border-gray-500/30 bg-gray-500/10 text-gray-400",
  UNDER_REVIEW: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  FILLED: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  CANCELLED: "border-red-500/30 bg-red-500/10 text-red-400",
  EXPIRED: "border-gray-500/30 bg-gray-500/10 text-gray-400",
};

export default async function AdminGigsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const cursor = params.cursor ? Number(params.cursor) : undefined;
  const status = params.status;
  const type = params.type;
  const country = params.country;

  const { gigs, nextCursor } = await getAdminGigs({
    cursor,
    status,
    type,
    country,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Gigs</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Moderate gig listings across the platform.
        </p>
      </div>

      <AdminFilters
        currentValues={{ status: status ?? "", type: type ?? "" }}
        filters={[
          {
            key: "status",
            placeholder: "All Statuses",
            options: [
              { value: "PUBLISHED", label: "Published" },
              { value: "DRAFT", label: "Draft" },
              { value: "UNDER_REVIEW", label: "Under Review" },
              { value: "FILLED", label: "Filled" },
              { value: "CANCELLED", label: "Cancelled" },
              { value: "EXPIRED", label: "Expired" },
            ],
          },
          {
            key: "type",
            placeholder: "All Types",
            options: [
              { value: "CLUB", label: "Club" },
              { value: "FESTIVAL", label: "Festival" },
              { value: "WEDDING", label: "Wedding" },
              { value: "CORPORATE_EVENT", label: "Corporate" },
              { value: "PRIVATE_PARTY", label: "Private Party" },
              { value: "BIRTHDAY_PARTY", label: "Birthday" },
              { value: "LOUNGE", label: "Lounge" },
              { value: "RESTAURANT", label: "Restaurant" },
              { value: "HOTEL", label: "Hotel" },
              { value: "BAR", label: "Bar" },
              { value: "OTHER", label: "Other" },
            ],
          },
        ]}
      />

      {gigs.length === 0 ? (
        <AdminEmptyState
          title="No gigs found"
          description="Try adjusting your filters."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-white/8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-white/2">
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Gig
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Organizer
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Event Date
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Applicants
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
                  {gigs.map((gig) => (
                    <tr
                      key={gig.id}
                      className="transition-colors hover:bg-white/2"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {gig.hidden && (
                            <EyeOff className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                          )}
                          <div>
                            <Link
                              href={`/gigs/${gig.slug}`}
                              className="font-medium text-white hover:underline"
                              target="_blank"
                            >
                              {gig.title}
                            </Link>
                            <p className="text-muted-foreground text-xs">
                              {gig.gigType.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/organizers/${gig.organizerProfile.slug}`}
                          className="text-xs text-gray-300 hover:text-white hover:underline"
                          target="_blank"
                        >
                          {gig.organizerProfile.displayName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300">
                        {[gig.city?.name, gig.country?.name]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300">
                        {format(new Date(gig.eventDate), "dd MMM yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs text-gray-300">
                          <Users className="h-3 w-3" />
                          {gig._count.applications}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`border text-xs ${STATUS_COLORS[gig.status] ?? ""}`}
                        >
                          {gig.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {gig.hidden ? (
                            <AdminActionButton
                              label="Unhide"
                              description={`Make "${gig.title}" visible again?`}
                              confirmLabel="Unhide"
                              fields={{ gigId: String(gig.id) }}
                              action={unhideGig}
                              successMessage="Gig is now visible"
                              requireConfirm={false}
                            />
                          ) : (
                            <AdminActionButton
                              label="Hide"
                              description={`Hide "${gig.title}" from public listings?`}
                              confirmLabel="Hide"
                              fields={{ gigId: String(gig.id) }}
                              action={hideGig}
                              successMessage="Gig hidden"
                            />
                          )}
                          {gig.status !== "CANCELLED" && (
                            <AdminActionButton
                              label="Close"
                              description={`Close "${gig.title}"? Status will be set to Cancelled.`}
                              confirmLabel="Close Gig"
                              fields={{ gigId: String(gig.id) }}
                              action={closeGig}
                              successMessage="Gig closed"
                              variant="outline"
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
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
      )}
    </div>
  );
}
