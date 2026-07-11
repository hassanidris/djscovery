import { redirect } from "next/navigation";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getCountries } from "@/lib/actions/locations";
import { EventForm } from "@/components/events/EventForm";

export const metadata: Metadata = { title: "Create Event — DJcovery" };

export default async function CreateEventPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const djProfile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, countryId: true, cityId: true },
  });
  if (!djProfile) redirect("/become-dj");

  const countries = await getCountries();

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">Create Event</h1>
        <p className="text-sm text-gray-400">
          Publish a new event and showcase it on your DJ profile.
        </p>
      </div>
      <EventForm
        mode="create"
        countries={countries}
        djDefaults={{
          countryId: djProfile.countryId?.toString(),
          cityId: djProfile.cityId?.toString(),
        }}
      />
    </div>
  );
}
