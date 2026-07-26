import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getCountries } from "@/lib/actions/locations";
import { getCitiesForCountry } from "@/lib/actions/locations";
import { EventForm } from "@/components/events/EventForm";
import type { EventFormData } from "@/components/events/EventForm";

export const metadata: Metadata = { title: "Edit Event — DJcovery" };

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const djProfile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!djProfile) redirect("/become-dj");

  const event = await prisma.event.findFirst({
    where: { slug, deletedAt: null },
    include: {
      city: { select: { id: true, name: true } },
      country: { select: { id: true, name: true } },
      gallery: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!event) notFound();
  if (event.ownerDjId !== djProfile.id) {
    redirect("/dj/events");
  }

  const countries = await getCountries();
  const initialCities = event.countryId
    ? await getCitiesForCountry(event.countryId)
    : [];

  const initialData: Partial<EventFormData> = {
    title: event.title,
    eventType: event.eventType,
    category: event.category as EventFormData["category"],
    startDate: event.startDate.toISOString().split("T")[0],
    endDate: event.endDate?.toISOString().split("T")[0] ?? "",
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
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">Edit Event</h1>
        <p className="text-sm text-gray-400">
          Update your event details, poster, and gallery.
        </p>
      </div>
      <EventForm
        mode="edit"
        eventId={event.id}
        eventStatus={event.status}
        initialData={initialData}
        countries={countries}
        initialCities={initialCities.map((c) => ({ id: c.id, name: c.name }))}
        posterUrl={event.posterUrl}
        galleryImages={event.gallery.map((g) => ({ id: g.id, url: g.url }))}
      />
    </div>
  );
}
