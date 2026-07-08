import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  Music,
  Ticket,
  ExternalLink,
  Lock,
  ArrowLeft,
} from "lucide-react";
import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { getDemoEventBySlug } from "@/data/events-demo";
import { getDemodjBySlug } from "@/data/djs";
import type { DemoEventWithDate } from "@/types/event-demo";
import { EventReviewSection } from "@/components/reputation/EventReviewSection";
import JsonLd from "@/components/seo/JsonLd";
import AttendanceButton from "@/components/events/AttendanceButton";
import { EventViewTracker } from "@/components/events/EventViewTracker";
import { EventAnalytics } from "@/components/events/EventAnalytics";
import { getEventAttendance } from "@/lib/actions/event-attendance";

export const revalidate = 60;

function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  CLUB_NIGHT: "Club Night",
  FESTIVAL: "Festival",
  WEDDING: "Wedding",
  BIRTHDAY: "Birthday",
  CORPORATE: "Corporate",
  BEACH_PARTY: "Beach Party",
  LOUNGE: "Lounge",
  RESTAURANT_SET: "Restaurant Set",
  PRIVATE_PARTY: "Private Party",
  OPEN_AIR: "Open Air",
  LUXURY_EVENT: "Luxury Event",
  OTHER: "Other",
};

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-emerald-950 text-emerald-400",
  COMPLETED: "bg-blue-950 text-blue-400",
  CANCELLED: "bg-red-950 text-red-400",
  DRAFT: "bg-zinc-800 text-zinc-400",
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── DB lookup ────────────────────────────────────────────────────────────
  const dbEvent = await prisma.event.findFirst({
    where: { slug, deletedAt: null },
    select: {
      id: true,
      slug: true,
      title: true,
      eventType: true,
      category: true,
      startDate: true,
      endDate: true,
      startTime: true,
      endTime: true,
      timezone: true,
      venue: true,
      description: true,
      ticketUrl: true,
      genres: true,
      recap: true,
      audioLink: true,
      posterUrl: true,
      status: true,
      viewCount: true,
      ownerDjId: true,
      ownerDj: {
        select: {
          id: true,
          slug: true,
          stageName: true,
          avatar: true,
          userId: true,
        },
      },
      eventReviews: {
        where: user ? { userId: user.id } : { userId: "" },
        select: { djProfileId: true },
      },
      country: { select: { name: true } },
      city: { select: { name: true } },
      participants: {
        select: {
          role: true,
          djProfile: {
            select: { id: true, slug: true, stageName: true, avatar: true },
          },
        },
      },
      gallery: {
        select: { id: true, url: true, caption: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  // ── Visibility guard for DB events ───────────────────────────────────────
  if (dbEvent) {
    const isOwner = user ? dbEvent.ownerDj.userId === user.id : false;
    const attendance = user
      ? await prisma.eventAttendance.findUnique({
          where: { eventId_userId: { eventId: dbEvent.id, userId: user.id } },
        })
      : null;
    const hasAttended = attendance?.status === "ATTENDED";
    const attendanceStatus = user
      ? await getEventAttendance(dbEvent.id, user.id)
      : { status: null };
    const reviewedDjIds = dbEvent.eventReviews.map((r) => r.djProfileId);
    const organizerProfile = user
      ? await prisma.organizerProfile.findUnique({ where: { userId: user.id } })
      : null;
    const isOrganizer = Boolean(organizerProfile);

    // Fetch attendance analytics
    const [goingCount, interestedCount] = await Promise.all([
      prisma.eventAttendance.count({
        where: { eventId: dbEvent.id, status: "GOING" },
      }),
      prisma.eventAttendance.count({
        where: { eventId: dbEvent.id, status: "INTERESTED" },
      }),
    ]);

    if (dbEvent.status === "DRAFT" || dbEvent.status === "ARCHIVED") {
      if (isOwner) redirect(`/dashboard/dj/events/${dbEvent.id}/edit`);
      notFound();
    }

    const isPrivate = dbEvent.eventType === "PRIVATE";
    const showVenue = !isPrivate || isOwner;
    const location = [dbEvent.city?.name, dbEvent.country?.name]
      .filter(Boolean)
      .join(", ");
    const isUpcoming = dbEvent.startDate > new Date();

    return (
      <EventDetailView
        slug={dbEvent.slug}
        title={dbEvent.title}
        eventType={dbEvent.eventType}
        category={dbEvent.category}
        status={dbEvent.status}
        startDate={dbEvent.startDate}
        endDate={dbEvent.endDate}
        startTime={dbEvent.startTime}
        endTime={dbEvent.endTime}
        timezone={dbEvent.timezone}
        location={location}
        venue={showVenue ? dbEvent.venue : null}
        isPrivate={isPrivate}
        description={dbEvent.description}
        ticketUrl={dbEvent.ticketUrl}
        genres={dbEvent.genres}
        recap={dbEvent.recap}
        audioLink={dbEvent.audioLink}
        posterUrl={dbEvent.posterUrl}
        isUpcoming={isUpcoming}
        ownerDj={{
          djProfileId: dbEvent.ownerDj.id,
          slug: dbEvent.ownerDj.slug,
          stageName: dbEvent.ownerDj.stageName,
          avatar: dbEvent.ownerDj.avatar ?? null,
        }}
        participants={dbEvent.participants.map((p) => ({
          djProfileId: p.djProfile.id,
          role: p.role ?? null,
          slug: p.djProfile.slug,
          stageName: p.djProfile.stageName,
          avatar: p.djProfile.avatar ?? null,
        }))}
        gallery={dbEvent.gallery}
        isOwner={isOwner}
        editHref={isOwner ? `/dashboard/dj/events/${dbEvent.id}/edit` : null}
        eventId={dbEvent.id}
        hasAttended={hasAttended}
        reviewedDjIds={reviewedDjIds}
        attendanceStatus={attendanceStatus.status}
        user={user}
        isOrganizer={isOrganizer}
        viewCount={dbEvent.viewCount ?? 0}
        goingCount={goingCount}
        interestedCount={interestedCount}
      />
    );
  }

  // ── Demo event fallback (staging) ────────────────────────────────────────
  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging";
  if (isStaging) {
    const demo = getDemoEventBySlug(slug);
    if (demo) {
      return <DemoEventDetailView event={demo} />;
    }
  }

  notFound();
}

// ── Shared detail view ────────────────────────────────────────────────────────

type DjMini = {
  djProfileId: number;
  slug: string;
  stageName: string;
  avatar: string | null;
};
type GalleryItem = { id: number; url: string; caption: string | null };

function EventDetailView(props: {
  slug: string;
  title: string;
  eventType: string;
  category: string;
  status: string;
  startDate: Date;
  endDate: Date | null;
  startTime: string | null;
  endTime: string | null;
  timezone: string | null;
  location: string;
  venue: string | null;
  isPrivate: boolean;
  description: string | null;
  ticketUrl: string | null;
  genres: string[];
  recap: string | null;
  audioLink: string | null;
  posterUrl: string | null;
  isUpcoming: boolean;
  ownerDj: DjMini;
  participants: (DjMini & { role: string | null })[];
  gallery: GalleryItem[];
  isOwner: boolean;
  editHref: string | null;
  eventId: number;
  hasAttended: boolean;
  reviewedDjIds: number[];
  attendanceStatus: "GOING" | "INTERESTED" | null;
  user: any;
  isOrganizer: boolean;
  viewCount: number;
  goingCount: number;
  interestedCount: number;
}) {
  const {
    slug,
    title,
    eventType,
    category,
    status,
    startDate,
    endDate,
    startTime,
    endTime,
    timezone,
    location,
    venue,
    isPrivate,
    description,
    ticketUrl,
    genres,
    recap,
    audioLink,
    posterUrl,
    isUpcoming,
    ownerDj,
    participants,
    gallery,
    isOwner,
    editHref,
    eventId,
    hasAttended,
    reviewedDjIds,
    attendanceStatus,
    user,
    isOrganizer,
    viewCount,
    goingCount,
    interestedCount,
  } = props;

  const allPerformers = [
    { ...ownerDj, role: "Headliner" as string | null },
    ...participants.filter((p) => p.slug !== ownerDj.slug),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: title,
    description:
      description || `${CATEGORY_LABELS[category] || "Event"} in ${location}`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/events/${slug}`,
    image: posterUrl,
    startDate: startDate.toISOString(),
    endDate: endDate?.toISOString(),
    location: {
      "@type": "Place",
      name: venue || location,
      address: {
        "@type": "PostalAddress",
        addressLocality: location,
      },
    },
    performer: allPerformers.map((p) => ({
      "@type": "Person",
      name: p.stageName,
      image: p.avatar,
    })),
    organizer: {
      "@type": "Person",
      name: ownerDj.stageName,
    },
    eventStatus:
      status === "COMPLETED"
        ? "https://schema.org/EventMovedOnline"
        : "https://schema.org/EventScheduled",
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      <JsonLd data={jsonLd} />
      <EventViewTracker eventId={eventId} />
      {/* Top nav bar */}
      <div className="sticky top-0 z-10 border-b border-zinc-800/60 bg-black/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
          <Link
            href="/events"
            className="flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Events
          </Link>
          {isOwner && editHref && (
            <Link
              href={editHref}
              className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
            >
              Edit Event
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          {/* ── Left column: Poster ── */}
          <div className="w-full shrink-0 md:sticky md:top-20 md:w-70 lg:w-80">
            <div className="aspect-2/3 w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl">
              {posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={posterUrl}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-linear-to-br from-zinc-800 via-zinc-900 to-black">
                  <Music className="h-14 w-14 text-zinc-700" />
                  <p className="text-xs text-zinc-600">No poster</p>
                </div>
              )}
            </div>

            {/* Attendance Button — only for authenticated users */}
            {user && (
              <AttendanceButton
                eventId={eventId}
                currentStatus={attendanceStatus}
                isUpcoming={isUpcoming}
              />
            )}

            {/* Ticket CTA — below poster on all screen sizes */}
            {ticketUrl && isUpcoming && (
              <a
                href={ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
              >
                <Ticket className="h-4 w-4" />
                Get Tickets
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>
            )}
          </div>

          {/* ── Right column: Details ── */}
          <div className="min-w-0 flex-1">
            {/* Badge row */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.PUBLISHED}`}
              >
                {status === "COMPLETED"
                  ? "Past Event"
                  : isUpcoming
                    ? "Upcoming"
                    : status.charAt(0) + status.slice(1).toLowerCase()}
              </span>
              {isPrivate && (
                <span className="flex items-center gap-1 rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs text-zinc-400">
                  <Lock className="h-3 w-3" /> Private
                </span>
              )}
              {category && (
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                  {CATEGORY_LABELS[category] ?? category}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              {title}
            </h1>

            {/* Analytics */}
            <EventAnalytics
              viewCount={viewCount}
              goingCount={goingCount}
              interestedCount={interestedCount}
            />

            {/* Meta */}
            <div className="mb-8 space-y-3">
              <div className="flex items-start gap-2.5 text-sm text-zinc-300">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                <div>
                  <p>{formatDate(startDate)}</p>
                  {endDate &&
                    endDate.toDateString() !== startDate.toDateString() && (
                      <p className="text-zinc-500">to {formatDate(endDate)}</p>
                    )}
                </div>
              </div>

              {(startTime || endTime) && (
                <div className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <Clock className="h-4 w-4 shrink-0 text-zinc-500" />
                  <span>
                    {startTime}
                    {endTime ? ` – ${endTime}` : ""}
                    {timezone && (
                      <span className="ml-1 text-zinc-500">({timezone})</span>
                    )}
                  </span>
                </div>
              )}

              {(location || venue) && (
                <div className="flex items-start gap-2.5 text-sm text-zinc-300">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                  <div>
                    {venue && <p>{venue}</p>}
                    {location && (
                      <p className={venue ? "text-zinc-500" : ""}>{location}</p>
                    )}
                  </div>
                </div>
              )}

              {isPrivate && !venue && (
                <div className="flex items-center gap-2.5 text-sm text-zinc-500">
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>Venue hidden — private event</span>
                </div>
              )}
            </div>

            {/* Description */}
            {description && (
              <div className="mb-8">
                <h2 className="mb-2 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                  About
                </h2>
                <p className="text-sm leading-relaxed whitespace-pre-line text-zinc-300">
                  {description}
                </p>
              </div>
            )}

            {/* Genres */}
            {genres.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                  <Music className="h-3.5 w-3.5" /> Genres
                </h2>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <span
                      key={g}
                      className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Performers */}
            {allPerformers.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-3 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                  Line-up
                </h2>
                <div className="space-y-2">
                  {allPerformers.map((dj) => (
                    <Link
                      key={dj.slug}
                      href={`/djs/${dj.slug}`}
                      className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 transition-colors hover:border-zinc-700"
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                        {dj.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={dj.avatar}
                            alt={dj.stageName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-xs font-bold text-zinc-400">
                            {dj.stageName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">
                          DJ. {dj.stageName}
                        </p>
                        {dj.role && (
                          <p className="text-xs text-zinc-500">{dj.role}</p>
                        )}
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Fan reviews */}
            {status === "COMPLETED" && hasAttended && (
              <EventReviewSection
                eventId={eventId}
                djs={allPerformers.map((dj) => ({
                  djProfileId: dj.djProfileId,
                  slug: dj.slug,
                  stageName: dj.stageName,
                  avatar: dj.avatar,
                }))}
                reviewedDjIds={reviewedDjIds}
                isOrganizer={isOrganizer}
              />
            )}

            {/* Post-event recap */}
            {recap && (
              <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <h2 className="mb-3 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                  Event Recap
                </h2>
                <p className="text-sm leading-relaxed whitespace-pre-line text-zinc-300">
                  {recap}
                </p>
                {audioLink && (
                  <a
                    href={audioLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <Music className="h-4 w-4" />
                    Listen to the set
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                  </a>
                )}
              </div>
            )}

            {/* Gallery */}
            {gallery.length > 0 && (
              <div>
                <h2 className="mb-3 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                  Photos
                </h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {gallery.map((img) => (
                    <div
                      key={img.id}
                      className="aspect-square overflow-hidden rounded-lg"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.caption ?? title}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Demo event view (staging only) ────────────────────────────────────────────

function DemoEventDetailView({ event }: { event: DemoEventWithDate }) {
  const isUpcoming = event.daysOffset > 0;
  const location = [event.city, event.country].filter(Boolean).join(", ");
  const demoDj = getDemodjBySlug(event.djSlug);

  return (
    <EventDetailView
      slug={event.slug}
      title={event.title}
      eventType={event.eventType}
      category={event.category}
      status="PUBLISHED"
      startDate={event.eventDate}
      endDate={null}
      startTime={event.startTime}
      endTime={event.endTime}
      timezone={null}
      location={location}
      venue={event.venue}
      isPrivate={event.eventType === "PRIVATE"}
      description={event.description}
      ticketUrl={event.ticketUrl}
      genres={event.genres}
      recap={null}
      audioLink={null}
      posterUrl={event.posterUrl ?? null}
      isUpcoming={isUpcoming}
      ownerDj={{
        djProfileId: 0,
        slug: event.djSlug,
        stageName: demoDj?.stageName ?? slugToName(event.djSlug),
        avatar:
          typeof demoDj?.avatar === "string"
            ? demoDj.avatar
            : (demoDj?.avatar?.url ?? null),
      }}
      participants={[]}
      gallery={[]}
      isOwner={false}
      editHref={null}
      eventId={0}
      hasAttended={false}
      reviewedDjIds={[]}
      attendanceStatus={null}
      user={null}
      isOrganizer={false}
      viewCount={0}
      goingCount={0}
      interestedCount={0}
    />
  );
}
