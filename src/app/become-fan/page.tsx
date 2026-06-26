import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { redirect } from "next/navigation";
import { getCountries, getCitiesForCountry } from "@/lib/actions/locations";
import BecomeFanForm from "@/components/BecomeFanForm";
import Footer from "@/components/Footer";

export const metadata = { title: "Complete Your Profile" };

export default async function BecomeFanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const [fanProfile, countries] = await Promise.all([
    prisma.fanProfile.findUnique({
      where: { userId: user.id },
      select: { name: true, bio: true, countryId: true, cityId: true },
    }),
    getCountries(),
  ]);

  const initialCities = fanProfile?.countryId
    ? await getCitiesForCountry(fanProfile.countryId)
    : [];

  return (
    <>
      <div className="flex min-h-[calc(100vh-96px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-8 space-y-2 text-center">
            <div className="bg-h_red/20 border-h_red/40 mb-2 inline-flex h-14 w-14 items-center justify-center rounded-full border">
              <span className="text-2xl">🎧</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Complete Your Profile
            </h1>
            <p className="mx-auto max-w-sm text-sm text-gray-400">
              Add a few details so other fans, DJs, and organizers can get to
              know you on DJcovery.
            </p>
          </div>

          <BecomeFanForm
            initialName={fanProfile?.name ?? ""}
            initialBio={fanProfile?.bio ?? ""}
            initialCountryId={fanProfile?.countryId ?? null}
            initialCityId={fanProfile?.cityId ?? null}
            countries={countries}
            initialCities={initialCities}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
