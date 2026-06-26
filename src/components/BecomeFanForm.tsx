"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setupFanProfile } from "@/lib/actions/profile";
import { getCitiesForCountry } from "@/lib/actions/locations";

type Country = { id: number; name: string };
type City = { id: number; name: string };

const initialState = { success: false, error: null as string | null };

export default function BecomeFanForm({
  initialName,
  initialBio,
  initialCountryId,
  initialCityId,
  countries,
  initialCities,
}: {
  initialName: string;
  initialBio: string;
  initialCountryId: number | null;
  initialCityId: number | null;
  countries: Country[];
  initialCities: City[];
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    setupFanProfile,
    initialState,
  );
  const [countryId, setCountryId] = useState<number | null>(initialCountryId);
  const [cityId, setCityId] = useState<number | null>(initialCityId);
  const [cities, setCities] = useState<City[]>(initialCities);

  useEffect(() => {
    if (state.success) {
      toast.success("Profile saved! Welcome to DJcovery 🎉");
      router.push("/");
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

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

  return (
    <form
      action={formAction}
      className="flex flex-col gap-5 rounded-xl border border-white/10 bg-white/5 p-8"
    >
      <input type="hidden" name="countryId" value={countryId ?? ""} />
      <input type="hidden" name="cityId" value={cityId ?? ""} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-gray-300">
          Display Name <span className="text-h_red">*</span>
        </label>
        <input
          id="name"
          type="text"
          name="name"
          defaultValue={initialName}
          required
          maxLength={50}
          placeholder="e.g. John Doe"
          className="focus:ring-h_red rounded-lg bg-white/10 px-4 py-3 text-white placeholder-gray-500 ring-1 ring-white/20 transition-all outline-none"
        />
        <p className="text-xs text-gray-500">
          This is how other users will see you on DJcovery.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className="text-sm font-medium text-gray-300">
          Bio{" "}
          <span className="text-xs font-normal text-gray-500">(optional)</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={initialBio}
          rows={3}
          maxLength={300}
          placeholder="Tell us a bit about yourself..."
          className="focus:ring-h_red resize-none rounded-lg bg-white/10 px-4 py-3 text-white placeholder-gray-500 ring-1 ring-white/20 transition-all outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="countryId"
            className="text-sm font-medium text-gray-300"
          >
            Country{" "}
            <span className="text-xs font-normal text-gray-500">
              (optional)
            </span>
          </label>
          <select
            id="countryId"
            value={countryId ?? ""}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="focus:ring-h_red appearance-none rounded-lg bg-white/10 px-4 py-3 text-white ring-1 ring-white/20 transition-all outline-none"
          >
            <option value="" className="bg-gray-900">
              Select country...
            </option>
            {countries.map((c) => (
              <option key={c.id} value={c.id} className="bg-gray-900">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="cityId" className="text-sm font-medium text-gray-300">
            City{" "}
            <span className="text-xs font-normal text-gray-500">
              (optional)
            </span>
          </label>
          <select
            id="cityId"
            value={cityId ?? ""}
            onChange={(e) =>
              setCityId(e.target.value ? parseInt(e.target.value) : null)
            }
            disabled={!countryId || cities.length === 0}
            className="focus:ring-h_red appearance-none rounded-lg bg-white/10 px-4 py-3 text-white ring-1 ring-white/20 transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" className="bg-gray-900">
              Select city...
            </option>
            {cities.map((c) => (
              <option key={c.id} value={c.id} className="bg-gray-900">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-h_red hover:bg-h_redDark w-full rounded-lg py-3 font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Get started →"}
      </button>

      <button
        type="button"
        onClick={() => router.push("/")}
        className="text-center text-sm text-gray-500 transition-colors hover:text-gray-300"
      >
        Skip for now
      </button>
    </form>
  );
}
