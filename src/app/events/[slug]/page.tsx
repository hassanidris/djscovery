import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
import { getDemoEventBySlug } from "@/data/events-demo";
import { getDemodjBySlug } from "@/data/djs";
import type { DemoEventWithDate } from "@/types/event-demo";
import JsonLd from "@/components/seo/JsonLd";
import { EventViewTracker } from "@/components/events/EventViewTracker";
import {
  EventViewerProvider,
  EditEventLink,
  AttendanceSlot,
  PrivateVenueNote,
  EventReviewSlot,
} from "@/components/events/EventViewerContext";

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

  // NOTE: This page is a static, ISR-cached shell (see `export const revalidate`
  // above). It intentionally contains NO cookies()/auth reads so caching stays
  // effective. Per-viewer state (ownership, attendance, review eligibility) is
  // fetched client-side via EventViewerProvider -> /api/events/[slug]/viewer-context.
  //
  // As a result, DRAFT/ARCHIVED events are never publicly visible, even to
  // their owner, via this URL. Owners manage/preview drafts through their
  // event dashboard (/dj/events) instead.

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
    if (dbEvent.status === "DRAFT" || dbEvent.status === "ARCHIVED") {
      notFound();
    }

    // Fetch attendance analytics (public aggregate counts, no auth needed)
    const [goingCount, interestedCount] = await Promise.all([
      prisma.eventAttendance.count({
        where: { eventId: dbEvent.id, status: "GOING" },
      }),
      prisma.eventAttendance.count({
        where: { eventId: dbEvent.id, status: "INTERESTED" },
      }),
    ]);

    const isPrivate = dbEvent.eventType === "PRIVATE";
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
        venue={isPrivate ? null : dbEvent.venue}
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
        eventId={dbEvent.id}
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
  eventId: number;
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
    eventId,
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
    <EventViewerProvider eventId={eventId}>
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
            <EditEventLink editHref={`/events/${slug}/edit`} />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            {/* ── Left column: Poster ── */}
            <div className="w-full shrink-0 md:sticky md:top-20 md:w-70 lg:w-80">
              <div className="aspect-2/3 w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl">
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={title}
                    width={320}
                    height={480}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-linear-to-br from-zinc-800 via-zinc-900 to-black">
                    <Music className="h-14 w-14 text-zinc-700" />
                    <p className="text-xs text-zinc-600">No poster</p>
                  </div>
                )}
              </div>
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
              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                {title}
              </h1>

              {/* DJ Attribution */}
              <Link
                href={`/djs/${ownerDj.slug}`}
                className="mb-6 flex items-center gap-3"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                  {ownerDj.avatar ? (
                    <Image
                      src={ownerDj.avatar}
                      alt={ownerDj.stageName}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-xs font-bold text-zinc-400">
                      {ownerDj.stageName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">
                    DJ. {ownerDj.stageName}
                  </p>
                  <p className="text-xs text-zinc-500">Organizer</p>
                </div>
              </Link>

              {/* Stats Card Grid */}
              <div className="mb-8 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-3">
                  <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
                    Views
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {viewCount > 0 ? viewCount.toLocaleString() : "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-3">
                  <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
                    Going
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {goingCount > 0 ? goingCount.toLocaleString() : "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-3">
                  <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
                    Interested
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {interestedCount > 0
                      ? interestedCount.toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Attendance Button — only for authenticated users */}
              <AttendanceSlot eventId={eventId} isUpcoming={isUpcoming} />

              {/* Description - moved before metadata */}
              {description && (
                <div className="mt-10 mb-8">
                  <h2 className="mb-3 text-sm font-semibold text-white">
                    About
                  </h2>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-zinc-300">
                    {description}
                  </p>
                </div>
              )}

              {/* Date/Time and Venue Cards - side by side */}
              <div className="mb-8 grid gap-4 sm:grid-cols-2">
                {/* Date/Time Card */}
                <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-4">
                  <div className="mb-3 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-zinc-500" />
                    <h3 className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
                      Date & Time
                    </h3>
                  </div>
                  <div className="space-y-1 text-sm text-zinc-300">
                    <p>{formatDate(startDate)}</p>
                    {endDate &&
                      endDate.toDateString() !== startDate.toDateString() && (
                        <p className="text-zinc-500">
                          to {formatDate(endDate)}
                        </p>
                      )}
                    {(startTime || endTime) && (
                      <p className="mt-2">
                        {startTime}
                        {endTime ? ` – ${endTime}` : ""}
                        {timezone && (
                          <span className="ml-1 text-zinc-500">
                            ({timezone})
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Venue Card */}
                {(location || venue || isPrivate) && (
                  <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-4">
                    <div className="mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-zinc-500" />
                      <h3 className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
                        Venue
                      </h3>
                    </div>
                    <div className="space-y-1 text-sm text-zinc-300">
                      {isPrivate ? (
                        <PrivateVenueNote publicLocation={location} />
                      ) : (
                        <>
                          {venue && <p>{venue}</p>}
                          {location && (
                            <p className={venue ? "text-zinc-500" : ""}>
                              {location}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Genres - clean chips */}
              {genres.length > 0 && (
                <div className="mb-8">
                  <h2 className="mb-3 text-sm font-semibold text-white">
                    Genres
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {genres.map((g) => (
                      <span
                        key={g}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300"
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
                            <Image
                              src={dj.avatar}
                              alt={dj.stageName}
                              width={40}
                              height={40}
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

              {/* Ticket CTA — prominent but not sticky */}
              {ticketUrl && isUpcoming && (
                <a
                  href={ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-h_red hover:bg-h_redDark shadow-h_red/20 mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold text-white shadow-lg transition-colors"
                >
                  <Ticket className="h-4 w-4" />
                  Get Tickets
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </a>
              )}

              {/* Fan reviews */}
              <EventReviewSlot
                eventId={eventId}
                status={status}
                djs={allPerformers.map((dj) => ({
                  djProfileId: dj.djProfileId,
                  slug: dj.slug,
                  stageName: dj.stageName,
                  avatar: dj.avatar,
                }))}
              />

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
                        <Image
                          src={img.url}
                          alt={img.caption ?? title}
                          width={200}
                          height={200}
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
    </EventViewerProvider>
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
      eventId={0}
      viewCount={0}
      goingCount={0}
      interestedCount={0}
    />
  );
}
