"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateDjProfile, getCitiesByCountry } from "@/lib/actions/profile";
import { uploadDjAvatar, uploadDjCover } from "@/lib/actions/dj-upload";
import type { ProfileData, Country, City } from "./types";

export default function ProfileTab({
  profile,
  countries,
  initialCities,
}: {
  profile: ProfileData;
  countries: Country[];
  initialCities: City[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [stageName, setStageName] = useState(profile.stageName);
  const [bio, setBio] = useState(profile.bio);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);
  const [coverPreview, setCoverPreview] = useState(profile.coverImage);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar);
  const [coverImageUrl, setCoverImageUrl] = useState(profile.coverImage);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [countryId, setCountryId] = useState<number | null>(profile.countryId);
  const [cityId, setCityId] = useState<number | null>(profile.cityId);
  const [cities, setCities] = useState<City[]>(initialCities);
  const [loadingCities, setLoadingCities] = useState(false);

  const [email, setEmail] = useState(profile.bookingEmail);
  const [phone, setPhone] = useState(profile.bookingPhone);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadDjAvatar(fd);
    if ("error" in result) {
      toast.error(result.error);
      setAvatarPreview(profile.avatar);
    } else {
      setAvatarPreview(result.url);
      setAvatarUrl(result.url);
      toast.success("Avatar updated.");
    }
    setUploadingAvatar(false);
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    setUploadingCover(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadDjCover(fd);
    if ("error" in result) {
      toast.error(result.error);
      setCoverPreview(profile.coverImage);
    } else {
      setCoverPreview(result.url);
      setCoverImageUrl(result.url);
      toast.success("Cover image updated.");
    }
    setUploadingCover(false);
  }

  async function handleCountryChange(value: string) {
    const id = value ? Number(value) : null;
    setCountryId(id);
    setCityId(null);
    setCities([]);
    if (!id) return;
    setLoadingCities(true);
    try {
      const result = await getCitiesByCountry(id);
      setCities(result);
    } finally {
      setLoadingCities(false);
    }
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateDjProfile({
        stageName: stageName.trim(),
        bio: bio.trim() || null,
        countryId: countryId ?? undefined,
        cityId: cityId ?? undefined,
        bookingEmail: email.trim() || null,
        bookingPhone: phone.trim() || null,
        avatarUrl: avatarUrl || null,
        coverImageUrl: coverImageUrl || null,
      });
      if ("error" in result) toast.error(result.error);
      else {
        toast.success("Profile updated.");
        if (result.newSlug) router.push("/dj/settings");
        else router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Basic Info */}
      <section className="flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Basic Info</h3>
          <p className="text-xs text-gray-400">Your public DJ identity.</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Cover Image</Label>
          <div className="relative h-40 w-full overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
            {coverPreview ? (
              <Image
                src={coverPreview}
                alt="Cover"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                No cover image
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity hover:opacity-100">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
              >
                {uploadingCover ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {coverPreview ? "Change" : "Upload"}
              </Button>
            </div>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleCoverChange}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Avatar</Label>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-white/5 ring-2 ring-white/10">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <Camera className="h-6 w-6" />
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              {avatarPreview ? "Change Avatar" : "Upload Avatar"}
            </Button>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="stageName">
            Stage Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="stageName"
            value={stageName}
            onChange={(e) => setStageName(e.target.value)}
            placeholder="Your DJ name"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={800}
            placeholder="Tell fans and organizers about your style..."
            className="resize-none"
          />
          <p className="text-right text-xs text-gray-400">{bio.length}/800</p>
        </div>
      </section>

      {/* Location */}
      <section className="flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Location</h3>
          <p className="text-xs text-gray-400">Where you&apos;re based.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Country</Label>
            <Select
              value={countryId ? String(countryId) : ""}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select country..." />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>City</Label>
            {loadingCities ? (
              <div className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading cities...
              </div>
            ) : (
              <Select
                value={cityId ? String(cityId) : ""}
                onValueChange={(v) => setCityId(v ? Number(v) : null)}
                disabled={!countryId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select city..." />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Contact</h3>
          <p className="text-xs text-gray-400">How organizers can reach you.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="bookingEmail">Booking Email</Label>
            <Input
              id="bookingEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="bookings@example.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="bookingPhone">Booking Phone</Label>
            <Input
              id="bookingPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+46 70 000 0000"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending || !stageName.trim()}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
