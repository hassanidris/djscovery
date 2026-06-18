"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Lock, Loader2, User, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { updateUserProfile } from "@/lib/actions/account";
import { getCitiesForCountry } from "@/lib/actions/locations";

type CountryOption = { id: number; name: string };
type CityOption = { id: number; name: string };

interface Props {
  currentEmail: string;
  initialName: string;
  initialCountryId: number | null;
  initialCityId: number | null;
  countries: CountryOption[];
  initialCities: CityOption[];
}

export default function ProfileSettingsForm({
  currentEmail,
  initialName,
  initialCountryId,
  initialCityId,
  countries,
  initialCities,
}: Props) {
  const [name, setName] = useState(initialName);
  const [countryId, setCountryId] = useState<number | null>(initialCountryId);
  const [cityId, setCityId] = useState<number | null>(initialCityId);
  const [cities, setCities] = useState<CityOption[]>(initialCities);
  const [isPending, startTransition] = useTransition();

  async function handleCountryChange(value: string) {
    const id = value ? parseInt(value) : null;
    setCountryId(id);
    setCityId(null);
    if (id) {
      const fetched = await getCitiesForCountry(id);
      setCities(fetched);
    } else {
      setCities([]);
    }
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateUserProfile({
        name: name || undefined,
        countryId: countryId ?? undefined,
        cityId: cityId ?? undefined,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Email — read-only */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Lock className="h-4 w-4" />
            Email Address
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Your login email cannot be changed.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/3 px-3 py-2.5">
          <Lock className="h-3.5 w-3.5 shrink-0 text-gray-600" />
          <span className="text-sm text-gray-300">{currentEmail}</span>
        </div>
      </section>

      <Separator className="bg-white/8" />

      {/* Display name */}
      <section className="flex flex-col gap-5">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <User className="h-4 w-4" />
            Display Name
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            How your name appears on reviews and activity.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your display name"
            maxLength={80}
          />
        </div>
      </section>

      <Separator className="bg-white/8" />

      {/* Location */}
      <section className="flex flex-col gap-5">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <MapPin className="h-4 w-4" />
            Location
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Used to personalise DJ and event suggestions near you.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="country">Country</Label>
            <select
              id="country"
              value={countryId ?? ""}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select country</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id} className="bg-zinc-900">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="city">City</Label>
            <select
              id="city"
              value={cityId ?? ""}
              onChange={(e) =>
                setCityId(e.target.value ? parseInt(e.target.value) : null)
              }
              disabled={!countryId || cities.length === 0}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select city</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id} className="bg-zinc-900">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
