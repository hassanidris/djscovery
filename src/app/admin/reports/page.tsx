import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import {
  getAdminReports,
  markReportUnderReview,
  resolveReport,
  dismissReport,
} from "@/lib/actions/admin/reports";
import AdminActionButton from "@/components/admin/AdminActionButton";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminFilters from "@/components/admin/AdminFilters";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = { title: "Reports" };

const STATUS_COLORS: Record<string, string> = {
  OPEN: "border-red-500/30 bg-red-500/10 text-red-400",
  UNDER_REVIEW: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  RESOLVED: "border-green-500/30 bg-green-500/10 text-green-400",
  DISMISSED: "border-gray-500/30 bg-gray-500/10 text-gray-400",
};

const REASON_LABELS: Record<string, string> = {
  FAKE_PROFILE: "Fake Profile",
  SPAM: "Spam",
  INAPPROPRIATE_CONTENT: "Inappropriate Content",
  SCAM: "Scam",
  HARASSMENT: "Harassment",
  WRONG_INFORMATION: "Wrong Info",
  OTHER: "Other",
};

const TARGET_LABELS: Record<string, string> = {
  DJ_PROFILE: "DJ Profile",
  ORGANIZER_PROFILE: "Organizer",
  GIG: "Gig",
  REVIEW: "Review",
  MEDIA: "Media",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const parsedCursor = params.cursor ? Number(params.cursor) : undefined;
  const cursor =
    parsedCursor !== undefined && Number.isFinite(parsedCursor)
      ? parsedCursor
      : undefined;
  const status = params.status;
  const targetType = params.targetType;

  const { reports, nextCursor } = await getAdminReports({
    cursor,
    status,
    targetType,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review and action user-submitted reports.
        </p>
      </div>

      <AdminFilters
        currentValues={{ status: status ?? "", targetType: targetType ?? "" }}
        filters={[
          {
            key: "status",
            placeholder: "All Statuses",
            options: [
              { value: "OPEN", label: "Open" },
              { value: "UNDER_REVIEW", label: "Under Review" },
              { value: "RESOLVED", label: "Resolved" },
              { value: "DISMISSED", label: "Dismissed" },
            ],
          },
          {
            key: "targetType",
            placeholder: "All Types",
            options: [
              { value: "DJ_PROFILE", label: "DJ Profile" },
              { value: "ORGANIZER_PROFILE", label: "Organizer" },
              { value: "GIG", label: "Gig" },
              { value: "REVIEW", label: "Review" },
              { value: "MEDIA", label: "Media" },
            ],
          },
        ]}
      />

      {reports.length === 0 ? (
        <AdminEmptyState
          title="No reports found"
          description={
            !status || status === "OPEN"
              ? "No open reports — the platform looks clean."
              : "No reports match the current filter."
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-white/8">
            <div className="overflow-x-auto">
              <table className="w-full min-w-160 text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-white/2">
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Reporter
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Target
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reports.map((report) => (
                    <tr
                      key={report.id}
                      className="transition-colors hover:bg-white/2"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">
                          {report.reporter.name ?? report.reporter.username}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          @{report.reporter.username}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className="border border-white/10 bg-white/5 text-xs text-gray-300">
                          {TARGET_LABELS[report.targetType] ??
                            report.targetType}
                        </Badge>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          ID: {report.targetId}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className="border border-white/10 bg-white/5 text-xs text-gray-300">
                          {REASON_LABELS[report.reason] ?? report.reason}
                        </Badge>
                        {report.description && (
                          <p className="text-muted-foreground mt-1 max-w-48 truncate text-xs">
                            {report.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`border text-xs ${STATUS_COLORS[report.status] ?? ""}`}
                        >
                          {report.status.replace("_", " ")}
                        </Badge>
                        {report.reviewedBy && (
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            by @{report.reviewedBy.username}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {formatDistanceToNow(new Date(report.createdAt), {
                          addSuffix: true,
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          {report.status === "OPEN" && (
                            <AdminActionButton
                              label="Review"
                              description="Mark this report as under review?"
                              confirmLabel="Start Review"
                              fields={{ reportId: String(report.id) }}
                              action={markReportUnderReview}
                              successMessage="Report marked as under review"
                              requireConfirm={false}
                            />
                          )}
                          {(report.status === "OPEN" ||
                            report.status === "UNDER_REVIEW") && (
                            <>
                              <AdminActionButton
                                label="Resolve"
                                description="Mark this report as resolved?"
                                confirmLabel="Resolve"
                                fields={{ reportId: String(report.id) }}
                                action={resolveReport}
                                successMessage="Report resolved"
                                variant="outline"
                                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                              />
                              <AdminActionButton
                                label="Dismiss"
                                description="Dismiss this report? No action will be taken."
                                confirmLabel="Dismiss"
                                fields={{ reportId: String(report.id) }}
                                action={dismissReport}
                                successMessage="Report dismissed"
                                variant="outline"
                                className="border-gray-500/30 text-gray-400 hover:bg-gray-500/10"
                              />
                            </>
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
