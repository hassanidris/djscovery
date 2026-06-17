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
import type { DemoEventWithDate } from "@/types/event-demo";

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
      venue: true,
      description: true,
      ticketUrl: true,
      genres: true,
      recap: true,
      audioLink: true,
      posterUrl: true,
      status: true,
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
    const isOwner = user ? dbEvent.ownerDj.userId === user.id : false;

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
        title={dbEvent.title}
        eventType={dbEvent.eventType}
        category={dbEvent.category}
        status={dbEvent.status}
        startDate={dbEvent.startDate}
        endDate={dbEvent.endDate ?? null}
        startTime={dbEvent.startTime ?? null}
        endTime={dbEvent.endTime ?? null}
        location={location}
        venue={showVenue ? (dbEvent.venue ?? null) : null}
        isPrivate={isPrivate}
        description={dbEvent.description ?? null}
        ticketUrl={dbEvent.ticketUrl ?? null}
        genres={dbEvent.genres}
        recap={dbEvent.recap ?? null}
        audioLink={dbEvent.audioLink ?? null}
        posterUrl={dbEvent.posterUrl ?? null}
        isUpcoming={isUpcoming}
        ownerDj={{
          slug: dbEvent.ownerDj.slug,
          stageName: dbEvent.ownerDj.stageName,
          avatar: dbEvent.ownerDj.avatar ?? null,
        }}
        participants={dbEvent.participants.map((p) => ({
          role: p.role ?? null,
          slug: p.djProfile.slug,
          stageName: p.djProfile.stageName,
          avatar: p.djProfile.avatar ?? null,
        }))}
        gallery={dbEvent.gallery}
        isOwner={isOwner}
        editHref={isOwner ? `/dashboard/dj/events/${dbEvent.id}/edit` : null}
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

type DjMini = { slug: string; stageName: string; avatar: string | null };
type GalleryItem = { id: number; url: string; caption: string | null };

function EventDetailView(props: {
  title: string;
  eventType: string;
  category: string;
  status: string;
  startDate: Date;
  endDate: Date | null;
  startTime: string | null;
  endTime: string | null;
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
}) {
  const {
    title,
    eventType,
    category,
    status,
    startDate,
    endDate,
    startTime,
    endTime,
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
  } = props;

  const allPerformers = [
    { ...ownerDj, role: "Headliner" as string | null },
    ...participants.filter((p) => p.slug !== ownerDj.slug),
  ];

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Hero */}
      <div className="relative h-64 w-full overflow-hidden sm:h-80 md:h-96">
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-zinc-800 via-zinc-900 to-black" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />

        {/* Back link */}
        <Link
          href="/events"
          className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Events
        </Link>

        {/* Owner edit link */}
        {isOwner && editHref && (
          <Link
            href={editHref}
            className="absolute top-4 right-4 rounded-full bg-black/50 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm hover:text-white"
          >
            Edit Event
          </Link>
        )}
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
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

        {/* Ticket CTA */}
        {ticketUrl && isUpcoming && (
          <a
            href={ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
          >
            <Ticket className="h-4 w-4" />
            Get Tickets
            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </a>
        )}

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
  );
}

// ── Demo event view (staging only) ────────────────────────────────────────────

function DemoEventDetailView({ event }: { event: DemoEventWithDate }) {
  const isUpcoming = event.daysOffset > 0;
  const location = [event.city, event.country].filter(Boolean).join(", ");

  return (
    <EventDetailView
      title={event.title}
      eventType={event.eventType}
      category={event.category}
      status="PUBLISHED"
      startDate={event.eventDate}
      endDate={null}
      startTime={event.startTime}
      endTime={event.endTime}
      location={location}
      venue={event.venue}
      isPrivate={event.eventType === "PRIVATE"}
      description={event.description}
      ticketUrl={event.ticketUrl}
      genres={event.genres}
      recap={null}
      audioLink={null}
      posterUrl={null}
      isUpcoming={isUpcoming}
      ownerDj={{
        slug: event.djSlug,
        stageName: slugToName(event.djSlug),
        avatar: null,
      }}
      participants={[]}
      gallery={[]}
      isOwner={false}
      editHref={null}
    />
  );
}
