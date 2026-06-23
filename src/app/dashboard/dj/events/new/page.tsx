import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getCountries } from "@/lib/actions/locations";
import { EventForm } from "@/components/events/EventForm";

export const metadata = { title: "Create Event — DJcovery" };

export default async function EventCreatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const djProfile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      status: true,
      deletedAt: true,
      countryId: true,
      cityId: true,
    },
  });

  if (
    !djProfile ||
    djProfile.status !== "APPROVED" ||
    djProfile.deletedAt !== null
  )
    redirect("/become-dj");

  const countries = await getCountries();

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

        <h1 className="mb-2 text-2xl font-bold text-white">Create an Event</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Events are saved as drafts. Publish when you&apos;re ready.
        </p>

        <EventForm
          mode="create"
          countries={countries}
          djDefaults={{
            countryId: djProfile.countryId?.toString() ?? "",
            cityId: djProfile.cityId?.toString() ?? "",
          }}
        />
      </div>
    </div>
  );
}
