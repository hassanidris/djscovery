import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getBookingInquiryDetails,
  closeInquiry,
  reopenInquiry,
  escalateDispute,
  resolveDispute,
  releaseContactInfo,
  hideContactInfo,
} from "@/lib/actions/admin/booking-inquiries";
import AdminActionButton from "@/components/admin/AdminActionButton";
import AdminNoteForm from "@/components/admin/AdminNoteForm";
import { formatDistanceToNow, format } from "date-fns";
import {
  MessageSquare,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Mail,
  Phone,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

export const metadata: Metadata = { title: "Booking Inquiry Details" };

const STATUS_COLORS: Record<string, string> = {
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  ACCEPTED: "border-green-500/30 bg-green-500/10 text-green-400",
  DECLINED: "border-red-500/30 bg-red-500/10 text-red-400",
  CANCELLED: "border-gray-500/30 bg-gray-500/10 text-gray-400",
};

export default async function AdminBookingInquiryDetailPage({
  params,
}: {
  params: Promise<{ inquiryId: string }>;
}) {
  const { inquiryId } = await params;
  const inquiryIdNum = Number(inquiryId);

  if (isNaN(inquiryIdNum)) {
    notFound();
  }

  const inquiry = await getBookingInquiryDetails(inquiryIdNum);

  if (!inquiry) {
    notFound();
  }

  const latestDisputeAction = inquiry.adminActions.find(
    (action) =>
      action.action === "ESCALATE_DISPUTE" ||
      action.action === "RESOLVE_DISPUTE",
  );
  const hasDispute = latestDisputeAction != null;
  const disputeResolved = latestDisputeAction?.action === "RESOLVE_DISPUTE";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/booking-inquiries"
            aria-label="Back to booking inquiries"
            className="text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {inquiry.eventName}
            </h1>
            <p className="text-muted-foreground text-sm">
              Inquiry #{inquiry.id} • Created{" "}
              {formatDistanceToNow(new Date(inquiry.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
        <Badge
          className={`border text-sm ${STATUS_COLORS[inquiry.status] ?? ""}`}
        >
          {inquiry.status}
        </Badge>
      </div>

      {/* Event Details */}
      <Card className="border-white/8 bg-white/2">
        <CardHeader>
          <CardTitle className="text-white">Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs text-gray-400">Event Name</p>
              <p className="text-white">{inquiry.eventName}</p>
            </div>
            {inquiry.eventDate && (
              <div>
                <p className="mb-1 text-xs text-gray-400">Event Date</p>
                <p className="flex items-center gap-2 text-white">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(inquiry.eventDate), "dd MMM yyyy")}
                </p>
              </div>
            )}
            {inquiry.venue && (
              <div>
                <p className="mb-1 text-xs text-gray-400">Venue</p>
                <p className="text-white">{inquiry.venue}</p>
              </div>
            )}
            <div>
              <p className="mb-1 text-xs text-gray-400">Location</p>
              <p className="flex items-center gap-2 text-white">
                <MapPin className="h-4 w-4" />
                {[inquiry.city?.name, inquiry.country?.name]
                  .filter(Boolean)
                  .join(", ") ||
                  inquiry.countryName ||
                  inquiry.cityName ||
                  "—"}
              </p>
            </div>
            {inquiry.crowdSize && (
              <div>
                <p className="mb-1 text-xs text-gray-400">Expected Crowd</p>
                <p className="flex items-center gap-2 text-white">
                  <Users className="h-4 w-4" />
                  {inquiry.crowdSize.toLocaleString()}
                </p>
              </div>
            )}
            <div>
              <p className="mb-1 text-xs text-gray-400">Budget</p>
              <p className="flex items-center gap-2 text-white">
                <DollarSign className="h-4 w-4" />
                {inquiry.budgetType === "NEGOTIABLE"
                  ? "Negotiable"
                  : inquiry.budgetType === "TBA"
                    ? "TBA"
                    : inquiry.budgetMin && inquiry.budgetMax
                      ? `${inquiry.budgetCurrency || "$"}${inquiry.budgetMin.toLocaleString()} - ${inquiry.budgetMax.toLocaleString()}`
                      : inquiry.budgetMin
                        ? `${inquiry.budgetCurrency || "$"}${inquiry.budgetMin.toLocaleString()}+`
                        : "—"}
              </p>
            </div>
            {inquiry.packageName && (
              <div>
                <p className="mb-1 text-xs text-gray-400">Package</p>
                <p className="text-white">{inquiry.packageName}</p>
              </div>
            )}
            {inquiry.packagePrice && (
              <div>
                <p className="mb-1 text-xs text-gray-400">Package Price</p>
                <p className="text-white">
                  {inquiry.budgetCurrency || "$"}
                  {inquiry.packagePrice.toLocaleString()}
                  {inquiry.packagePriceTo &&
                    ` - ${inquiry.packagePriceTo.toLocaleString()}`}
                </p>
              </div>
            )}
          </div>
          {inquiry.message && (
            <div>
              <p className="mb-1 text-xs text-gray-400">Initial Message</p>
              <p className="text-sm text-white">{inquiry.message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participants */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* DJ Card */}
        <Card className="border-white/8 bg-white/2">
          <CardHeader>
            <CardTitle className="text-white">DJ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href={`/djs/${inquiry.djProfile.slug}`}
              className="text-lg font-medium text-white hover:underline"
              target="_blank"
            >
              {inquiry.djProfile.stageName}
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Mail className="h-4 w-4" />
              {inquiry.contactReleasedAt ? (
                <span>{inquiry.djProfile.user.email || "—"}</span>
              ) : (
                <span className="text-gray-400">
                  Hidden (contact not released)
                </span>
              )}
            </div>
            {inquiry.city?.name && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <MapPin className="h-4 w-4" />
                {[inquiry.city.name, inquiry.country?.name]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organizer Card */}
        <Card className="border-white/8 bg-white/2">
          <CardHeader>
            <CardTitle className="text-white">Organizer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href={`/organizers/${inquiry.organizer.username}`}
              className="text-lg font-medium text-white hover:underline"
              target="_blank"
            >
              {inquiry.organizer.name || inquiry.organizer.username}
            </Link>
            {inquiry.organizer.organizerProfile?.displayName && (
              <p className="text-sm text-gray-300">
                {inquiry.organizer.organizerProfile.displayName}
              </p>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Mail className="h-4 w-4" />
              {inquiry.contactReleasedAt ? (
                <span>{inquiry.organizer.email || "—"}</span>
              ) : (
                <span className="text-gray-400">
                  Hidden (contact not released)
                </span>
              )}
            </div>
            {inquiry.organizer.organizerProfile?.city && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <MapPin className="h-4 w-4" />
                {[
                  inquiry.organizer.organizerProfile.city.name,
                  inquiry.organizer.organizerProfile.country?.name,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Info Actions */}
      <Card className="border-white/8 bg-white/2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-300">
            {inquiry.contactReleasedAt
              ? `Contact information released on ${format(
                  new Date(inquiry.contactReleasedAt),
                  "dd MMM yyyy",
                )}`
              : "Contact information is currently hidden from both parties."}
          </p>
          <div className="flex items-center gap-2">
            {inquiry.contactReleasedAt ? (
              <AdminActionButton
                label="Hide Contact Info"
                description="Hide contact information from both parties?"
                confirmLabel="Hide"
                fields={{ inquiryId: String(inquiry.id) }}
                action={hideContactInfo}
                successMessage="Contact info hidden"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Contact Info
              </AdminActionButton>
            ) : (
              <AdminActionButton
                label="Release Contact Info"
                description="Release contact information to both parties? This allows them to communicate directly."
                confirmLabel="Release"
                fields={{ inquiryId: String(inquiry.id) }}
                action={releaseContactInfo}
                successMessage="Contact info released"
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                <Eye className="mr-2 h-4 w-4" />
                Release Contact Info
              </AdminActionButton>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Thread */}
      <Card className="border-white/8 bg-white/2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageSquare className="h-5 w-5" />
            Message Thread ({inquiry.messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {inquiry.messages.length === 0 ? (
            <p className="text-sm text-gray-400">No messages yet.</p>
          ) : (
            <div className="space-y-4">
              {inquiry.messages.map((message) => {
                const isAdminNote =
                  message.body.startsWith("[ADMIN NOTE]") ||
                  message.body.startsWith("[DISPUTE");
                const isDisputeEscalated = message.body.startsWith(
                  "[DISPUTE ESCALATED]",
                );
                const isDisputeResolved =
                  message.body.startsWith("[DISPUTE RESOLVED]");

                return (
                  <div
                    key={message.id}
                    className={`rounded-lg border p-4 ${
                      isAdminNote
                        ? "border-purple-500/30 bg-purple-500/5"
                        : message.senderRole === "DJ"
                          ? "border-blue-500/30 bg-blue-500/5"
                          : "border-orange-500/30 bg-orange-500/5"
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {isAdminNote ? (
                          <Shield className="h-4 w-4 text-purple-400" />
                        ) : message.senderRole === "DJ" ? (
                          <span className="text-xs font-medium text-blue-400">
                            DJ
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-orange-400">
                            ORGANIZER
                          </span>
                        )}
                        <span className="text-sm font-medium text-white">
                          {message.sender.name || message.sender.username}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap text-gray-200">
                      {message.body}
                    </p>
                    {isDisputeEscalated && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-amber-400">
                        <AlertTriangle className="h-3 w-3" />
                        Dispute escalated
                      </div>
                    )}
                    {isDisputeResolved && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        Dispute resolved
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
          {/* Add Admin Note */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-white">Add Admin Note</p>
            <AdminNoteForm inquiryId={inquiry.id} />
          </div>

          {/* Dispute Management */}
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium text-white">
              <AlertTriangle className="h-4 w-4" />
              Dispute Management
            </p>
            <div className="flex flex-wrap gap-2">
              {!hasDispute ? (
                <AdminActionButton
                  label="Escalate Dispute"
                  description="Mark this inquiry as a dispute requiring admin intervention?"
                  confirmLabel="Escalate"
                  fields={{ inquiryId: String(inquiry.id) }}
                  action={escalateDispute}
                  successMessage="Dispute escalated"
                  className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Escalate Dispute
                </AdminActionButton>
              ) : !disputeResolved ? (
                <AdminActionButton
                  label="Resolve Dispute"
                  description="Mark this dispute as resolved?"
                  confirmLabel="Resolve"
                  fields={{ inquiryId: String(inquiry.id) }}
                  action={resolveDispute}
                  successMessage="Dispute resolved"
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Resolve Dispute
                </AdminActionButton>
              ) : (
                <Badge className="border-green-500/30 bg-green-500/10 text-green-400">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Dispute Resolved
                </Badge>
              )}
            </div>
          </div>

          {/* Inquiry Status */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-white">Inquiry Status</p>
            <div className="flex flex-wrap gap-2">
              {inquiry.status !== "CANCELLED" ? (
                <>
                  <AdminActionButton
                    label="Close Inquiry"
                    description="Close this booking inquiry?"
                    confirmLabel="Close"
                    fields={{ inquiryId: String(inquiry.id) }}
                    action={closeInquiry}
                    successMessage="Inquiry closed"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Close Inquiry
                  </AdminActionButton>
                </>
              ) : (
                <AdminActionButton
                  label="Reopen Inquiry"
                  description="Reopen this booking inquiry?"
                  confirmLabel="Reopen"
                  fields={{ inquiryId: String(inquiry.id) }}
                  action={reopenInquiry}
                  successMessage="Inquiry reopened"
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Reopen Inquiry
                </AdminActionButton>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card className="border-white/8 bg-white/2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5" />
            Admin Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inquiry.adminActions.length === 0 ? (
            <p className="text-sm text-gray-400">No admin actions recorded.</p>
          ) : (
            <div className="space-y-3">
              {inquiry.adminActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/2 p-3"
                >
                  <Shield className="mt-0.5 h-4 w-4 text-purple-400" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">
                        {action.action.replace(/_/g, " ")}
                      </p>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(action.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      By {action.admin?.name || action.admin?.username}
                    </p>
                    {action.metadata && (
                      <p className="mt-1 text-xs text-gray-400">
                        {JSON.stringify(action.metadata)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
