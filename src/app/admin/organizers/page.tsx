import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import {
  getAdminOrganizers,
  hideOrganizerProfile,
  unhideOrganizerProfile,
  suspendOrganizer,
} from "@/lib/actions/admin/organizers";
import AdminActionButton from "@/components/admin/AdminActionButton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminFilters from "@/components/admin/AdminFilters";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import { formatDistanceToNow } from "date-fns";
import { EyeOff } from "lucide-react";

export const metadata: Metadata = { title: "Organizers" };

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "border-green-500/30 bg-green-500/10 text-green-400",
  SUSPENDED: "border-red-500/30 bg-red-500/10 text-red-400",
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

export default async function AdminOrganizersPage({
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
  const type = first(params.type);
  const country = first(params.country);

  const { organizers, nextCursor } = await getAdminOrganizers({
    cursor,
    status,
    type,
    country,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Organizers</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage organizer profiles and visibility.
        </p>
      </div>

      <AdminFilters
        currentValues={{ status: status ?? "", type: type ?? "" }}
        filters={[
          {
            key: "status",
            placeholder: "All Statuses",
            options: [
              { value: "ACTIVE", label: "Active" },
              { value: "SUSPENDED", label: "Suspended" },
              { value: "PENDING", label: "Pending" },
            ],
          },
          {
            key: "type",
            placeholder: "All Types",
            options: [
              { value: "INDIVIDUAL", label: "Individual" },
              { value: "COMPANY", label: "Company" },
              { value: "VENUE", label: "Venue" },
              { value: "AGENCY", label: "Agency" },
              { value: "FESTIVAL", label: "Festival" },
            ],
          },
        ]}
      />

      <Suspense fallback={<AdminTableSkeleton cols={7} rows={8} />}>
        {organizers.length === 0 ? (
          <AdminEmptyState
            title="No organizers found"
            description="Try adjusting your filters."
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-white/8">
              <div className="overflow-x-auto">
                <table className="w-full min-w-160 text-sm">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/2">
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Organizer
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Gigs
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {organizers.map((org) => (
                      <tr
                        key={org.id}
                        className="transition-colors hover:bg-white/2"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {org.hidden && (
                              <EyeOff className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            )}
                            <div>
                              <Link
                                href={`/organizers/${org.slug}`}
                                className="font-medium text-white hover:underline"
                                target="_blank"
                              >
                                {org.displayName}
                              </Link>
                              <p className="text-muted-foreground text-xs">
                                @{org.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="border border-white/10 bg-white/5 text-xs text-gray-300">
                            {org.organizerType}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-300">
                          {[org.city?.name, org.country?.name]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-300">
                          {org._count.gigs}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={`border text-xs ${STATUS_COLORS[org.status] ?? ""}`}
                          >
                            {org.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {formatDistanceToNow(new Date(org.createdAt), {
                            addSuffix: true,
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {org.hidden ? (
                              <AdminActionButton
                                label="Unhide"
                                description={`Make ${org.displayName} visible again?`}
                                confirmLabel="Unhide"
                                fields={{ organizerProfileId: String(org.id) }}
                                action={unhideOrganizerProfile}
                                successMessage="Organizer profile visible"
                                requireConfirm={false}
                              />
                            ) : (
                              <AdminActionButton
                                label="Hide"
                                description={`Hide ${org.displayName} from public listings?`}
                                confirmLabel="Hide"
                                fields={{ organizerProfileId: String(org.id) }}
                                action={hideOrganizerProfile}
                                successMessage="Organizer profile hidden"
                              />
                            )}
                            {org.status !== "SUSPENDED" && (
                              <AdminActionButton
                                label="Suspend"
                                description={`Suspend ${org.displayName}? Their gigs will remain but the profile will be marked suspended.`}
                                confirmLabel="Suspend"
                                fields={{ organizerProfileId: String(org.id) }}
                                action={suspendOrganizer}
                                successMessage="Organizer suspended"
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
      </Suspense>
    </div>
  );
}
