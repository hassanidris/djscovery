import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getCountries, getCitiesForCountry } from "@/lib/actions/locations";
import ProfileSettingsForm from "@/components/account/ProfileSettingsForm";
import { Separator } from "@/components/ui/separator";

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
      select: { name: true, countryId: true, cityId: true },
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
        initialName={dbUser?.name ?? ""}
        initialCountryId={dbUser?.countryId ?? null}
        initialCityId={dbUser?.cityId ?? null}
        countries={countries}
        initialCities={initialCities}
      />

      <Separator className="bg-white/8" />

      {/* Password link */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-white">Security</h2>
        <Link
          href="/settings/account"
          className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-4 transition-colors hover:bg-white/6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8">
              <KeyRound className="h-4 w-4 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Change Password</p>
              <p className="text-xs text-gray-500">
                Update your login password
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </Link>
      </div>
    </div>
  );
}
