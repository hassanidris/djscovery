"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Lock, Loader2, User, MapPin, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { updateUserProfile, uploadUserAvatar } from "@/lib/actions/account";
import { getCitiesForCountry } from "@/lib/actions/locations";

type CountryOption = { id: number; name: string };
type CityOption = { id: number; name: string };

interface Props {
  currentEmail: string;
  initialName: string;
  username: string;
  currentAvatar: string | null;
  initialCountryId: number | null;
  initialCityId: number | null;
  countries: CountryOption[];
  initialCities: CityOption[];
}

export default function ProfileSettingsForm({
  currentEmail,
  initialName,
  username,
  currentAvatar,
  initialCountryId,
  initialCityId,
  countries,
  initialCities,
}: Props) {
  const [name, setName] = useState(initialName);
  const [nameError, setNameError] = useState("");
  const [avatarSrc, setAvatarSrc] = useState<string | null>(currentAvatar);
  const [countryId, setCountryId] = useState<number | null>(initialCountryId);
  const [cityId, setCityId] = useState<number | null>(initialCityId);
  const [cities, setCities] = useState<CityOption[]>(initialCities);
  const [isPending, startTransition] = useTransition();
  const [isUploading, startUpload] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = (name || username).slice(0, 2).toUpperCase();

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

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setAvatarSrc(preview);

    const fd = new FormData();
    fd.append("file", file);

    startUpload(async () => {
      const result = await uploadUserAvatar(fd);
      if ("error" in result) {
        toast.error(result.error);
        setAvatarSrc(currentAvatar);
      } else {
        toast.success("Avatar updated.");
        setAvatarSrc(result.url);
      }
    });
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Display name is required.");
      return;
    }
    setNameError("");

    startTransition(async () => {
      const result = await updateUserProfile({
        name: trimmed,
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
      {/* Avatar */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <User className="h-4 w-4" />
            Profile Photo
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            JPG, PNG or WebP · max 5 MB
          </p>
        </div>

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white/10 focus:outline-none disabled:opacity-60"
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
                {initials}
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="border-white/20 text-gray-300 hover:bg-white/5"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                </>
              ) : (
                "Change photo"
              )}
            </Button>
            <p className="text-xs text-gray-600">
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
      </section>

      <Separator className="bg-white/8" />

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
          <Label htmlFor="name">
            Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value.trim()) setNameError("");
            }}
            placeholder="Your display name"
            maxLength={80}
            className={
              nameError ? "border-red-500 focus-visible:ring-red-500" : ""
            }
          />
          {nameError && <p className="text-xs text-red-400">{nameError}</p>}
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
              className="border-input focus:ring-ring h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm text-white shadow-sm focus:ring-1 focus:outline-none"
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
              className="border-input focus:ring-ring h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm text-white shadow-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
        <Button type="button" onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
