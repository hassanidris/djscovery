import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import {
  getAdminHires,
  markHireCompleted,
  markHireNoShow,
  cancelHire,
} from "@/lib/actions/admin/hires";
import AdminActionButton from "@/components/admin/AdminActionButton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminFilters from "@/components/admin/AdminFilters";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import { format } from "date-fns";
import { Briefcase, DollarSign, Calendar, Clock } from "lucide-react";

export const metadata: Metadata = { title: "Hires" };

const VALID_STATUSES = [
  "ACTIVE",
  "COMPLETED",
  "CANCELLED_BY_DJ",
  "CANCELLED_BY_ORGANIZER",
  "CANCELLED_BY_ADMIN",
  "NO_SHOW",
] as const;

type HireStatus = (typeof VALID_STATUSES)[number];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  COMPLETED: "border-green-500/30 bg-green-500/10 text-green-400",
  CANCELLED_BY_DJ: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  CANCELLED_BY_ORGANIZER: "border-red-500/30 bg-red-500/10 text-red-400",
  CANCELLED_BY_ADMIN: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  NO_SHOW: "border-red-500/30 bg-red-500/10 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED_BY_DJ: "Cancelled by DJ",
  CANCELLED_BY_ORGANIZER: "Cancelled by Organizer",
  CANCELLED_BY_ADMIN: "Cancelled by Admin",
  NO_SHOW: "No Show",
};

export default async function AdminHiresPage({
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
  const rawStatus = first(params.status);
  const status: HireStatus | undefined = VALID_STATUSES.includes(
    rawStatus as HireStatus,
  )
    ? (rawStatus as HireStatus)
    : undefined;
  const country = first(params.country);

  const { hires, nextCursor, totalRevenue } = await getAdminHires({
    cursor,
    status,
    country,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Hires</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage gig applications that became actual hires.
        </p>
      </div>

      <AdminFilters
        currentValues={{ status: status ?? "", country: country ?? "" }}
        filters={[
          {
            key: "status",
            placeholder: "All Statuses",
            options: [
              { value: "ACTIVE", label: "Active" },
              { value: "COMPLETED", label: "Completed" },
              { value: "CANCELLED_BY_DJ", label: "Cancelled by DJ" },
              {
                value: "CANCELLED_BY_ORGANIZER",
                label: "Cancelled by Organizer",
              },
              {
                value: "CANCELLED_BY_ADMIN",
                label: "Cancelled by Admin",
              },
              { value: "NO_SHOW", label: "No Show" },
            ],
          },
          {
            key: "country",
            placeholder: "All Countries",
            options: [],
          },
        ]}
      />

      {totalRevenue > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <DollarSign className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="text-xs font-medium text-emerald-400">
              Total Revenue
            </p>
            <p className="text-lg font-bold text-white">
              $
              {typeof totalRevenue === "number"
                ? totalRevenue.toFixed(2)
                : Number(totalRevenue).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <Suspense
        fallback={
          <AdminTableSkeleton cols={8} rows={8} includeHeader={false} />
        }
      >
        {hires.length === 0 ? (
          <AdminEmptyState
            title="No hires found"
            description="Try adjusting your filters or check back later."
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-white/8">
              <div className="overflow-x-auto">
                <table className="w-full min-w-180 text-sm">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/2">
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        DJ
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Gig
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Organizer
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Rate
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Event Date
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Created
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {hires.map((hire) => (
                      <tr
                        key={hire.id}
                        className="transition-colors hover:bg-white/2"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/djs/${hire.application.djProfile.slug}`}
                            className="font-medium text-white hover:underline"
                            target="_blank"
                          >
                            {hire.application.djProfile.stageName}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <Link
                              href={`/gigs/${hire.application.gig.slug}`}
                              className="font-medium text-white hover:underline"
                              target="_blank"
                            >
                              {hire.application.gig.title}
                            </Link>
                            <p className="text-muted-foreground text-xs">
                              {hire.application.gig.venueName || "TBD"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/organizers/${hire.application.gig.organizerProfile.slug}`}
                            className="text-xs text-gray-300 hover:text-white hover:underline"
                            target="_blank"
                          >
                            {hire.application.gig.organizerProfile.displayName}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          {hire.agreedRate ? (
                            <span className="flex items-center gap-1 text-xs text-gray-300">
                              <DollarSign className="h-3 w-3" />
                              {typeof hire.agreedRate === "number"
                                ? hire.agreedRate.toFixed(2)
                                : Number(hire.agreedRate).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Not set
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={`border text-xs ${STATUS_COLORS[hire.status] ?? ""}`}
                          >
                            {STATUS_LABELS[hire.status] ?? hire.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-xs text-gray-300">
                            <Calendar className="h-3 w-3" />
                            {format(
                              new Date(hire.application.gig.eventDate),
                              "dd MMM yyyy",
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-xs text-gray-300">
                            <Clock className="h-3 w-3" />
                            {format(new Date(hire.createdAt), "dd MMM yyyy")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {hire.status === "ACTIVE" && (
                              <>
                                <AdminActionButton
                                  label="Complete"
                                  description="Mark this hire as completed?"
                                  confirmLabel="Mark Complete"
                                  fields={{ hireId: String(hire.id) }}
                                  action={markHireCompleted}
                                  successMessage="Hire marked as completed"
                                  requireConfirm={false}
                                />
                                <AdminActionButton
                                  label="No Show"
                                  description="Mark this hire as no-show?"
                                  confirmLabel="Mark No Show"
                                  fields={{ hireId: String(hire.id) }}
                                  action={markHireNoShow}
                                  successMessage="Hire marked as no-show"
                                  variant="outline"
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                />
                                <AdminActionButton
                                  label="Cancel"
                                  description="Cancel this hire?"
                                  confirmLabel="Cancel Hire"
                                  fields={{ hireId: String(hire.id) }}
                                  action={cancelHire}
                                  successMessage="Hire cancelled"
                                  variant="outline"
                                  className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                                />
                              </>
                            )}
                            <Link
                              href={`/admin/hires/${hire.id}`}
                              className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10"
                            >
                              View
                            </Link>
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
