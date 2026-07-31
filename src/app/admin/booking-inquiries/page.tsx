import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import {
  getAdminBookingInquiries,
} from "@/lib/actions/admin/booking-inquiries";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminFilters from "@/components/admin/AdminFilters";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import { formatDistanceToNow, format } from "date-fns";
import { MessageSquare, MapPin, DollarSign } from "lucide-react";

export const metadata: Metadata = { title: "Booking Inquiries" };

const STATUS_COLORS: Record<string, string> = {
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  ACCEPTED: "border-green-500/30 bg-green-500/10 text-green-400",
  DECLINED: "border-red-500/30 bg-red-500/10 text-red-400",
  CANCELLED: "border-gray-500/30 bg-gray-500/10 text-gray-400",
};

export default async function AdminBookingInquiriesPage({
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
  const country = first(params.country);
  const dateRange = first(params.dateRange) as "7d" | "30d" | "90d" | undefined;

  const { inquiries, nextCursor } = await getAdminBookingInquiries({
    cursor,
    status,
    country,
    dateRange,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Booking Inquiries</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review and moderate booking inquiries between DJs and organizers.
        </p>
      </div>

      <AdminFilters
        currentValues={{ status: status ?? "", country: country ?? "", dateRange: dateRange ?? "" }}
        filters={[
          {
            key: "status",
            placeholder: "All Statuses",
            options: [
              { value: "PENDING", label: "Pending" },
              { value: "ACCEPTED", label: "Accepted" },
              { value: "DECLINED", label: "Declined" },
              { value: "CANCELLED", label: "Cancelled" },
            ],
          },
          {
            key: "dateRange",
            placeholder: "All Time",
            options: [
              { value: "7d", label: "Last 7 days" },
              { value: "30d", label: "Last 30 days" },
              { value: "90d", label: "Last 90 days" },
            ],
          },
        ]}
      />

      <Suspense fallback={<AdminTableSkeleton cols={9} rows={8} />}>
        {inquiries.length === 0 ? (
          <AdminEmptyState
            title="No booking inquiries found"
            description="Try adjusting your filters."
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-white/8">
              <div className="overflow-x-auto">
                <table className="w-full min-w-180 text-sm">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/2">
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Event
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        DJ
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
                        Budget
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Messages
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {inquiries.map((inquiry) => (
                      <tr
                        key={inquiry.id}
                        className="transition-colors hover:bg-white/2"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <Link
                              href={`/admin/booking-inquiries/${inquiry.id}`}
                              className="font-medium text-white hover:underline"
                            >
                              {inquiry.eventName}
                            </Link>
                            {inquiry.venue && (
                              <p className="text-muted-foreground text-xs mt-0.5">
                                {inquiry.venue}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/djs/${inquiry.djProfile.slug}`}
                            className="text-xs text-gray-300 hover:text-white hover:underline"
                            target="_blank"
                          >
                            {inquiry.djProfile.stageName}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/organizers/${inquiry.organizer.username}`}
                            className="text-xs text-gray-300 hover:text-white hover:underline"
                            target="_blank"
                          >
                            {inquiry.organizer.name || inquiry.organizer.username}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-300">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {[inquiry.city?.name, inquiry.country?.name]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-300">
                          {inquiry.eventDate ? (
                            format(new Date(inquiry.eventDate), "dd MMM yyyy")
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-300">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {inquiry.budgetType === "NEGOTIABLE" ? (
                              "Negotiable"
                            ) : inquiry.budgetType === "TBA" ? (
                              "TBA"
                            ) : inquiry.budgetMin && inquiry.budgetMax ? (
                              `${inquiry.budgetCurrency || "$"}${inquiry.budgetMin.toLocaleString()} - ${inquiry.budgetMax.toLocaleString()}`
                            ) : inquiry.budgetMin ? (
                              `${inquiry.budgetCurrency || "$"}${inquiry.budgetMin.toLocaleString()}+`
                            ) : (
                              "—"
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={`border text-xs ${STATUS_COLORS[inquiry.status] ?? ""}`}
                          >
                            {inquiry.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-xs text-gray-300">
                            <MessageSquare className="h-3 w-3" />
                            {inquiry._count.messages}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/admin/booking-inquiries/${inquiry.id}`}
                              className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
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
