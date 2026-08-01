import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAdminHireById,
  updateHireNotes,
  markHireCompleted,
  markHireNoShow,
  cancelHire,
} from "@/lib/actions/admin/hires";
import AdminActionButton from "@/components/admin/AdminActionButton";
import { formatDistanceToNow, format } from "date-fns";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  User,
  Building,
  FileText,
} from "lucide-react";

export const metadata: Metadata = { title: "Hire Details" };

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  COMPLETED: "border-green-500/30 bg-green-500/10 text-green-400",
  CANCELLED_BY_DJ: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  CANCELLED_BY_ORGANIZER: "border-red-500/30 bg-red-500/10 text-red-400",
  NO_SHOW: "border-red-500/30 bg-red-500/10 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED_BY_DJ: "Cancelled by DJ",
  CANCELLED_BY_ORGANIZER: "Cancelled by Organizer",
  NO_SHOW: "No Show",
};

export default async function AdminHireDetailPage({
  params,
}: {
  params: Promise<{ hireId: string }>;
}) {
  const { hireId } = await params;
  const hireIdNum = Number(hireId);

  if (isNaN(hireIdNum)) {
    notFound();
  }

  const hire = await getAdminHireById(hireIdNum);

  if (!hire) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/hires"
            aria-label="Back to hires"
            className="text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Hire #{hire.id}</h1>
            <p className="text-muted-foreground text-sm">
              Created{" "}
              {formatDistanceToNow(new Date(hire.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
        <Badge className={`border text-sm ${STATUS_COLORS[hire.status] ?? ""}`}>
          {STATUS_LABELS[hire.status] ?? hire.status}
        </Badge>
      </div>

      {/* Hire Details */}
      <Card className="border-white/8 bg-white/2">
        <CardHeader>
          <CardTitle className="text-white">Hire Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs text-gray-400">Agreed Rate</p>
              <p className="flex items-center gap-2 text-white">
                <DollarSign className="h-4 w-4" />
                {hire.agreedRate
                  ? `${
                      typeof hire.agreedRate === "number"
                        ? hire.agreedRate.toFixed(2)
                        : Number(hire.agreedRate).toFixed(2)
                    }`
                  : "Not set"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-400">Status</p>
              <Badge
                className={`border text-xs ${STATUS_COLORS[hire.status] ?? ""}`}
              >
                {STATUS_LABELS[hire.status] ?? hire.status}
              </Badge>
            </div>
            {hire.completedAt && (
              <div>
                <p className="mb-1 text-xs text-gray-400">Completed At</p>
                <p className="flex items-center gap-2 text-white">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  {format(new Date(hire.completedAt), "dd MMM yyyy, HH:mm")}
                </p>
              </div>
            )}
            {hire.cancelledAt && (
              <div>
                <p className="mb-1 text-xs text-gray-400">Cancelled At</p>
                <p className="flex items-center gap-2 text-white">
                  <XCircle className="h-4 w-4 text-red-400" />
                  {format(new Date(hire.cancelledAt), "dd MMM yyyy, HH:mm")}
                </p>
              </div>
            )}
            {hire.cancellationReason && (
              <div className="md:col-span-2">
                <p className="mb-1 text-xs text-gray-400">
                  Cancellation Reason
                </p>
                <p className="text-sm text-white">{hire.cancellationReason}</p>
              </div>
            )}
            {hire.noShow && (
              <div className="md:col-span-2">
                <p className="mb-1 text-xs text-gray-400">No Show</p>
                <Badge className="border-red-500/30 bg-red-500/10 text-red-400">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Marked as No Show
                </Badge>
              </div>
            )}
            <div>
              <p className="mb-1 text-xs text-gray-400">Created</p>
              <p className="flex items-center gap-2 text-white">
                <Clock className="h-4 w-4" />
                {format(new Date(hire.createdAt), "dd MMM yyyy, HH:mm")}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-400">Last Updated</p>
              <p className="flex items-center gap-2 text-white">
                <Clock className="h-4 w-4" />
                {format(new Date(hire.updatedAt), "dd MMM yyyy, HH:mm")}
              </p>
            </div>
          </div>
          {hire.notes && (
            <div>
              <p className="mb-1 text-xs text-gray-400">Notes</p>
              <p className="text-sm whitespace-pre-wrap text-white">
                {hire.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participants */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* DJ Card */}
        <Card className="border-white/8 bg-white/2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="h-5 w-5" />
              DJ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href={`/djs/${hire.application.djProfile.slug}`}
              className="text-lg font-medium text-white hover:underline"
              target="_blank"
            >
              {hire.application.djProfile.stageName}
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <User className="h-4 w-4" />
              {hire.application.djProfile.user.email || "—"}
            </div>
          </CardContent>
        </Card>

        {/* Organizer Card */}
        <Card className="border-white/8 bg-white/2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Building className="h-5 w-5" />
              Organizer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href={`/organizers/${hire.application.gig.organizerProfile.slug}`}
              className="text-lg font-medium text-white hover:underline"
              target="_blank"
            >
              {hire.application.gig.organizerProfile.displayName}
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Gig & Event Details */}
      <Card className="border-white/8 bg-white/2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Briefcase className="h-5 w-5" />
            Gig & Event Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs text-gray-400">Gig</p>
              <Link
                href={`/gigs/${hire.application.gig.slug}`}
                className="font-medium text-white hover:underline"
                target="_blank"
              >
                {hire.application.gig.title}
              </Link>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-400">Event Date</p>
              <p className="flex items-center gap-2 text-white">
                <Calendar className="h-4 w-4" />
                {format(
                  new Date(hire.application.gig.eventDate),
                  "dd MMM yyyy, HH:mm",
                )}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-400">Venue</p>
              <p className="text-white">
                {hire.application.gig.venueName || "TBD"}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="mb-1 text-xs text-gray-400">Location</p>
              <p className="flex items-center gap-2 text-white">
                <MapPin className="h-4 w-4" />
                {[
                  hire.application.gig.city?.name,
                  hire.application.gig.country?.name,
                ]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <Card className="border-white/8 bg-white/2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5" />
            Admin Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Update Notes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">Admin Notes</p>
              {hire.notes && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <FileText className="h-3 w-3" />
                  Has notes
                </span>
              )}
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <textarea
                name="notes"
                placeholder="Add admin notes about this hire..."
                defaultValue={hire.notes || ""}
                className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-1 focus:ring-white/20 focus:outline-none"
                rows={4}
              />
              <div className="mt-3 flex justify-end">
                <AdminActionButton
                  label="Save Notes"
                  description="Update the admin notes for this hire?"
                  confirmLabel="Save"
                  fields={{ hireId: String(hire.id) }}
                  action={updateHireNotes}
                  successMessage="Notes updated"
                  requireConfirm={false}
                  className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                  Save Notes
                </AdminActionButton>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Status Actions */}
      {hire.status === "ACTIVE" && (
        <div className="flex justify-end space-y-3">
          {/* <p className="text-sm font-medium text-white">Status Actions</p> */}
          <div className="grid w-3/4 gap-3 p-4 sm:grid-cols-3">
            <AdminActionButton
              label="Mark Complete"
              description="Mark this hire as completed?"
              confirmLabel="Mark Complete"
              fields={{ hireId: String(hire.id) }}
              action={markHireCompleted}
              successMessage="Hire marked as completed"
              className="flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-4 py-3 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/10"
            >
              <CheckCircle className="h-4 w-4" />
              Mark Complete
            </AdminActionButton>
            <AdminActionButton
              label="Mark No Show"
              description="Mark this hire as no-show?"
              confirmLabel="Mark No Show"
              fields={{ hireId: String(hire.id) }}
              action={markHireNoShow}
              successMessage="Hire marked as no-show"
              className="flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
            >
              <AlertTriangle className="h-4 w-4" />
              Mark No Show
            </AdminActionButton>
            <AdminActionButton
              label="Cancel Hire"
              description="Cancel this hire?"
              confirmLabel="Cancel"
              fields={{ hireId: String(hire.id) }}
              action={cancelHire}
              successMessage="Hire cancelled"
              className="flex items-center justify-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/5 px-4 py-3 text-sm font-medium text-orange-400 transition-colors hover:bg-orange-500/10"
            >
              <XCircle className="h-4 w-4" />
              Cancel Hire
            </AdminActionButton>
          </div>
        </div>
      )}
    </div>
  );
}
