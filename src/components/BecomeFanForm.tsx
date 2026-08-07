"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { setupFanProfile, uploadFanAvatar } from "@/lib/actions/profile";
import { getCitiesForCountry } from "@/lib/actions/locations";

type Country = { id: number; name: string };
type City = { id: number; name: string };

const initialState = { success: false, error: null as string | null };

export default function BecomeFanForm({
  initialName,
  initialBio,
  initialAvatar = null,
  initialCountryId,
  initialCityId,
  countries,
  initialCities,
  isSettingsMode = false,
}: {
  initialName: string;
  initialBio: string;
  initialAvatar?: string | null;
  initialCountryId: number | null;
  initialCityId: number | null;
  countries: Country[];
  initialCities: City[];
  isSettingsMode?: boolean;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    setupFanProfile,
    initialState,
  );
  const [countryId, setCountryId] = useState<number | null>(initialCountryId);
  const [cityId, setCityId] = useState<number | null>(initialCityId);
  const [cities, setCities] = useState<City[]>(initialCities);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(initialAvatar);
  const [isUploading, startUpload] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cityRequestId = useRef(0);

  useEffect(() => {
    if (state.success) {
      if (isSettingsMode) {
        toast.success("Profile updated.");
        router.refresh();
      } else {
        toast.success("Profile saved! Welcome to DJcovery 🎉");
        router.push("/fan/profile");
      }
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, router, isSettingsMode]);

  async function handleCountryChange(value: string) {
    const id = value ? Number.parseInt(value, 10) : null;
    setCountryId(id);
    setCityId(null);
    setValidationError(null);
    setCities([]);
    const requestId = ++cityRequestId.current;
    if (id) {
      const fetched = await getCitiesForCountry(id);
      if (requestId === cityRequestId.current) {
        setCities(fetched);
      }
    } else {
      cityRequestId.current++;
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const previousAvatar = avatarSrc;
    const preview = URL.createObjectURL(file);
    setAvatarSrc(preview);

    const fd = new FormData();
    fd.append("file", file);

    startUpload(async () => {
      const result = await uploadFanAvatar(fd);
      if ("error" in result) {
        toast.error(result.error);
        setAvatarSrc(previousAvatar);
      } else {
        toast.success("Avatar updated.");
        setAvatarSrc(result.url);
      }
      URL.revokeObjectURL(preview);
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!countryId) {
      e.preventDefault();
      setValidationError("Please select your country.");
      return;
    }
    if (!cityId) {
      e.preventDefault();
      setValidationError("Please select your city.");
      return;
    }
    setValidationError(null);
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-5 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 sm:p-8"
    >
      <input type="hidden" name="countryId" value={countryId ?? ""} />
      <input type="hidden" name="cityId" value={cityId ?? ""} />

      {isSettingsMode && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-300">
              Profile Photo
            </h2>
            <p className="mt-0.5 text-xs text-gray-400">
              JPG, PNG or WebP · max 5 MB
            </p>
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white/10 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none disabled:opacity-60"
            >
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt="avatar"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-zinc-800 text-xl font-bold text-white">
                  {initialName.slice(0, 2).toUpperCase()}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </span>
            </button>

            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center rounded-md border border-white/20 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 disabled:opacity-60"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  "Change photo"
                )}
              </button>
              <p className="text-xs text-gray-400">
                Click the photo or button to upload
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-gray-300">
          Display Name <span className="text-h_red/80">*</span>
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
        <p className="text-xs text-gray-400">
          This is how other users will see you on DJcovery.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className="text-sm font-medium text-gray-300">
          Bio{" "}
          <span className="text-xs font-normal text-gray-400">(optional)</span>
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
            Country <span className="text-h_red/80">*</span>
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
            City <span className="text-h_red/80">*</span>
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

      {validationError && (
        <p className="text-sm text-red-400">{validationError}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-h_red hover:bg-h_redDark w-full rounded-lg py-3 font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? "Saving..."
          : isSettingsMode
            ? "Save Changes"
            : "Get started →"}
      </button>

      {!isSettingsMode && (
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-center text-sm text-gray-400 transition-colors hover:text-gray-300"
        >
          Skip for now
        </button>
      )}
    </form>
  );
}
