import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getCountries } from "@/lib/actions/locations";
import { GigForm } from "@/components/gigs/GigForm";
import { currencyForCountryCode } from "@/lib/utils/currency";

export const metadata = { title: "Post a Gig — DJscovery" };

export default async function GigCreatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const orgProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      status: true,
      deletedAt: true,
      countryId: true,
      cityId: true,
      country: { select: { code: true } },
    },
  });
  if (
    !orgProfile ||
    orgProfile.status !== "ACTIVE" ||
    orgProfile.deletedAt !== null
  )
    redirect("/become-organizer");

  const [countries, genres] = await Promise.all([
    getCountries(),
    prisma.genre.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <Link
          href="/dashboard/organizer/gigs"
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          My Gigs
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-white">Post a Gig</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Fill in the details below to start finding the right DJ.
        </p>

        <GigForm
          mode="create"
          countries={countries}
          genres={genres}
          orgDefaults={{
            countryId: orgProfile.countryId?.toString() ?? "",
            cityId: orgProfile.cityId?.toString() ?? "",
            currency: currencyForCountryCode(orgProfile.country?.code),
          }}
        />
      </div>
    </div>
  );
}
