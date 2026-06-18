import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getCountries, getCitiesForCountry } from "@/lib/actions/locations";
import ProfileSettingsForm from "@/components/account/ProfileSettingsForm";

export const metadata = { title: "Account Settings" };

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/sign-in");

  const [dbUser, countries] = await Promise.all([
    prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        name: true,
        username: true,
        image: true,
        countryId: true,
        cityId: true,
      },
    }),
    getCountries(),
  ]);

  const initialCities = dbUser?.countryId
    ? await getCitiesForCountry(dbUser.countryId)
    : [];

  return (
    <div className="flex flex-col gap-10">
      <ProfileSettingsForm
        currentEmail={authUser.email ?? ""}
        initialName={dbUser?.name ?? dbUser?.username ?? ""}
        username={dbUser?.username ?? ""}
        currentAvatar={dbUser?.image ?? null}
        initialCountryId={dbUser?.countryId ?? null}
        initialCityId={dbUser?.cityId ?? null}
        countries={countries}
        initialCities={initialCities}
      />
    </div>
  );
}
