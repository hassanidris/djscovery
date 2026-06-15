import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import {
  getOrganizerGigDetail,
  type OrganizerGigDetail,
} from "@/lib/queries/gigs";
import { getCountries } from "@/lib/actions/locations";
import { GigStatusBadge } from "@/components/gigs/GigStatusBadge";
import { GigForm, type GigFormData } from "@/components/gigs/GigForm";

function gigDetailToFormData(gig: OrganizerGigDetail): GigFormData {
  return {
    title: gig.title,
    gigType: gig.gigType,
    eventDate: new Date(gig.eventDate).toISOString().slice(0, 16),
    description: gig.description ?? "",
    countryId: gig.countryId?.toString() ?? "",
    cityId: gig.cityId?.toString() ?? "",
    requiredGenres: gig.requiredGenres,
    requiredExperienceLevel: gig.requiredExperienceLevel,
    setDurationMinutes: gig.setDurationMinutes?.toString() ?? "",
    guestCount: gig.guestCount?.toString() ?? "",
    dressCode: gig.dressCode ?? "",
    mcRequired: gig.mcRequired,
    micRequired: gig.micRequired,
    languagesSpoken: gig.languagesSpoken,
    venueProvides: gig.venueProvides,
    djMustBring: gig.djMustBring,
    budgetType: gig.budgetType,
    budgetMin: gig.budgetMin?.toString() ?? "",
    budgetMax: gig.budgetMax?.toString() ?? "",
    currency: gig.currency,
    venueName: gig.venueName ?? "",
    venueAddress: gig.venueAddress ?? "",
    venuePostalCode: gig.venuePostalCode ?? "",
    hideVenueName: gig.hideVenueName,
    organizerContactName: gig.organizerContactName ?? "",
    organizerContactPhone: gig.organizerContactPhone ?? "",
    organizerContactEmail: gig.organizerContactEmail ?? "",
    arrivalInstructions: gig.arrivalInstructions ?? "",
    setupNotes: gig.setupNotes ?? "",
    applicationDeadline: gig.applicationDeadline
      ? new Date(gig.applicationDeadline).toISOString().slice(0, 10)
      : "",
  };
}

export default async function GigEditPage({
  params,
}: {
  params: Promise<{ gigId: string }>;
}) {
  const { gigId: gigIdRaw } = await params;
  const gigId = parseInt(gigIdRaw, 10);
  if (isNaN(gigId)) return notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const orgProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!orgProfile) redirect("/become-organizer");

  const [gig, countries] = await Promise.all([
    getOrganizerGigDetail(gigId, orgProfile.id),
    getCountries(),
  ]);
  if (!gig) return notFound();

  if (gig.status === "CANCELLED" || gig.status === "EXPIRED") {
    redirect(`/dashboard/organizer/gigs/${gigId}`);
  }

  const initialData = gigDetailToFormData(gig);

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/dashboard/organizer/gigs/${gigId}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Gig
          </Link>
          <GigStatusBadge status={gig.status} />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-white">Edit Gig</h1>
        <p className="text-muted-foreground mb-8 truncate text-sm">
          {gig.title}
        </p>

        <GigForm
          mode="edit"
          gigId={gigId}
          initialData={initialData}
          countries={countries}
        />
      </div>
    </div>
  );
}
