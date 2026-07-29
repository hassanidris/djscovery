import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getCountries } from "@/lib/actions/locations";
import { getCitiesForCountry } from "@/lib/actions/locations";
import { EventForm } from "@/components/events/EventForm";
import type { EventFormData } from "@/components/events/EventForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";
import { resubmitEventForReviewAction } from "@/lib/actions/event";

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

  // Check for pending moderation separately
  const pendingModeration = await prisma.eventModeration.findFirst({
    where: {
      eventId: event.id,
      status: "PENDING",
    },
    include: {
      admin: { select: { name: true, username: true } },
    },
  });

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

      {/* Pending Moderation Alert */}
      {pendingModeration && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">
                  PENDING EDIT REQUEST
                </Badge>
              </div>
              <p className="mb-2 text-sm text-gray-300">
                Admin requested: {pendingModeration.adminComment}
              </p>
              <p className="mb-4 text-xs text-gray-500">
                Requested by{" "}
                {pendingModeration.admin.name ||
                  pendingModeration.admin.username}
              </p>
              <form action={resubmitEventForReviewAction}>
                <input type="hidden" name="eventId" value={event.id} />
                <Button
                  type="submit"
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Resubmit for Review
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

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
