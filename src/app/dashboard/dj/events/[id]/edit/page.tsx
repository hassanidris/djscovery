import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getCountries, getCitiesForCountry } from "@/lib/actions/locations";
import { EventForm } from "@/components/events/EventForm";
import type { EventCategory } from "@/lib/event-categories";

export const metadata = { title: "Edit Event — DJcovery" };

export default async function EventEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);
  if (!eventId || isNaN(eventId)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const djProfile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true, deletedAt: true },
  });
  if (
    !djProfile ||
    djProfile.status !== "APPROVED" ||
    djProfile.deletedAt !== null
  )
    redirect("/become-dj");

  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerDjId: djProfile.id, deletedAt: null },
    select: {
      id: true,
      title: true,
      eventType: true,
      category: true,
      startDate: true,
      endDate: true,
      startTime: true,
      endTime: true,
      timezone: true,
      countryId: true,
      cityId: true,
      venue: true,
      description: true,
      ticketUrl: true,
      genres: true,
      recap: true,
      audioLink: true,
      status: true,
      posterUrl: true,
    },
  });
  if (!event) notFound();

  const [countries, initialCities, galleryImages, allGenres] =
    await Promise.all([
      getCountries(),
      event.countryId
        ? getCitiesForCountry(event.countryId)
        : Promise.resolve([]),
      prisma.eventMedia.findMany({
        where: { eventId: event.id },
        orderBy: { sortOrder: "asc" },
        select: { id: true, url: true },
      }),
      prisma.genre.findMany({
        orderBy: { name: "asc" },
        select: { name: true },
      }),
    ]);

  const genreNames = allGenres.map((g) => g.name);

  const initialData = {
    title: event.title,
    eventType: event.eventType as "PUBLIC" | "PRIVATE",
    category: event.category as EventCategory,
    startDate: event.startDate.toISOString().split("T")[0],
    endDate: event.endDate ? event.endDate.toISOString().split("T")[0] : "",
    startTime: event.startTime ?? "",
    endTime: event.endTime ?? "",
    timezone: event.timezone ?? "",
    countryId: event.countryId?.toString() ?? "",
    cityId: event.cityId?.toString() ?? "",
    venue: event.venue ?? "",
    description: event.description ?? "",
    ticketUrl: event.ticketUrl ?? "",
    genres: event.genres,
    recap: event.recap ?? "",
    audioLink: event.audioLink ?? "",
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <Link
          href="/dashboard/dj/events"
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          My Events
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-white">Edit Event</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Status:{" "}
          <span className="font-medium text-zinc-300 capitalize">
            {event.status.toLowerCase()}
          </span>
        </p>

        <EventForm
          mode="edit"
          eventId={event.id}
          eventStatus={event.status}
          initialData={initialData}
          countries={countries}
          initialCities={initialCities}
          posterUrl={event.posterUrl}
          galleryImages={galleryImages}
          allGenres={genreNames}
        />
      </div>
    </div>
  );
}
