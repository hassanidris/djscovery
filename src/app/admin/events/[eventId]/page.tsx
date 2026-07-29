import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  Star,
  Eye,
  EyeOff,
  Globe,
  Music,
  Image as ImageIcon,
  MessageSquare,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import {
  getEventDetails,
  hideEvent,
  unhideEvent,
  deleteEventReview,
  requestEventEditAction,
  resolveEventModeration,
  dismissEventModeration,
} from "@/lib/actions/admin/events";
import AdminActionButton from "@/components/admin/AdminActionButton";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  // Validate eventId is a valid positive integer (rejects decimals, exponents, etc.)
  const eventIdNum = Number(eventId);
  if (!Number.isInteger(eventIdNum) || eventIdNum <= 0) {
    return notFound();
  }

  const event = await getEventDetails(eventIdNum);

  if (!event) return notFound();

  const STATUS_COLORS: Record<string, string> = {
    PUBLISHED: "border-green-500/30 bg-green-500/10 text-green-400",
    DRAFT: "border-gray-500/30 bg-gray-500/10 text-gray-400",
    COMPLETED: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    CANCELLED: "border-red-500/30 bg-red-500/10 text-red-400",
    ARCHIVED: "border-gray-500/30 bg-gray-500/10 text-gray-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/events">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{event.title}</h1>
            <p className="text-muted-foreground text-sm">{event.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {event.featured && (
            <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Star className="mr-1 h-3 w-3 fill-amber-400" />
              Featured
            </Badge>
          )}
          {event.hidden && (
            <Badge className="border-gray-500/30 bg-gray-500/10 text-gray-400">
              <EyeOff className="mr-1 h-3 w-3" />
              Hidden
            </Badge>
          )}
          <Badge
            className={`border text-xs ${STATUS_COLORS[event.status] ?? ""}`}
          >
            {event.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Event Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Event Information
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="text-muted-foreground text-sm">Owner DJ</span>
                <Link
                  href={`/djs/${event.ownerDj.slug}`}
                  className="flex items-center gap-2 text-white hover:underline"
                  target="_blank"
                >
                  {event.ownerDj.avatar && (
                    <Image
                      src={event.ownerDj.avatar}
                      alt={event.ownerDj.stageName}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  {event.ownerDj.stageName}
                </Link>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Type</span>
                <p className="text-white">{event.eventType}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Venue</span>
                <p className="text-white">{event.venue || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Location</span>
                <p className="flex items-center gap-1 text-white">
                  <MapPin className="h-3 w-3" />
                  {[event.city?.name, event.country?.name]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Date</span>
                <p className="flex items-center gap-1 text-white">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(event.startDate), "dd MMM yyyy")}
                  {event.endDate &&
                    ` - ${format(new Date(event.endDate), "dd MMM yyyy")}`}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Time</span>
                <p className="flex items-center gap-1 text-white">
                  <Clock className="h-3 w-3" />
                  {event.startTime || "—"}
                  {event.endTime && ` - ${event.endTime}`}
                  {event.timezone && ` (${event.timezone})`}
                </p>
              </div>
              {event.ticketUrl && (
                <div className="md:col-span-2">
                  <span className="text-muted-foreground text-sm">
                    Ticket URL
                  </span>
                  <a
                    href={event.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:underline"
                  >
                    <Globe className="h-3 w-3" />
                    {event.ticketUrl}
                  </a>
                </div>
              )}
            </div>
            <div className="mt-4">
              <span className="text-muted-foreground text-sm">Description</span>
              <p className="mt-1 whitespace-pre-wrap text-white">
                {event.description || "—"}
              </p>
            </div>
            {event.recap && (
              <div className="mt-4">
                <span className="text-muted-foreground text-sm">
                  Event Recap
                </span>
                <p className="mt-1 whitespace-pre-wrap text-white">
                  {event.recap}
                </p>
              </div>
            )}
            {event.genres && event.genres.length > 0 && (
              <div className="mt-4">
                <span className="text-muted-foreground mb-2 block text-sm">
                  Genres
                </span>
                <div className="flex flex-wrap gap-2">
                  {event.genres.map((genre) => (
                    <Badge
                      key={genre}
                      className="border border-white/10 bg-white/5 text-gray-300"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Participants */}
          {event.participants.length > 0 && (
            <div className="rounded-xl border border-white/8 bg-white/3 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Participants ({event.participants.length})
              </h2>
              <div className="space-y-3">
                {event.participants.map((participant) => (
                  <div
                    key={participant.djProfile.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex items-center gap-3">
                      {participant.djProfile.avatar && (
                        <Image
                          src={participant.djProfile.avatar}
                          alt={participant.djProfile.stageName}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <Link
                          href={`/djs/${participant.djProfile.slug}`}
                          className="font-medium text-white hover:underline"
                          target="_blank"
                        >
                          {participant.djProfile.stageName}
                        </Link>
                        {participant.role && (
                          <p className="text-muted-foreground text-xs">
                            {participant.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media Gallery */}
          {event.gallery.length > 0 && (
            <div className="rounded-xl border border-white/8 bg-white/3 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Gallery ({event.gallery.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {event.gallery.map((media) => (
                  <div
                    key={media.id}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/5"
                  >
                    <Image
                      src={media.url}
                      alt={media.caption || "Event photo"}
                      width={300}
                      height={300}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    {media.caption && (
                      <div className="absolute right-0 bottom-0 left-0 bg-black/70 p-2">
                        <p className="text-xs text-white">{media.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {event.eventReviews.length > 0 && (
            <div className="rounded-xl border border-white/8 bg-white/3 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Reviews ({event.eventReviews.length})
              </h2>
              <div className="space-y-4">
                {event.eventReviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {review.user.name || review.user.username}
                          </span>
                          <Badge className="border-white/10 bg-white/5 text-xs text-gray-300">
                            {review.reviewType || "ATTENDEE"}
                          </Badge>
                          <span className="flex items-center gap-1 text-amber-400">
                            <Star className="h-3 w-3 fill-amber-400" />
                            {review.rating}
                          </span>
                        </div>
                        {review.review && (
                          <p className="mt-2 text-sm text-gray-300">
                            {review.review}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          {format(new Date(review.createdAt), "dd MMM yyyy")}
                        </p>
                      </div>
                      <AdminActionButton
                        label="Delete"
                        description="Delete this review? This action cannot be undone."
                        confirmLabel="Delete Review"
                        fields={{ reviewId: String(review.id) }}
                        action={deleteEventReview}
                        successMessage="Review deleted"
                        variant="outline"
                        className="border-red-500/30 text-xs text-red-400 hover:bg-red-500/10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Moderation History */}
          {event.moderations.length > 0 && (
            <div className="rounded-xl border border-white/8 bg-white/3 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Moderation History ({event.moderations.length})
              </h2>
              <div className="space-y-4">
                {event.moderations.map((moderation) => (
                  <div
                    key={moderation.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              moderation.status === "PENDING"
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                                : moderation.status === "RESOLVED"
                                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                                  : "border-gray-500/30 bg-gray-500/10 text-gray-400"
                            }
                          >
                            {moderation.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {format(
                              new Date(moderation.createdAt),
                              "dd MMM yyyy",
                            )}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-300">
                          {moderation.adminComment}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          By{" "}
                          {moderation.admin.name || moderation.admin.username}
                        </p>
                        {moderation.resolvedAt && (
                          <p className="mt-1 text-xs text-gray-500">
                            Resolved:{" "}
                            {format(
                              new Date(moderation.resolvedAt),
                              "dd MMM yyyy",
                            )}
                          </p>
                        )}
                      </div>
                      {moderation.status === "PENDING" && (
                        <div className="flex gap-2">
                          <AdminActionButton
                            label="Resolve"
                            description="Mark this moderation request as resolved?"
                            confirmLabel="Resolve"
                            fields={{ moderationId: String(moderation.id) }}
                            action={resolveEventModeration}
                            successMessage="Moderation resolved"
                            variant="outline"
                            className="border-green-500/30 text-xs text-green-400 hover:bg-green-500/10"
                          />
                          <AdminActionButton
                            label="Dismiss"
                            description="Dismiss this moderation request?"
                            confirmLabel="Dismiss"
                            fields={{ moderationId: String(moderation.id) }}
                            action={dismissEventModeration}
                            successMessage="Moderation dismissed"
                            variant="outline"
                            className="border-gray-500/30 text-xs text-gray-400 hover:bg-gray-500/10"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Views</span>
                <span className="flex items-center gap-1 text-white">
                  <Eye className="h-4 w-4" />
                  {event.viewCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Participants</span>
                <span className="flex items-center gap-1 text-white">
                  <Users className="h-4 w-4" />
                  {event.participants.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Reviews</span>
                <span className="flex items-center gap-1 text-white">
                  <Star className="h-4 w-4" />
                  {event.eventReviews.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Gallery Photos</span>
                <span className="flex items-center gap-1 text-white">
                  <ImageIcon className="h-4 w-4" />
                  {event.gallery.length}
                </span>
              </div>
            </div>
          </div>

          {/* Audio/Video Links */}
          {(event.audioLink || event.videoLink) && (
            <div className="rounded-xl border border-white/8 bg-white/3 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Media Links
              </h2>
              <div className="space-y-3">
                {event.audioLink && (
                  <a
                    href={event.audioLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
                  >
                    <Music className="h-4 w-4" />
                    Audio Mix
                  </a>
                )}
                {event.videoLink && (
                  <a
                    href={event.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
                  >
                    <Globe className="h-4 w-4" />
                    Video
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Actions</h2>
            <div className="space-y-2">
              {event.hidden ? (
                <AdminActionButton
                  label="Unhide Event"
                  description="Make this event visible again?"
                  confirmLabel="Unhide"
                  fields={{ eventId: String(event.id) }}
                  action={unhideEvent}
                  successMessage="Event is now visible"
                  requireConfirm={false}
                  className="w-full"
                />
              ) : (
                <AdminActionButton
                  label="Hide Event"
                  description="Hide this event from public listings?"
                  confirmLabel="Hide"
                  fields={{ eventId: String(event.id) }}
                  action={hideEvent}
                  successMessage="Event hidden"
                  className="w-full"
                />
              )}
              <Link href={`/events/${event.slug}`} target="_blank">
                <Button variant="outline" className="w-full">
                  <Globe className="mr-2 h-4 w-4" />
                  View Public Page
                </Button>
              </Link>
            </div>
          </div>

          {/* Request Edit */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Request Edit
            </h2>
            <form action={requestEventEditAction} className="space-y-3">
              <input type="hidden" name="eventId" value={event.id} />
              <textarea
                name="adminComment"
                placeholder="Describe what needs to be edited..."
                className="focus:border-h_red/50 focus:ring-h_red/50 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-gray-500 focus:ring-1 focus:outline-none"
                rows={3}
                required
              />
              <Button
                type="submit"
                className="bg-h_red hover:bg-h_red/90 w-full text-white"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Edit Request
              </Button>
            </form>
          </div>

          {/* Metadata */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Metadata</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Created</span>
                <span className="text-xs text-white">
                  {format(new Date(event.createdAt), "dd MMM yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Updated</span>
                <span className="text-xs text-white">
                  {format(new Date(event.updatedAt), "dd MMM yyyy")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
